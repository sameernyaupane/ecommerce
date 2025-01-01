import { handleOrderAction } from "@/actions/shared/orderAction";
import type { ActionFunctionArgs } from "@remix-run/node";
import { requireVendor } from "@/controllers/auth";

export async function action({ request }: ActionFunctionArgs) {
  const { vendorDetails } = await requireVendor(request);
  const formData = await request.formData();
  return handleOrderAction(formData, vendorDetails.id);
} 