import { ActionFunctionArgs } from "@remix-run/node";
import { stopImpersonating } from "@/controllers/auth";

export async function action({ request }: ActionFunctionArgs) {
  return stopImpersonating(request);
}

export function loader() {
  return redirect("/admin/users");
} 