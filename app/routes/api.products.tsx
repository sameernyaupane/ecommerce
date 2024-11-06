import { json } from "@remix-run/node";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { CartModel } from "@/models/CartModel";
import { WishlistModel } from "@/models/WishlistModel";
import { CompareModel } from "@/models/CompareModel";
import { requireAuth } from "@/controllers/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireAuth(request);
  const url = new URL(request.url);
  const type = url.searchParams.get("type");

  try {
    switch (type) {
      case "cart": {
        const items = await CartModel.getItems(userId);
        return json({ items });
      }
      case "wishlist": {
        const items = await WishlistModel.getItems(userId);
        return json({ items });
      }
      case "compare": {
        const items = await CompareModel.getItems(userId);
        return json({ items });
      }
      case "all": {
        const [cart, wishlist, compare] = await Promise.all([
          CartModel.getItems(userId),
          WishlistModel.getItems(userId),
          CompareModel.getItems(userId)
        ]);
        return json({
          cart: { items: cart },
          wishlist: { items: wishlist },
          compare: { items: compare }
        });
      }
      default:
        return json({ error: "Invalid type parameter" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error fetching shopping data:", error);
    return json({ 
      error: "Failed to fetch data",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireAuth(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  const productId = formData.get("productId");
  const isMigration = formData.get("isMigration") === "true";

  if (!productId) {
    return json({ error: "Product ID is required" }, { status: 400 });
  }

  const parsedProductId = parseInt(productId.toString(), 10);

  try {
    switch (intent) {
      case "removeFromCart": {
        await CartModel.removeItem(userId, parsedProductId);
        return json({ 
          success: true, 
          message: "Removed from cart",
          action: "removeFromCart"
        });
      }

      case "updateCartQuantity": {
        const quantity = parseInt(formData.get("quantity")?.toString() || "1", 10);
        await CartModel.updateQuantity(userId, parsedProductId, quantity);
        return json({ 
          success: true, 
          message: "Cart updated",
          action: "updateCartQuantity"
        });
      }

      case "addToCart": {
        const quantity = parseInt(formData.get("quantity")?.toString() || "1", 10);
        if (isMigration) {
          await CartModel.addOrMerge(userId, parsedProductId, quantity);
          return json({ 
            success: true, 
            message: "Added to cart during migration",
            action: "addToCart"
          });
        }
        await CartModel.addItem(userId, parsedProductId, quantity);
        return json({ 
          success: true, 
          message: "Added to cart",
          action: "addToCart"
        });
      }

      case "toggleWishlist": {
        if (isMigration) {
          await WishlistModel.add(userId, parsedProductId);
          return json({ 
            success: true, 
            message: "Added to wishlist",
            action: "addToWishlist",
            isAdded: true
          });
        }
        const isAdded = await WishlistModel.toggle(userId, parsedProductId);
        return json({ 
          success: true, 
          message: isAdded ? "Added to wishlist" : "Removed from wishlist",
          action: "toggleWishlist",
          isAdded
        });
      }

      case "toggleCompare": {
        if (isMigration) {
          await CompareModel.add(userId, parsedProductId);
          return json({ 
            success: true, 
            message: "Added to compare",
            action: "addToCompare",
            isAdded: true
          });
        }
        const isAdded = await CompareModel.toggle(userId, parsedProductId);
        return json({ 
          success: true, 
          message: isAdded ? "Added to compare" : "Removed from compare",
          action: "toggleCompare",
          isAdded
        });
      }

      default:
        return json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Product action error:", error);
    return json({ 
      error: "Failed to process request",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 