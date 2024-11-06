import { guestStorage } from "./guestStorage";
import { useFetcher } from "@remix-run/react";

export function useMigrateGuestData() {
  const fetcher = useFetcher();

  const migrateData = async () => {
    console.log("Starting migration..."); // Debug log
    if (typeof window === 'undefined') return;

    try {
      const wishlist = guestStorage.getWishlist();
      const compareList = guestStorage.getCompareList();
      const cart = guestStorage.getCart();

      console.log("Guest data:", { wishlist, compareList, cart }); // Debug log

      // Only proceed if there's data to migrate
      if (wishlist.length === 0 && compareList.length === 0 && cart.length === 0) {
        console.log("No data to migrate");
        return;
      }

      // Migrate data in parallel
      await Promise.all([
        // Migrate wishlist items
        ...wishlist.map(productId => {
          const formData = new FormData();
          formData.append('intent', 'toggleWishlist');
          formData.append('productId', productId.toString());
          
          return fetcher.submit(formData, {
            method: "post",
            action: "/api/products"
          });
        }),
        
        // Migrate compare items
        ...compareList.map(productId => {
          const formData = new FormData();
          formData.append('intent', 'toggleCompare');
          formData.append('productId', productId.toString());
          
          return fetcher.submit(formData, {
            method: "post",
            action: "/api/products"
          });
        }),
        
        // Migrate cart items
        ...cart.map(({ productId, quantity }) => {
          const formData = new FormData();
          formData.append('intent', 'addToCart');
          formData.append('productId', productId.toString());
          formData.append('quantity', quantity.toString());
          
          return fetcher.submit(formData, {
            method: "post",
            action: "/api/products"
          });
        })
      ]);

      console.log("Migration completed"); // Debug log
      // Clear guest storage after successful migration
      guestStorage.clearAll();
    } catch (error) {
      console.error("Error migrating guest data:", error);
    }
  };

  return { migrateData, state: fetcher.state };
} 