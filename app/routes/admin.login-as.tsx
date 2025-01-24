import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { loginAs } from "@/controllers/auth";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const userId = formData.get("userId");

  if (!userId || typeof userId !== "string") {
    return redirect("/admin/users");
  }

  return loginAs(request, parseInt(userId, 10));
}

export function loader() {
  return redirect("/admin/users");
} 