import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { OrderModel, type OrderStatus } from "@/models/OrderModel";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent")?.toString();

  if (intent === "updateStatus") {
    const orderId = formData.get("orderId")?.toString();
    const status = formData.get("status")?.toString() as OrderStatus;

    if (!orderId || !status) {
      return json({ error: "Invalid order ID or status" }, { status: 400 });
    }

    try {
      await OrderModel.updateStatus(parseInt(orderId, 10), status);
      return json({ success: true });
    } catch (error) {
      console.error("Error updating order status:", error);
      return json({ error: "Failed to update order status" }, { status: 500 });
    }
  }

  return json({ error: "Invalid intent" }, { status: 400 });
} 