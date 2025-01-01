import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { OrderModel, type OrderStatus } from "@/models/OrderModel";

export async function handleOrderAction(formData: FormData, vendorId?: number) {
  const intent = formData.get("intent")?.toString();

  if (intent === "updateStatus") {
    const orderId = formData.get("orderId")?.toString();
    const status = formData.get("status")?.toString() as OrderStatus;

    if (!orderId || !status) {
      return json({ error: "Invalid order ID or status" }, { status: 400 });
    }

    try {
      // If vendorId is provided, verify the order belongs to the vendor
      if (vendorId) {
        const order = await OrderModel.findById(parseInt(orderId, 10));
        if (!order || order.vendor_id !== vendorId) {
          return json({ error: "Order not found" }, { status: 404 });
        }
      }

      await OrderModel.updateStatus(parseInt(orderId, 10), status);
      return json({ success: true });
    } catch (error) {
      console.error("Error updating order status:", error);
      return json({ error: "Failed to update order status" }, { status: 500 });
    }
  }

  return json({ error: "Invalid intent" }, { status: 400 });
} 