import { useFetcher } from "@remix-run/react";
import { useCallback, useState } from "react";
import { guestStorage } from "./guestStorage";

export function useMigrateGuestData() {
  const fetcher = useFetcher();
  const [state, setState] = useState<'idle' | 'submitting' | 'complete'>('idle');

  const migrateData = useCallback(async () => {
    setState('submitting');
    
    try {
      // Get all guest data
      const cartItems = guestStorage.getCart();
      const wishlistItems = guestStorage.getWishlist();
      const compareItems = guestStorage.getCompareList();

      // Migrate cart items
      for (const item of cartItems) {
        await fetcher.submit(
          {
            intent: 'addToCart',
            productId: item.productId.toString(),
            quantity: item.quantity.toString(),
            isMigration: 'true'
          },
          { method: 'POST', action: '/api/products' }
        );
      }

      // Migrate wishlist items
      for (const productId of wishlistItems) {
        await fetcher.submit(
          {
            intent: 'toggleWishlist',
            productId: productId.toString(),
            isMigration: 'true'
          },
          { method: 'POST', action: '/api/products' }
        );
      }

      // Migrate compare items
      for (const productId of compareItems) {
        await fetcher.submit(
          {
            intent: 'toggleCompare',
            productId: productId.toString(),
            isMigration: 'true'
          },
          { method: 'POST', action: '/api/products' }
        );
      }

      // Clear guest storage after successful migration
      guestStorage.clearAll();
      
      // Update state to complete
      setState('complete');
    } catch (error) {
      console.error('Migration failed:', error);
      setState('idle');
    }
  }, [fetcher]);

  return { migrateData, state };
} 