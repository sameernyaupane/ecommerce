import { json } from "@remix-run/node";
import { ActionFunctionArgs } from "@remix-run/node";
import { CartModel } from "@/models/CartModel";
import { WishlistModel } from "@/models/WishlistModel";
import { CompareModel } from "@/models/CompareModel";
import { requireAuth } from "@/controllers/auth";

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireAuth(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  const productId = formData.get("productId");

  if (!productId) {
    return json({ error: "Product ID is required" }, { status: 400 });
  }

  const parsedProductId = parseInt(productId.toString(), 10);

  try {
    switch (intent) {
      case "removeFromCart": {
        await CartModel.removeItem(user.id, parsedProductId);
        return json({ 
          success: true, 
          message: "Removed from cart",
          action: "removeFromCart"
        });
      }

      case "updateCartQuantity": {
        const quantity = parseInt(formData.get("quantity")?.toString() || "1", 10);
        await CartModel.updateQuantity(user.id, parsedProductId, quantity);
        return json({ 
          success: true, 
          message: "Cart updated",
          action: "updateCartQuantity"
        });
      }

      case "addToCart": {
        const quantity = parseInt(formData.get("quantity")?.toString() || "1", 10);
        await CartModel.addItem(user.id, parsedProductId, quantity);
        return json({ 
          success: true, 
          message: "Added to cart",
          action: "addToCart"
        });
      }

      case "toggleWishlist": {
        const isAdded = await WishlistModel.toggle(user.id, parsedProductId);
        return json({ 
          success: true, 
          message: isAdded ? "Added to wishlist" : "Removed from wishlist",
          action: "toggleWishlist",
          isAdded
        });
      }

      case "toggleCompare": {
        const isAdded = await CompareModel.toggle(user.id, parsedProductId);
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