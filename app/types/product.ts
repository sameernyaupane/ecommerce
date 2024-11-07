export interface ProductDetails {
  product_id: number;
  name: string;
  price: number;
  quantity?: number;
  main_image?: {
    id: number;
    image_name: string;
    is_main: boolean;
  };
} 