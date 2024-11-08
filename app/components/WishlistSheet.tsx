import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useFetcher, Link } from "@remix-run/react";
import { Heart, XCircle, ShoppingCart } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useShoppingState } from '@/hooks/use-shopping-state';
import { ProductDetails } from "@/types/product";
import { QuantityControls } from "./QuantityControls";

interface WishlistSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WishlistSheet({ open, onOpenChange }: WishlistSheetProps) {
  const { 
    removeFromWishlist, 
    addToCart,
    cartItems,
    updateCartQuantity,
    wishlistDetails,
    fetchWishlistDetails 
  } = useShoppingState();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchWishlistDetails();
    }
  }, [open]);

  const removeItem = async (productId: number) => {
    await removeFromWishlist(productId);
    await fetchWishlistDetails();
    toast({
      title: "Removed from wishlist",
      description: "Item has been removed from your wishlist",
    });
  };

  const getItemImage = (item: ProductDetails) => {
    if (!item.main_image?.image_name) {
      return '/images/product-placeholder.jpg';
    }
    return `/uploads/products/${item.main_image.image_name}`;
  };

  const [localQuantities, setLocalQuantities] = useState<Record<number, number>>({});

  const handleQuantityChange = async (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setLocalQuantities(prev => ({
      ...prev,
      [productId]: newQuantity
    }));
    
    if (cartItems.some(item => item.productId === productId)) {
      await updateCartQuantity(productId, newQuantity);
    }
  };

  // Add new state for hover
  const [hoveredCartItems, setHoveredCartItems] = useState<number[]>([]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full sm:max-w-lg p-0">
        <SheetHeader className="space-y-2.5 p-6 pb-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Wishlist ({wishlistDetails.length})
            </SheetTitle>
          </div>
          <SheetDescription>
            Save items for later
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6 px-6">
          {wishlistDetails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
              <Heart className="w-12 h-12 mb-4" />
              <p>Your wishlist is empty</p>
            </div>
          ) : (
            <div className="space-y-6">
              {wishlistDetails.map((item) => (
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
                      src={getItemImage(item)}
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
                        aria-label="Remove from wishlist"
                      >
                        <XCircle 
                          className="h-5 w-5 transition-transform duration-200 group-hover:scale-125" 
                        />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <QuantityControls
                        quantity={
                          cartItems.some(cartItem => cartItem.productId === item.productId)
                            ? cartItems.find(cartItem => cartItem.productId === item.productId)?.quantity || 1
                            : localQuantities[item.productId] || 1
                        }
                        onQuantityChange={(quantity) => handleQuantityChange(item.productId, quantity)}
                      />

                      <div className="flex items-center gap-4">
                        <p className="font-medium">
                          {formatPrice(item.price)}
                        </p>
                        <Button
                          variant={cartItems.some(cartItem => cartItem.productId === item.productId) ? "outline" : "teal"}
                          size="sm"
                          onClick={() => cartItems.some(cartItem => cartItem.productId === item.productId) 
                            ? removeFromCart(item.productId)
                            : addToCart(item.productId, localQuantities[item.productId] || 1)
                          }
                          onMouseEnter={() => setHoveredCartItems(prev => [...prev, item.productId])}
                          onMouseLeave={() => setHoveredCartItems(prev => prev.filter(id => id !== item.productId))}
                          className="gap-2 min-w-[130px]"
                        >
                          <ShoppingCart 
                            className={`h-4 w-4 transition-colors ${
                              cartItems.some(cartItem => cartItem.productId === item.productId)
                                ? (hoveredCartItems.includes(item.productId) ? "text-red-500" : "text-green-500")
                                : ""
                            }`}
                          />
                          {cartItems.some(cartItem => cartItem.productId === item.productId)
                            ? hoveredCartItems.includes(item.productId)
                              ? "Remove"
                              : "Added to Cart"
                            : "Add to Cart"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}