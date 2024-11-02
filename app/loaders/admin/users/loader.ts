import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { requireAuth } from "@/controllers/auth";
import { UserModel } from "@/models/UserModel";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAuth(request);
  
  try {
    const users = await UserModel.getAll();
    return json({ users });
  } catch (error) {
    console.error("Error loading users:", error);
    throw new Response("Failed to load users", { status: 500 });
  }
} 