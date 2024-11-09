import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { UserModel } from "@/models/UserModel";
import { requireRole } from "@/controllers/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireRole(['admin'])(request);
  
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page")) || 1;
  const sort = url.searchParams.get("sort") || "id";
  const direction = (url.searchParams.get("direction") || "asc") as "asc" | "desc";

  try {
    const { users, totalUsers, totalPages } = await UserModel.getPaginated({
      page,
      sort,
      direction,
    });

    return json({
      users,
      totalUsers,
      totalPages,
    });
  } catch (error) {
    console.error("Error loading users:", error);
    throw new Error("Failed to load users");
  }
} 