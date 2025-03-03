import { json, type ActionFunctionArgs } from "@remix-run/node";
import { OrderModel } from "@/models/OrderModel";
import sql from "@/database/sql";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const payload = await request.json();
  const eventType = payload.event_type;

  try {
    // Store the webhook event
    await sql`
      INSERT INTO paypal_webhook_events (
        event_id,
        create_time,
        resource_type,
        event_type,
        summary,
        status,
        event_version,
        resource_version,
        order_id,
        amount,
        currency,
        raw_data
      ) VALUES (
        ${payload.id},
        ${payload.create_time},
        ${payload.resource_type},
        ${payload.event_type},
        ${payload.summary},
        ${payload.status},
        ${payload.event_version},
        ${payload.resource_version},
        ${payload.resource.custom_id ? parseInt(payload.resource.custom_id) : null},
        ${payload.resource.amount.value},
        ${payload.resource.amount.currency_code},
        ${payload}
      )
    `;

    switch (eventType) {
      case "PAYMENT.CAPTURE.COMPLETED":
        const orderId = payload.resource.custom_id;
        const amountPaid = parseFloat(payload.resource.amount.value);
        const currency = payload.resource.amount.currency_code;

        // Get the order to verify the amount
        const order = await OrderModel.getById(parseInt(orderId));
        if (!order) {
          throw new Error(`Order ${orderId} not found`);
        }

        // Verify the amount and currency
        if (Math.abs(amountPaid - order.total_amount) > 0.01) {
          throw new Error(`Payment amount mismatch. Expected: ${order.total_amount} ${currency}, Received: ${amountPaid} ${currency}`);
        }

        if (currency !== "GBP") {
          throw new Error(`Currency mismatch. Expected: GBP, Received: ${currency}`);
        }

        // Update order status
        await OrderModel.updateStatus(parseInt(orderId), "confirmed");
        break;
      
      case "PAYMENT.CAPTURE.DENIED":
        const failedOrderId = payload.resource.custom_id;
        await OrderModel.updateStatus(parseInt(failedOrderId), "cancelled");
        break;
    }

    return json({ success: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return json({ error: error.message }, { status: 400 });
  }
} 