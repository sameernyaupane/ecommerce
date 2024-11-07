import { useState } from 'react';
import { guestStorage } from './guestStorage';

export function useMigrateGuestData() {
  const [state, setState] = useState<'idle' | 'migrating' | 'done'>('idle');

  const migrateData = async () => {
    if (state !== 'idle') return;
    setState('migrating');

    try {
      // Get guest data from local storage
      const cartItems = guestStorage.getCart();
      const wishlistItems = guestStorage.getWishlist();
      const compareItems = guestStorage.getCompareList();

      // Prepare form data
      const formData = new FormData();
      formData.append('intent', 'migrateData');
      formData.append('cartItems', JSON.stringify(cartItems));
      formData.append('wishlistItems', JSON.stringify(wishlistItems));
      formData.append('compareItems', JSON.stringify(compareItems));

      // Send migration request
      await fetch('/api/products', {
        method: 'POST',
        body: formData
      });

      // Clear guest storage after successful migration
      guestStorage.clearAll();
      setState('done');
    } catch (error) {
      console.error('Error migrating guest data:', error);
      setState('idle');
    }
  };

  return { migrateData, state };
} 