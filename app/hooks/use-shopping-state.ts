import { create } from 'zustand';
import { guestStorage } from '@/utils/guestStorage';

interface ShoppingState {
  // State
  wishlistCount: number;
  cartCount: number;
  cartItems: Array<{ productId: number; quantity: number; }>;
  wishlistItems: number[];
  compareItems: number[];
  isAuthenticated: boolean;
  lastSync: number | null;
  cartDetails: Array<{
    productId: number;
    quantity: number;
    name: string;
    price: number;
    mainImage?: {
      id: number;
      image_name: string;
      is_main: boolean;
    };
  }>;
  wishlistDetails: Array<{
    productId: number;
    name: string;
    price: number;
    mainImage?: {
      id: number;
      image_name: string;
      is_main: boolean;
    };
  }>;
  
  // Actions
  addToCart: (productId: number, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateCartQuantity: (productId: number, quantity: number) => void;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  addToCompare: (productId: number) => Promise<void>;
  removeFromCompare: (productId: number) => Promise<void>;
  clearAll: () => void;
  fetchCartDetails: () => Promise<void>;
  fetchWishlistDetails: () => Promise<void>;
  
  // Internal
  updateCounts: () => void;
  syncWithBackend: () => Promise<void>;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  reset: () => void;
}

const submitFormData = async (intent: string, productId: number, quantity?: number) => {
  const formData = new FormData();
  formData.append('intent', intent);
  formData.append('productId', productId.toString());
  if (quantity !== undefined) {
    formData.append('quantity', quantity.toString());
  }

  const response = await fetch('/api/products', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to process request');
  }
  return response.json();
};

export const useShoppingState = create<ShoppingState>((set, get) => ({
  wishlistCount: 0,
  cartCount: 0,
  cartItems: [],
  wishlistItems: [],
  compareItems: [],
  isAuthenticated: false,
  lastSync: null,
  cartDetails: [],
  wishlistDetails: [],

  setIsAuthenticated: (isAuthenticated: boolean) => {
    if (!isAuthenticated) {
      set({
        isAuthenticated: false,
        wishlistCount: 0,
        cartCount: 0,
        cartItems: [],
        wishlistItems: [],
        compareItems: [],
        lastSync: null,
        cartDetails: [],
        wishlistDetails: []
      });
      get().updateCounts();
    } else {
      set({ isAuthenticated });
      get().syncWithBackend();
    }
  },

  updateCounts: () => {
    if (typeof window === 'undefined') return;
    
    const { isAuthenticated } = get();
    
    if (!isAuthenticated) {
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

      if (cartItems.length > 0) {
        get().fetchCartDetails();
      }
      if (wishlistItems.length > 0) {
        get().fetchWishlistDetails();
      }
    }
  },

  syncWithBackend: async () => {
    const { isAuthenticated, lastSync } = get();
    
    if (!isAuthenticated) return;
    
    const now = Date.now();
    if (lastSync && now - lastSync < 2000) {
      return;
    }

    try {
      const response = await fetch('/api/products?type=all');
      if (!response.ok) {
        throw new Error('Failed to fetch shopping data');
      }

      const data = await response.json();
      
      set({
        cartItems: data.cart.items || [],
        cartCount: (data.cart.items || []).length,
        wishlistItems: data.wishlist.items || [],
        wishlistCount: (data.wishlist.items || []).length,
        compareItems: data.compare.items || [],
        lastSync: now
      });

      if (data.cart.items?.length > 0) {
        await get().fetchCartDetails();
      }
      if (data.wishlist.items?.length > 0) {
        await get().fetchWishlistDetails();
      }
    } catch (error) {
      console.error('Failed to sync with backend:', error);
    }
  },

  addToCart: async (productId: number, quantity = 1) => {
    if (typeof window === 'undefined') return;
    const { isAuthenticated, cartItems } = get();

    if (isAuthenticated) {
      set({
        cartItems: [...cartItems, { productId, quantity }],
        cartCount: cartItems.length + 1,
      });
      await submitFormData('addToCart', productId, quantity);
      await get().syncWithBackend();
    } else {
      guestStorage.addToCart(productId, quantity);
      const cart = guestStorage.getCart();
      set({ 
        cartCount: cart.length,
        cartItems: cart,
        cartDetails: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          name: '',
          price: 0,
          mainImage: undefined
        }))
      });
      await get().fetchCartDetails();
    }
  },

  removeFromCart: async (productId: number) => {
    if (typeof window === 'undefined') return;
    const { isAuthenticated, cartItems } = get();

    if (isAuthenticated) {
      set({
        cartItems: cartItems.filter(item => item.productId !== productId),
        cartCount: cartItems.length - 1,
        cartDetails: get().cartDetails.filter(item => item.productId !== productId),
      });
      await submitFormData('removeFromCart', productId);
      await get().syncWithBackend();
    } else {
      guestStorage.removeFromCart(productId);
      const cart = guestStorage.getCart();
      set({ 
        cartCount: cart.length,
        cartItems: cart,
        cartDetails: get().cartDetails.filter(item => item.productId !== productId)
      });
    }
  },

  updateCartQuantity: async (productId: number, quantity: number) => {
    if (typeof window === 'undefined') return;
    const { isAuthenticated, cartItems } = get();

    if (isAuthenticated) {
      set({
        cartItems: cartItems.map(item =>
          item.productId === productId ? { ...item, quantity } : item
        ),
        cartDetails: get().cartDetails.map(item =>
          item.productId === productId ? { ...item, quantity } : item
        ),
      });
      await submitFormData('updateCartQuantity', productId, quantity);
      await get().syncWithBackend();
    } else {
      guestStorage.updateQuantity(productId, quantity);
      const cart = guestStorage.getCart();
      set({ 
        cartCount: cart.length,
        cartItems: cart,
        cartDetails: get().cartDetails.map(item =>
          item.productId === productId 
            ? { ...item, quantity }
            : item
        )
      });
    }
  },

  addToWishlist: async (productId: number) => {
    if (typeof window === 'undefined') return;
    const { isAuthenticated, wishlistItems } = get();

    if (isAuthenticated) {
      set({
        wishlistItems: [...wishlistItems, productId],
        wishlistCount: wishlistItems.length + 1,
      });
      await submitFormData('addToWishlist', productId);
      await get().syncWithBackend();
    } else {
      guestStorage.addToWishlist(productId);
      const wishlist = guestStorage.getWishlist();
      set({ 
        wishlistCount: wishlist.length,
        wishlistItems: wishlist,
        wishlistDetails: [...get().wishlistDetails, {
          productId,
          name: '',
          price: 0,
          mainImage: undefined
        }]
      });
      await get().fetchWishlistDetails();
    }
  },

  removeFromWishlist: async (productId: number) => {
    if (typeof window === 'undefined') return;
    const { isAuthenticated, wishlistItems } = get();

    if (isAuthenticated) {
      set({
        wishlistItems: wishlistItems.filter(id => id !== productId),
        wishlistCount: wishlistItems.length - 1,
        wishlistDetails: get().wishlistDetails.filter(item => item.productId !== productId),
      });
      await submitFormData('removeFromWishlist', productId);
      await get().syncWithBackend();
    } else {
      guestStorage.removeFromWishlist(productId);
      const wishlist = guestStorage.getWishlist();
      set({ 
        wishlistCount: wishlist.length,
        wishlistItems: wishlist,
        wishlistDetails: get().wishlistDetails.filter(item => item.productId !== productId)
      });
    }
  },

  addToCompare: async (productId: number) => {
    if (typeof window === 'undefined') return;
    const { isAuthenticated } = get();

    if (isAuthenticated) {
      await submitFormData('addToCompare', productId);
      await get().syncWithBackend();
    } else {
      guestStorage.addToCompare(productId);
      get().updateCounts();
    }
  },

  removeFromCompare: async (productId: number) => {
    if (typeof window === 'undefined') return;
    const { isAuthenticated } = get();

    if (isAuthenticated) {
      await submitFormData('removeFromCompare', productId);
      await get().syncWithBackend();
    } else {
      guestStorage.removeFromCompare(productId);
      get().updateCounts();
    }
  },

  clearAll: async () => {
    if (typeof window === 'undefined') return;
    const { isAuthenticated } = get();

    if (isAuthenticated) {
      await submitFormData('clearAll');
      await get().syncWithBackend();
    } else {
      guestStorage.clearAll();
      get().updateCounts();
    }
  },

  fetchCartDetails: async () => {
    const { cartItems } = get();
    
    if (!cartItems.length) {
      set({ cartDetails: [] });
      return;
    }

    const productIds = cartItems.map(item => item.productId);
    const response = await fetch(`/api/products?type=details&ids=${productIds.join(',')}`);
    if (!response.ok) {
      throw new Error('Failed to fetch cart details');
    }
    const data = await response.json();
    
    const cartDetails = data.items.map(item => {
      const localItem = cartItems.find(i => i.productId === item.product_id);
      return {
        ...item,
        productId: item.product_id,
        quantity: localItem?.quantity || 1
      };
    });
    
    set({ cartDetails });
  },

  fetchWishlistDetails: async () => {
    const { wishlistItems } = get();
    
    if (!wishlistItems.length) {
      set({ wishlistDetails: [] });
      return;
    }

    const response = await fetch(`/api/products?type=details&ids=${wishlistItems.join(',')}`);
    if (!response.ok) {
      throw new Error('Failed to fetch wishlist details');
    }
    const data = await response.json();
    
    const wishlistDetails = data.items.map(item => ({
      ...item,
      productId: item.product_id
    }));
    
    set({ wishlistDetails });
  },

  reset: () => {
    if (typeof window !== 'undefined') {
      guestStorage.clearAll();
    }
    
    set({
      wishlistCount: 0,
      cartCount: 0,
      cartItems: [],
      wishlistItems: [],
      compareItems: [],
      isAuthenticated: false,
      lastSync: null,
      cartDetails: [],
      wishlistDetails: []
    });
  },
}));

if (typeof window !== 'undefined') {
  const state = useShoppingState.getState();
  if (!state.isAuthenticated) {
    state.updateCounts();
  }
  
  window.addEventListener('local-storage', () => {
    const state = useShoppingState.getState();
    if (!state.isAuthenticated) {
      state.updateCounts();
    }
  });
} 