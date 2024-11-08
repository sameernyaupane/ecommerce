import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Info, Scale } from "lucide-react";
import { useState } from "react";
import { CartSheet } from "./CartSheet";
import { WishlistSheet } from "./WishlistSheet";
import { useToast } from "@/hooks/use-toast";
import { useShoppingState } from "@/hooks/use-shopping-state";
import { CompareModal } from "./CompareModal";

interface ProductActionButtonsProps {
  productId: number;
  onDetailsClick?: () => void;
  showCheckoutButton?: boolean;
  onCheckoutClick?: () => Promise<void>;
}

export function ProductActionButtons({
  productId,
  onDetailsClick,
  showCheckoutButton = false,
  onCheckoutClick,
}: ProductActionButtonsProps) {
  const { toast } = useToast();
  const {
    addToCart,
    removeFromCart,
    addToWishlist,
    removeFromWishlist,
    addToCompare,
    removeFromCompare,
    wishlistItems,
    compareItems,
    cartItems,
  } = useShoppingState();

  // States
  const [isCartHovered, setIsCartHovered] = useState(false);
  const [isWishlistHovered, setIsWishlistHovered] = useState(false);
  const [isCompareHovered, setIsCompareHovered] = useState(false);
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false);
  const [isWishlistSheetOpen, setIsWishlistSheetOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Derived states
  const isInWishlist = wishlistItems.includes(productId);
  const isInCompare = compareItems.includes(productId);
  const isInCart = cartItems.some(item => item.productId === productId);

  // Handlers
  const handleCartAction = async () => {
    if (isInCart) {
      await removeFromCart(productId);
      toast({ title: "Removed from cart" });
    } else {
      await addToCart(productId);
      setIsCartSheetOpen(true);
      toast({ title: "Added to cart" });
    }
  };

  const handleWishlistAction = async () => {
    if (isInWishlist) {
      await removeFromWishlist(productId);
      toast({ title: "Removed from wishlist" });
    } else {
      await addToWishlist(productId);
      setIsWishlistSheetOpen(true);
      toast({ title: "Added to wishlist" });
    }
  };

  const handleCompareAction = async () => {
    if (isInCompare) {
      await removeFromCompare(productId);
      toast({ title: "Removed from compare" });
    } else {
      await addToCompare(productId);
      setIsCompareModalOpen(true);
      toast({ title: "Added to compare" });
    }
  };

  // Rest of the component remains the same
  return (
    <div className="space-y-4">
      {/* First row: Cart and Checkout/Details */}
      <div className="flex items-center gap-4">
        <Button
          variant={isInCart ? "outline" : "teal"}
          onClick={handleCartAction}
          onMouseEnter={() => setIsCartHovered(true)}
          onMouseLeave={() => setIsCartHovered(false)}
          className="w-[180px]"
        >
          <ShoppingCart 
            className={`mr-2 h-4 w-4 transition-colors ${
              isInCart ? (isCartHovered ? "text-red-500" : "text-green-500") : ""
            }`}
          />
          {isInCart
            ? isCartHovered
              ? "Remove"
              : "Added to Cart"
            : "Add to Cart"}
        </Button>

        {showCheckoutButton ? (
          <Button
            variant="black"
            onClick={onCheckoutClick}
            className="w-[180px]"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Checkout
          </Button>
        ) : onDetailsClick && (
          <Button
            variant="outline"
            onClick={onDetailsClick}
            className="w-[180px]"
          >
            <Info className="mr-2 h-4 w-4" />
            Full Details
          </Button>
        )}
      </div>

      {/* Second row: Wishlist and Compare */}
      <div className="flex items-center gap-4">
        <Button
          variant={isInWishlist ? "outline" : "secondary"}
          onClick={handleWishlistAction}
          onMouseEnter={() => setIsWishlistHovered(true)}
          onMouseLeave={() => setIsWishlistHovered(false)}
          className="w-[180px]"
        >
          <Heart
            className={`mr-2 h-4 w-4 transition-colors ${
              isInWishlist ? (isWishlistHovered ? "text-red-500" : "text-green-500") : ""
            }`}
          />
          {isInWishlist
            ? isWishlistHovered
              ? "Remove"
              : "Added to Wishlist"
            : "Add to Wishlist"}
        </Button>

        <Button
          variant={isInCompare ? "outline" : "secondary"}
          onClick={handleCompareAction}
          onMouseEnter={() => setIsCompareHovered(true)}
          onMouseLeave={() => setIsCompareHovered(false)}
          className="w-[180px]"
        >
          <Scale 
            className={`mr-2 h-4 w-4 shrink-0 transition-colors ${
              isInCompare ? (isCompareHovered ? "text-red-500" : "text-green-500") : ""
            }`}
          />
          {isInCompare
            ? isCompareHovered
              ? "Remove"
              : "Added to Compare"
            : "Add to Compare"}
        </Button>
      </div>

      <CartSheet 
        open={isCartSheetOpen} 
        onOpenChange={setIsCartSheetOpen} 
      />
      <WishlistSheet 
        open={isWishlistSheetOpen} 
        onOpenChange={setIsWishlistSheetOpen} 
      />
      <CompareModal 
        open={isCompareModalOpen}
        onOpenChange={setIsCompareModalOpen}
      />
    </div>
  );
} 