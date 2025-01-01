import { handleProductAction } from "@/actions/shared/productAction";
import type { ActionFunctionArgs } from "@remix-run/node";
import { requireVendor } from "@/controllers/auth";

export async function action({ request }: ActionFunctionArgs) {
  const { vendorDetails } = await requireVendor(request);
  console.log("vendorDetails", vendorDetails);
  const formData = await request.formData();
  return handleProductAction(formData, vendorDetails.id);
}
