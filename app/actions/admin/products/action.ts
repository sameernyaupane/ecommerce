import { handleProductAction } from "@/actions/shared/productAction";
import type { ActionFunctionArgs } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  return handleProductAction(formData);
}
