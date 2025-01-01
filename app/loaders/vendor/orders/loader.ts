import type { LoaderFunctionArgs } from "@remix-run/node";
import { requireVendor } from "@/controllers/auth";
import { handleOrderLoader } from "@/loaders/shared/orderLoader";

export async function loader({ request }: LoaderFunctionArgs) {
  const { vendorDetails } = await requireVendor(request);
  return handleOrderLoader(request, vendorDetails.id);
} 