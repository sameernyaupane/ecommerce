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

interface WishlistItem {
  productId: number;
  name: string;
  price: number;
  image: string;
}

interface WishlistSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WishlistSheet({ open, onOpenChange }: WishlistSheetProps) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const productFetcher = useFetcher();
  const { toast } = useToast();
  const { removeFromWishlist, addToCart, wishlistItems: wishlistIds } = useShoppingState();

  useEffect(() => {
    if (open) {
      if (wishlistIds.length > 0) {
        const productIds = wishlistIds.join(",");
        productFetcher.load(`/api/cart?productIds=${productIds}`);
      } else {
        setWishlistItems([]);
      }
    }
  }, [open, wishlistIds]);

  useEffect(() => {
    if (productFetcher.data?.products && open) {
      const enrichedItems = productFetcher.data.products.map(product => {
        const mainImage = product.gallery_images.find(img => img.is_main) || product.gallery_images[0];
        
        return {
          productId: product.id,
          name: product.name,
          price: product.price,
          image: mainImage 
            ? `/uploads/products/${mainImage.image_name}`
            : '/images/product-placeholder.jpg'
        };
      });

      setWishlistItems(enrichedItems);
    }
  }, [productFetcher.data, open]);

  const removeItem = (productId: number) => {
    removeFromWishlist(productId);
    setWishlistItems(prev => prev.filter(item => item.productId !== productId));
    toast({
      title: "Removed from wishlist",
      description: "Item has been removed from your wishlist",
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full sm:max-w-lg p-0">
        <SheetHeader className="space-y-2.5 p-6 pb-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Wishlist ({wishlistItems.length})
            </SheetTitle>
          </div>
          <SheetDescription>
            Save items for later
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6 px-6">
          {wishlistItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
              <Heart className="w-12 h-12 mb-4" />
              <p>Your wishlist is empty</p>
            </div>
          ) : (
            <div className="space-y-6">
              {wishlistItems.map((item) => (
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
                        aria-label="Remove from wishlist"
                      >
                        <XCircle 
                          className="h-5 w-5 transition-transform duration-200 group-hover:scale-125" 
                        />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <p className="font-medium">
                        {formatPrice(item.price)}
                      </p>
                      <Button
                        size="sm"
                        onClick={() => addToCart(item.productId)}
                        className="gap-2"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                      </Button>
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