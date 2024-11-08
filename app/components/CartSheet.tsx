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
import { ProductDetails } from "@/types/product";

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { 
    removeFromCart, 
    updateCartQuantity, 
    cartDetails,
    fetchCartDetails 
  } = useShoppingState();

  useEffect(() => {
    if (open) {
      fetchCartDetails();
    }
  }, [open]);

  const removeItem = async (productId: number) => {
    await removeFromCart(productId);
    await fetchCartDetails();
  };

  const updateQuantity = async (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    await updateCartQuantity(productId, newQuantity);
    await fetchCartDetails();
  };

  const subtotal = cartDetails.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const getItemImage = (item: ProductDetails) => {
    if (!item.main_image?.image_name) {
      return '/images/product-placeholder.jpg';
    }
    return `/uploads/products/${item.main_image.image_name}`;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full sm:max-w-lg p-0">
        <SheetHeader className="space-y-2.5 p-6 pb-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Cart ({cartDetails.length})
            </SheetTitle>
          </div>
          <SheetDescription>
            Review your items before checking out.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6 px-6">
          {cartDetails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
              <ShoppingCart className="w-12 h-12 mb-4" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-6">
              {cartDetails.map((item) => (
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

        {cartDetails.length > 0 && (
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
              variant="black"
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