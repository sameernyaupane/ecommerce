import { useState } from "react";
import { ShoppingCart, Scale, Heart, Eye } from "lucide-react";
import { useNavigate } from "@remix-run/react";
import { useToast } from "@/hooks/use-toast";
import { CartSheet } from "./CartSheet";
import { WishlistSheet } from "./WishlistSheet";
import { useShoppingState } from '@/hooks/use-shopping-state';

interface ProductActionsProps {
  productId: number;
  className?: string;
}

export function ProductActions({ productId, className }: ProductActionsProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [recentWishlistClick, setRecentWishlistClick] = useState(false);
  const [recentCompareClick, setRecentCompareClick] = useState(false);
  const [hasWishlistMouseLeft, setHasWishlistMouseLeft] = useState(false);
  const [hasCompareMouseLeft, setHasCompareMouseLeft] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const { 
    wishlistItems = [],
    compareItems = [],
    isAuthenticated,
    addToCart,
    addToWishlist,
    removeFromWishlist,
    addToCompare,
    removeFromCompare
  } = useShoppingState();

  const isInWishlist = wishlistItems?.includes(productId) ?? false;
  const isInCompare = compareItems?.includes(productId) ?? false;

  const handleAddToCart = async () => {
    await addToCart(productId);
    setIsCartOpen(true);
    toast({
      title: "Added to cart",
    });
  };

  const handleWishlistAction = async () => {
    setRecentWishlistClick(true);
    
    if (isInWishlist) {
      await removeFromWishlist(productId);
      toast({ title: "Removed from wishlist" });
    } else {
      await addToWishlist(productId);
      if (!isAuthenticated) {
        setIsWishlistOpen(true);
      }
      toast({ title: "Added to wishlist" });
    }
  };

  const handleCompareAction = async () => {
    setRecentCompareClick(true);
    
    if (isInCompare) {
      await removeFromCompare(productId);
      toast({ title: "Removed from compare" });
    } else {
      await addToCompare(productId);
      toast({ title: "Added to compare" });
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/product/${productId}?quickView=true`);
  };

  return (
    <>
      <div className={`flex items-center gap-3 justify-center ${className}`}>
        <button 
          onClick={handleAddToCart}
          className="p-4 bg-white rounded-full shadow-md hover:bg-lime-500 hover:text-white transition-all duration-200 [&:not(:hover)]:scale-90 hover:scale-125"
          title="Add to Cart"
        >
          <ShoppingCart size={24} className="transition-colors" />
        </button>
        
        <button 
          onClick={handleCompareAction}
          onMouseLeave={() => {
            setRecentCompareClick(false);
            if (isInCompare) setHasCompareMouseLeft(true);
          }}
          onMouseEnter={() => {
            if (!isInCompare) {
              setHasCompareMouseLeft(false);
              setRecentCompareClick(false);
            }
          }}
          className={`p-4 rounded-full shadow-md transition-all duration-200 [&:not(:hover)]:scale-90
            ${isInCompare 
              ? 'bg-lime-500 text-white' 
              : 'bg-white hover:bg-lime-500 hover:text-white'}
            ${!recentCompareClick && 'hover:scale-125'}
            ${isInCompare && hasCompareMouseLeft && !recentCompareClick && 'hover:bg-red-500'}
            ${recentCompareClick && !isInCompare && 'hover:bg-white hover:text-black'}`}
          title={isInCompare 
            ? (hasCompareMouseLeft && !recentCompareClick ? "Remove from Compare" : "Added to Compare")
            : "Add to Compare"}
        >
          <Scale size={24} className="transition-colors" />
        </button>

        <button 
          onClick={handleWishlistAction}
          onMouseLeave={() => {
            setRecentWishlistClick(false);
            if (isInWishlist) setHasWishlistMouseLeft(true);
          }}
          onMouseEnter={() => {
            if (!isInWishlist) {
              setHasWishlistMouseLeft(false);
              setRecentWishlistClick(false);
            }
          }}
          className={`p-4 rounded-full shadow-md transition-all duration-200 [&:not(:hover)]:scale-90
            ${isInWishlist 
              ? 'bg-lime-500 text-white' 
              : 'bg-white hover:bg-lime-500 hover:text-white'}
            ${!recentWishlistClick && 'hover:scale-125'}
            ${isInWishlist && hasWishlistMouseLeft && !recentWishlistClick && 'hover:bg-red-500'}
            ${recentWishlistClick && !isInWishlist && 'hover:bg-white hover:text-black'}`}
          title={isInWishlist 
            ? (hasWishlistMouseLeft && !recentWishlistClick ? "Remove from Wishlist" : "Added to Wishlist")
            : "Add to Wishlist"}
        >
          <Heart size={24} className="transition-colors" />
        </button>

        <button 
          onClick={handleQuickView}
          className="p-4 bg-white rounded-full shadow-md hover:bg-lime-500 hover:text-white transition-all duration-200 [&:not(:hover)]:scale-90 hover:scale-125"
          title="Quick View"
        >
          <Eye size={24} className="transition-colors" />
        </button>
      </div>

      <CartSheet 
        open={isCartOpen}
        onOpenChange={setIsCartOpen}
      />
      <WishlistSheet 
        open={isWishlistOpen}
        onOpenChange={setIsWishlistOpen}
      />
    </>
  );
} 