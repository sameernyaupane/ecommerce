import { json } from "@remix-run/node";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { CartModel } from "@/models/CartModel";
import { WishlistModel } from "@/models/WishlistModel";
import { CompareModel } from "@/models/CompareModel";
import { ProductModel } from "@/models/ProductModel";
import { requireAuth } from "@/controllers/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const id = url.searchParams.get("id");

  try {
    if (type === "details" && id) {
      const product = await ProductModel.findById(Number(id));
      if (!product) {
        return json({ error: "Product not found" }, { status: 404 });
      }
      return json({ product });
    } else if (type === "details") {
      const ids = url.searchParams.get("ids")?.split(",").map(Number);
      if (!ids?.length) {
        return json({ items: [] });
      }

      const items = await ProductModel.getDetailsByIds(ids);
      return json({ items });
    }

    // All other routes require authentication
    const user = await requireAuth(request);

    switch (type) {
      case "cart": {
        const items = await CartModel.getItemsWithDetails(user.id);
        return json({ items });
      }
      case "wishlist": {
        const items = await WishlistModel.getItemsWithDetails(user.id);
        return json({ items });
      }
      case "compare": {
        const items = await CompareModel.getItems(user.id);
        return json({ items });
      }
      case "all": {
        const [cartItems, wishlistItems] = await Promise.all([
          CartModel.getItems(user.id),
          WishlistModel.getItems(user.id),
        ]);

        console.log('cartItems', cartItems);

        return json({
          cart: { 
            items: cartItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity
            }))
          },
          wishlist: { 
            items: wishlistItems.map(item => item.productId)
          },
          compare: { 
            items: [] // Currently not implemented
          }
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
  const user = await requireAuth(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  const isMigration = formData.get("isMigration") === "true";

  try {
    switch (intent) {
      case "migrateData": {
        const cartItems = JSON.parse(formData.get("cartItems")?.toString() || "[]");
        const wishlistItems = JSON.parse(formData.get("wishlistItems")?.toString() || "[]");
        const compareItems = JSON.parse(formData.get("compareItems")?.toString() || "[]");

        await Promise.all([
          CartModel.migrateItems(user.id, cartItems),
          WishlistModel.migrateItems(user.id, wishlistItems),
          CompareModel.migrateItems(user.id, compareItems)
        ]);

        return json({ 
          success: true, 
          message: "Data migrated successfully",
          action: "migrateData"
        });
      }

      case "removeFromCart": {
        const productId = parseInt(formData.get("productId")?.toString() || "0", 10);
        await CartModel.removeItem(user.id, productId);
        return json({ 
          success: true, 
          message: "Removed from cart",
          action: "removeFromCart"
        });
      }

      case "updateCartQuantity": {
        const productId = parseInt(formData.get("productId")?.toString() || "0", 10);
        const quantity = parseInt(formData.get("quantity")?.toString() || "1", 10);
        await CartModel.updateQuantity(user.id, productId, quantity);
        return json({ 
          success: true, 
          message: "Cart updated",
          action: "updateCartQuantity"
        });
      }

      case "addToCart": {
        const productId = parseInt(formData.get("productId")?.toString() || "0", 10);
        const quantity = parseInt(formData.get("quantity")?.toString() || "1", 10);
        await CartModel.addItem(user.id, productId, quantity);
        return json({ 
          success: true, 
          message: "Added to cart",
          action: "addToCart"
        });
      }

      case "addToWishlist": {
        const productId = parseInt(formData.get("productId")?.toString() || "0", 10);
        await WishlistModel.add(user.id, productId);
        return json({ 
          success: true, 
          message: "Added to wishlist",
          action: "addToWishlist"
        });
      }

      case "removeFromWishlist": {
        const productId = parseInt(formData.get("productId")?.toString() || "0", 10);
        await WishlistModel.remove(user.id, productId);
        return json({ 
          success: true, 
          message: "Removed from wishlist",
          action: "removeFromWishlist"
        });
      }

      case "addToCompare": {
        const productId = parseInt(formData.get("productId")?.toString() || "0", 10);
        await CompareModel.add(user.id, productId);
        return json({ 
          success: true, 
          message: "Added to compare",
          action: "addToCompare"
        });
      }

      case "removeFromCompare": {
        const productId = parseInt(formData.get("productId")?.toString() || "0", 10);
        await CompareModel.remove(user.id, productId);
        return json({ 
          success: true, 
          message: "Removed from compare",
          action: "removeFromCompare"
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