import { guestStorage } from "./guestStorage";

export async function migrateGuestData(userId: number) {
  try {
    const wishlist = guestStorage.getWishlist();
    const compareList = guestStorage.getCompareList();
    const cart = guestStorage.getCart();

    // Migrate data in parallel
    await Promise.all([
      // Migrate wishlist items
      ...wishlist.map(productId => 
        fetch("/api/products", {
          method: "POST",
          body: JSON.stringify({ 
            intent: "toggleWishlist", 
            productId 
          })
        })
      ),
      // Migrate compare items
      ...compareList.map(productId => 
        fetch("/api/products", {
          method: "POST",
          body: JSON.stringify({ 
            intent: "toggleCompare", 
            productId 
          })
        })
      ),
      // Migrate cart items
      ...cart.map(({ productId, quantity }) => 
        fetch("/api/products", {
          method: "POST",
          body: JSON.stringify({ 
            intent: "addToCart", 
            productId,
            quantity 
          })
        })
      )
    ]);

    // Clear guest storage after successful migration
    guestStorage.clearAll();
  } catch (error) {
    console.error("Error migrating guest data:", error);
    throw error;
  }
} 