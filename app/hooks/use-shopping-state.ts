import { create } from 'zustand';
import { guestStorage } from '@/utils/guestStorage';

interface ShoppingState {
  wishlistCount: number;
  cartCount: number;
  cartItems: Array<{ productId: number; quantity: number; }>;
  wishlistItems: number[];
  compareItems: number[];
  
  // Actions
  addToCart: (productId: number, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateCartQuantity: (productId: number, quantity: number) => void;
  toggleWishlist: (productId: number) => boolean;
  removeFromWishlist: (productId: number) => void;
  toggleCompare: (productId: number) => boolean;
  clearAll: () => void;
  
  // Internal
  updateCounts: () => void;
  
  // Add new method to sync with backend
  syncWithBackend: () => Promise<void>;
}

export const useShoppingState = create<ShoppingState>((set, get) => ({
  wishlistCount: 0,
  cartCount: 0,
  cartItems: [],
  wishlistItems: [],
  compareItems: [],

  updateCounts: () => {
    if (typeof window === 'undefined') return;
    
    // Only use guest storage if not logged in
    const isLoggedIn = document.cookie.includes('userId='); // Basic check, adjust as needed
    
    if (!isLoggedIn) {
      const wishlistItems = guestStorage.getWishlist();
      const cartItems = guestStorage.getCart();
      const compareItems = guestStorage.getCompareList();
      
      set({
        wishlistCount: wishlistItems.length,
        cartCount: cartItems.length,
        cartItems,
        wishlistItems,
        compareItems
      });
    }
  },

  syncWithBackend: async () => {
    try {
      const response = await fetch('/api/products?type=all');
      if (!response.ok) {
        throw new Error('Failed to fetch shopping data');
      }

      const data = await response.json();
      
      set({
        cartItems: data.cart.items,
        cartCount: data.cart.items.length,
        wishlistItems: data.wishlist.items,
        wishlistCount: data.wishlist.items.length,
        compareItems: data.compare.items
      });
    } catch (error) {
      console.error('Failed to sync with backend:', error);
    }
  },

  addToCart: (productId: number, quantity = 1) => {
    if (typeof window === 'undefined') return;
    guestStorage.addToCart(productId, quantity);
    get().updateCounts();
  },

  removeFromCart: (productId: number) => {
    if (typeof window === 'undefined') return;
    guestStorage.removeFromCart(productId);
    get().updateCounts();
  },

  updateCartQuantity: (productId: number, quantity: number) => {
    if (typeof window === 'undefined') return;
    guestStorage.updateQuantity(productId, quantity);
    get().updateCounts();
  },

  toggleWishlist: (productId: number) => {
    if (typeof window === 'undefined') return false;
    const isInWishlist = get().wishlistItems.includes(productId);
    if (isInWishlist) {
      guestStorage.removeFromWishlist(productId);
    } else {
      guestStorage.addToWishlist(productId);
    }
    get().updateCounts();
    return !isInWishlist;
  },

  removeFromWishlist: (productId: number) => {
    if (typeof window === 'undefined') return;
    guestStorage.removeFromWishlist(productId);
    get().updateCounts();
  },

  toggleCompare: (productId: number) => {
    if (typeof window === 'undefined') return false;
    const isAdded = guestStorage.toggleCompare(productId);
    get().updateCounts();
    return isAdded;
  },

  clearAll: () => {
    if (typeof window === 'undefined') return;
    guestStorage.clearAll();
    get().updateCounts();
  }
}));

// Initialize counts when the app loads (client-side only)
if (typeof window !== 'undefined') {
  useShoppingState.getState().updateCounts();
  
  // Listen for storage events
  window.addEventListener('local-storage', () => {
    useShoppingState.getState().updateCounts();
  });
  window.addEventListener('storage', () => {
    useShoppingState.getState().updateCounts();
  });
} 