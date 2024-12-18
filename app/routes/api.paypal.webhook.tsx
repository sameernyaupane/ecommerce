import { json, type ActionFunctionArgs } from "@remix-run/node";
import { OrderModel } from "@/models/OrderModel";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const payload = await request.json();
  const eventType = payload.event_type;

  switch (eventType) {
    case "PAYMENT.CAPTURE.COMPLETED":
      const orderId = payload.resource.custom_id;
      await OrderModel.updateStatus(parseInt(orderId), "confirmed");
      break;
    
    case "PAYMENT.CAPTURE.DENIED":
      const failedOrderId = payload.resource.custom_id;
      await OrderModel.updateStatus(parseInt(failedOrderId), "cancelled");
      break;
  }

  return json({ success: true });
} 