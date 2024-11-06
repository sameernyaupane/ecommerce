import { useState } from "react";
import { ShoppingCart, Scale, Heart, Eye } from "lucide-react";
import { useFetcher, useNavigate } from "@remix-run/react";
import { useToast } from "@/hooks/use-toast";
import { CartSheet } from "./CartSheet";
import { WishlistSheet } from "./WishlistSheet";
import { useShoppingState } from '@/hooks/use-shopping-state';

interface ProductActionsProps {
  productId: number;
  className?: string;
  isAuthenticated?: boolean;
}

export function ProductActions({ productId, className, isAuthenticated = false }: ProductActionsProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [recentWishlistClick, setRecentWishlistClick] = useState(false);
  const [recentCompareClick, setRecentCompareClick] = useState(false);
  const [hasWishlistMouseLeft, setHasWishlistMouseLeft] = useState(false);
  const [hasCompareMouseLeft, setHasCompareMouseLeft] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get states from zustand store
  const { 
    cartItems, 
    wishlistItems, 
    compareItems,
    addToCart, 
    toggleWishlist, 
    toggleCompare 
  } = useShoppingState();

  // Compute states from store
  const isInWishlist = wishlistItems.includes(productId);
  const isInCompare = compareItems.includes(productId);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      addToCart(productId);
      setIsCartOpen(true);
      toast({
        title: "Added to cart",
      });
      return;
    }

    const formData = new FormData();
    formData.append("intent", "addToCart");
    formData.append("productId", productId.toString());

    fetcher.submit(formData, {
      method: "POST",
      action: "/api/products",
    });
  };

  const handleToggleWishlist = () => {
    setRecentWishlistClick(true);

    if (!isAuthenticated) {
      const isAdded = toggleWishlist(productId);
      setIsWishlistOpen(true);
      toast({
        title: isAdded ? "Added to wishlist" : "Removed from wishlist",
      });
      return;
    }

    const formData = new FormData();
    formData.append("intent", "toggleWishlist");
    formData.append("productId", productId.toString());

    fetcher.submit(formData, {
      method: "POST",
      action: "/api/products",
    });
  };

  const handleToggleCompare = () => {
    setRecentCompareClick(true);

    if (!isAuthenticated) {
      const isAdded = toggleCompare(productId);
      toast({
        title: isAdded ? "Added to compare" : "Removed from compare",
      });
      return;
    }

    const formData = new FormData();
    formData.append("intent", "toggleCompare");
    formData.append("productId", productId.toString());

    fetcher.submit(formData, {
      method: "POST",
      action: "/api/products",
    });
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
          onClick={handleToggleCompare}
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
          onClick={handleToggleWishlist}
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
        isAuthenticated={isAuthenticated}
      />
      <WishlistSheet 
        open={isWishlistOpen}
        onOpenChange={setIsWishlistOpen}
      />
    </>
  );
} 