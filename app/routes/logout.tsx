import { redirect } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { logout } from "@/controllers/auth";

export async function action({ request }: ActionFunctionArgs) {
  const response = await logout(request);
  
  // Add the X-Logout header to trigger the reset
  return new Response(null, {
    status: 302,
    headers: {
      ...response.headers,
      Location: "/login",
      "X-Logout": "true"
    }
  });
}

export async function loader() {
  return redirect("/login");
} 