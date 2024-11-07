export interface CartItem {
  productId: number;
  quantity: number;
  name: string;
  price: number;
  mainImage?: {
    id: number;
    image_name: string;
    is_main: boolean;
  };
}

export interface WishlistItem {
  productId: number;
  name: string;
  price: number;
  mainImage?: {
    id: number;
    image_name: string;
    is_main: boolean;
  };
} 