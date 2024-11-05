import { z } from "zod";

const STORAGE_KEYS = {
  WISHLIST: 'guest_wishlist',
  COMPARE: 'guest_compare',
  CART: 'guest_cart'
} as const;

const cartItemSchema = z.object({
  productId: z.number(),
  quantity: z.number().min(1)
});

export type CartItem = z.infer<typeof cartItemSchema>;

export const guestStorage = {
  getWishlist: (): number[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    return stored ? JSON.parse(stored) : [];
  },

  getCompareList: (): number[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.COMPARE);
    return stored ? JSON.parse(stored) : [];
  },

  getCart: (): CartItem[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.CART);
    return stored ? JSON.parse(stored) : [];
  },

  toggleWishlist: (productId: number): boolean => {
    const wishlist = guestStorage.getWishlist();
    const exists = wishlist.includes(productId);
    
    const newWishlist = exists 
      ? wishlist.filter(id => id !== productId)
      : [...wishlist, productId];
    
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(newWishlist));
    return !exists;
  },

  toggleCompare: (productId: number): boolean => {
    const compareList = guestStorage.getCompareList();
    const exists = compareList.includes(productId);
    
    const newCompareList = exists 
      ? compareList.filter(id => id !== productId)
      : [...compareList, productId];
    
    localStorage.setItem(STORAGE_KEYS.COMPARE, JSON.stringify(newCompareList));
    return !exists;
  },

  addToCart: (productId: number, quantity: number = 1) => {
    const cart = guestStorage.getCart();
    const existingItem = cart.find(item => item.productId === productId);
    
    const newCart = existingItem
      ? cart.map(item => 
          item.productId === productId 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      : [...cart, { productId, quantity }];
    
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(newCart));
  },

  clearAll: () => {
    localStorage.removeItem(STORAGE_KEYS.WISHLIST);
    localStorage.removeItem(STORAGE_KEYS.COMPARE);
    localStorage.removeItem(STORAGE_KEYS.CART);
  }
}; 