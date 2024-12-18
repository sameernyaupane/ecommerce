import { json, type ActionFunctionArgs } from "@remix-run/node";
import { PayPalService } from "@/services/paypal.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const { amount } = await request.json();

  try {
    const order = await PayPalService.createOrder(amount);
    return json(order);
  } catch (error: any) {
    return json(
      { error: error.message || "Failed to create PayPal order" },
      { status: 500 }
    );
  }
} 