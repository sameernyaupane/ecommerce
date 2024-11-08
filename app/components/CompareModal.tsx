import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useShoppingState } from "@/hooks/use-shopping-state";
import { formatPrice } from "@/lib/utils";
import { useEffect, useState } from "react";
import { XCircle, ShoppingCart, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@remix-run/react";
import { useToast } from "@/hooks/use-toast";
import { QuantityControls } from "./QuantityControls";

interface CompareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompareModal({ open, onOpenChange }: CompareModalProps) {
  const { 
    compareDetails, 
    fetchCompareDetails, 
    removeFromCompare,
    addToCart,
    removeFromCart,
    cartItems,
    updateCartQuantity,
  } = useShoppingState();
  const { toast } = useToast();
  const [localQuantities, setLocalQuantities] = useState<Record<number, number>>({});
  const [hoveredCartItems, setHoveredCartItems] = useState<number[]>([]);

  useEffect(() => {
    if (open) {
      fetchCompareDetails();
    }
  }, [open]);

  const handleRemoveFromCompare = async (productId: number) => {
    await removeFromCompare(productId);
    toast({
      title: "Removed from compare",
      description: "Item has been removed from your compare list",
    });
  };

  const handleAddToCart = async (productId: number, quantity: number) => {
    await addToCart(productId, quantity);
    toast({
      title: "Added to cart",
    });
  };

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

  const getItemImage = (item: any) => {
    if (!item.main_image?.image_name) {
      return '/images/product-placeholder.jpg';
    }
    return `/uploads/products/${item.main_image.image_name}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[850px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5" />
            Compare Products ({compareDetails.length})
          </DialogTitle>
        </DialogHeader>
        
        {compareDetails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <Scale className="w-12 h-12 mb-4" />
            <p>No products to compare</p>
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {compareDetails.map((item) => (
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
                      onClick={() => handleRemoveFromCompare(item.productId)}
                      className="text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary p-1.5 transition-colors ml-2 group"
                      aria-label="Remove from compare"
                    >
                      <XCircle 
                        className="h-5 w-5 transition-transform duration-200 group-hover:scale-125" 
                      />
                    </button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {item.description}
                  </p>
                  
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
      </DialogContent>
    </Dialog>
  );
} 