import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Info, Scale } from "lucide-react";
import { useState, useEffect } from "react";
import { CartSheet } from "./CartSheet";
import { WishlistSheet } from "./WishlistSheet";
import { useToast } from "@/hooks/use-toast";
import { useShoppingState } from "@/hooks/use-shopping-state";
import { CompareModal } from "./CompareModal";
import { Minus, Plus } from "lucide-react";
import { QuantityControls } from "./QuantityControls";

interface ProductActionButtonsProps {
  productId: number;
  showCheckoutButton?: boolean;
  onCheckoutClick?: () => Promise<void>;
  onDetailsClick?: () => void;
}

export function ProductActionButtons({
  productId,
  showCheckoutButton = false,
  onCheckoutClick,
  onDetailsClick,
}: ProductActionButtonsProps) {
  const { toast } = useToast();
  const {
    addToCart,
    removeFromCart,
    updateCartQuantity,
    addToWishlist,
    removeFromWishlist,
    addToCompare,
    removeFromCompare,
    wishlistItems,
    compareItems,
    cartItems,
  } = useShoppingState();

  // Add quantity state
  const [quantity, setQuantity] = useState(1);

  // Sync quantity with cart
  useEffect(() => {
    const cartItem = cartItems.find(item => item.productId === productId);
    if (cartItem) {
      setQuantity(cartItem.quantity);
    } else {
      setQuantity(1);
    }
  }, [cartItems, productId]);

  const isInCart = cartItems.some(item => item.productId === productId);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
    
    if (isInCart) {
      await updateCartQuantity(productId, newQuantity);
    }
  };

  // Update cart handler to use local quantity
  const handleCartAction = async () => {
    if (isInCart) {
      await removeFromCart(productId);
      toast({ title: "Removed from cart" });
    } else {
      await addToCart(productId, quantity);
      setIsCartSheetOpen(true);
      toast({ title: "Added to cart" });
    }
  };

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

  // Handlers
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
      <QuantityControls
        quantity={quantity}
        onQuantityChange={handleQuantityChange}
      />

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