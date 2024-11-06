import { json } from "@remix-run/node";
import { requireAuth } from "@/controllers/auth";
import { WishlistModel } from "@/models/WishlistModel";
import { CompareModel } from "@/models/CompareModel";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireAuth(request);
  const url = new URL(request.url);
  const productId = Number(url.searchParams.get("productId"));

  if (!productId) {
    return json({ error: "Product ID is required" }, { status: 400 });
  }

  try {
    const [isInWishlist, isInCompare] = await Promise.all([
      WishlistModel.isInWishlist(userId, productId),
      CompareModel.isInCompare(userId, productId)
    ]);

    return json({
      isInWishlist,
      isInCompare
    });
  } catch (error) {
    console.error("Error checking product status:", error);
    return json({ error: "Failed to check product status" }, { status: 500 });
  }
} 