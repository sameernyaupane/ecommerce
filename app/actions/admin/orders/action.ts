import { handleOrderAction } from "@/actions/shared/orderAction";
import type { ActionFunctionArgs } from "@remix-run/node";
import { requireRole } from "@/controllers/auth";

export async function action({ request }: ActionFunctionArgs) {
  await requireRole(['admin'])(request);
  const formData = await request.formData();
  return handleOrderAction(formData);
} 