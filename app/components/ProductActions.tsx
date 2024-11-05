import { useState, useEffect } from "react";
import { ShoppingCart, Scale, Heart, Eye } from "lucide-react";
import { useFetcher, useNavigate } from "@remix-run/react";
import { useToast } from "@/hooks/use-toast";
import { guestStorage } from "@/utils/guestStorage";
import { CartSheet } from "./CartSheet";

interface ProductActionsProps {
  productId: number;
  className?: string;
  isAuthenticated?: boolean;
}

export function ProductActions({ productId, className, isAuthenticated = false }: ProductActionsProps) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isInCompare, setIsInCompare] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Initialize states from local storage for guests
  useEffect(() => {
    if (!isAuthenticated) {
      setIsInWishlist(guestStorage.getWishlist().includes(productId));
      setIsInCompare(guestStorage.getCompareList().includes(productId));
    }
  }, [isAuthenticated, productId]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      guestStorage.addToCart(productId);
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
    if (!isAuthenticated) {
      const isAdded = guestStorage.toggleWishlist(productId);
      setIsInWishlist(isAdded);
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
    if (!isAuthenticated) {
      const isAdded = guestStorage.toggleCompare(productId);
      setIsInCompare(isAdded);
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
          className={`p-4 rounded-full shadow-md transition-all duration-200 [&:not(:hover)]:scale-90 hover:scale-125
            ${isInCompare ? 'bg-lime-500 text-white' : 'bg-white hover:bg-lime-500 hover:text-white'}`}
          title="Compare"
        >
          <Scale size={24} className="transition-colors" />
        </button>
        <button 
          onClick={handleToggleWishlist}
          className={`p-4 rounded-full shadow-md transition-all duration-200 [&:not(:hover)]:scale-90 hover:scale-125
            ${isInWishlist ? 'bg-lime-500 text-white' : 'bg-white hover:bg-lime-500 hover:text-white'}`}
          title="Add to Wishlist"
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
    </>
  );
} 