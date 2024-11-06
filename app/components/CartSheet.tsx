import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useFetcher, Link } from "@remix-run/react";
import { ShoppingCart, XCircle, Minus, Plus } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useShoppingState } from '@/hooks/use-shopping-state';

interface CartItem {
  productId: number;
  quantity: number;
  name: string;
  price: number;
  image: string;
}

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAuthenticated?: boolean;
}

export function CartSheet({ open, onOpenChange, isAuthenticated = false }: CartSheetProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const productFetcher = useFetcher();
  const { removeFromCart, updateCartQuantity, cartItems: stateCartItems } = useShoppingState();

  useEffect(() => {
    if (open) {
      if (stateCartItems.length > 0) {
        const productIds = stateCartItems.map(item => item.productId).join(",");
        productFetcher.load(`/api/cart?productIds=${productIds}`);
      } else {
        setCartItems([]);
      }
    }
  }, [open, stateCartItems]);

  useEffect(() => {
    if (productFetcher.data?.products && open) {
      const enrichedItems = stateCartItems.map(item => {
        const product = productFetcher.data.products.find(p => p.id === item.productId);
        if (!product) return null;

        const mainImage = product.gallery_images.find(img => img.is_main) || product.gallery_images[0];
        
        return {
          productId: item.productId,
          quantity: item.quantity,
          name: product.name,
          price: product.price,
          image: mainImage 
            ? `/uploads/products/${mainImage.image_name}`
            : '/images/product-placeholder.jpg'
        };
      }).filter((item): item is NonNullable<typeof item> => item !== null);

      setCartItems(enrichedItems);
    }
  }, [productFetcher.data, open, stateCartItems]);

  const removeItem = async (productId: number) => {
    if (!isAuthenticated) {
      removeFromCart(productId);
      setCartItems(prev => prev.filter(item => item.productId !== productId));
      return;
    }

    const formData = new FormData();
    formData.append("intent", "removeFromCart");
    formData.append("productId", productId.toString());

    try {
      await productFetcher.submit(formData, {
        method: "POST",
        action: "/api/products"
      });
      setCartItems(prev => prev.filter(item => item.productId !== productId));
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  const updateQuantity = async (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    if (!isAuthenticated) {
      updateCartQuantity(productId, newQuantity);
      setCartItems(prev => prev.map(item => 
        item.productId === productId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
      return;
    }

    const formData = new FormData();
    formData.append("intent", "updateCartQuantity");
    formData.append("productId", productId.toString());
    formData.append("quantity", newQuantity.toString());

    try {
      await productFetcher.submit(formData, {
        method: "POST",
        action: "/api/products"
      });
      setCartItems(prev => prev.map(item => 
        item.productId === productId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    } catch (error) {
      console.error("Error updating cart quantity:", error);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full sm:max-w-lg p-0">
        <SheetHeader className="space-y-2.5 p-6 pb-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Cart ({cartItems.length})
            </SheetTitle>
          </div>
          <SheetDescription>
            Review your items before checking out.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6 px-6">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
              <ShoppingCart className="w-12 h-12 mb-4" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div 
                  key={item.productId}
                  className="flex gap-4 border-b pb-4"
                >
                  <Link 
                    to={`/product/${item.productId}`}
                    onClick={() => onOpenChange(false)}
                    className="shrink-0"
                  >
                    <img 
                      src={item.image}
                      alt={item.name}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between items-start">
                      <Link
                        to={`/product/${item.productId}`}
                        onClick={() => onOpenChange(false)}
                        className="font-medium hover:underline line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary p-1.5 transition-colors ml-2 group"
                        aria-label="Remove item"
                      >
                        <XCircle 
                          className="h-5 w-5 transition-transform duration-200 group-hover:scale-125" 
                        />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-1 rounded-full hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors group"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4 transition-transform duration-200 group-hover:scale-125" />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-1 rounded-full hover:bg-secondary transition-colors group"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4 transition-transform duration-200 group-hover:scale-125" />
                        </button>
                      </div>

                      <div className="flex items-center">
                        <p className="text-sm text-muted-foreground w-24 text-right">
                          × {formatPrice(item.price)}
                        </p>
                        <p className="font-medium w-24 text-right">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t p-6">
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between">
                <span className="font-medium">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Shipping and taxes calculated at checkout
              </p>
            </div>
            
            <Button 
              asChild
              className="w-full"
            >
              <Link to="/checkout">Checkout</Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
} 