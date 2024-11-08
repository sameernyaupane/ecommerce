import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { ProductModel } from "@/models/ProductModel";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Info, Scale } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useShoppingState } from "@/hooks/use-shopping-state";
import { CompareModal } from "@/components/CompareModal";
import { CartSheet } from "@/components/CartSheet";
import { WishlistSheet } from "@/components/WishlistSheet";

export async function loader({ params }: LoaderFunctionArgs) {
  const productId = Number(params.id);

  if (!productId || isNaN(productId)) {
    throw new Error("Invalid product ID");
  }

  const product = await ProductModel.findById(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  return json({ product });
}

export default function ProductPage() {
  const { product } = useLoaderData<typeof loader>();
  const productFetcher = useFetcher();
  const [selectedImage, setSelectedImage] = useState("");
  const navigate = useNavigate();
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
  const [isCartHovered, setIsCartHovered] = useState(false);
  const [isWishlistHovered, setIsWishlistHovered] = useState(false);
  const [isCompareHovered, setIsCompareHovered] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false);
  const [isWishlistSheetOpen, setIsWishlistSheetOpen] = useState(false);

  const isInWishlist = wishlistItems.includes(product.id);
  const isInCompare = compareItems.includes(product.id);
  const isInCart = cartItems.some(item => item.productId === product.id);

  const handleCartAction = async () => {
    if (isInCart) {
      await removeFromCart(product.id);
      toast({ title: "Removed from cart" });
    } else {
      await addToCart(product.id);
      setIsCartSheetOpen(true);
      toast({ title: "Added to cart" });
    }
  };

  const handleWishlistAction = async () => {
    if (isInWishlist) {
      await removeFromWishlist(product.id);
      toast({ title: "Removed from wishlist" });
    } else {
      await addToWishlist(product.id);
      setIsWishlistSheetOpen(true);
      toast({ title: "Added to wishlist" });
    }
  };

  const handleCompareAction = async () => {
    if (isInCompare) {
      await removeFromCompare(product.id);
      toast({ title: "Removed from compare" });
    } else {
      await addToCompare(product.id);
      setIsCompareOpen(true);
      toast({ title: "Added to compare" });
    }
  };

  const handleCheckout = async () => {
    if (!isInCart) {
      await addToCart(product.id);
      toast({ title: "Added to cart" });
    }
    navigate("/checkout");
  };

  useEffect(() => {
    if (product?.gallery_images?.[0]?.image_name) {
      setSelectedImage(product.gallery_images[0].image_name);
    }
  }, [product]);

  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
        {/* Main product image */}
        <div className="aspect-square mb-3 overflow-hidden rounded-lg relative">
          <img
            src={`/uploads/products/${selectedImage}`}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Product details */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">{product.name}</h2>
          <p className="text-lg font-medium text-muted-foreground">
            {product.price}
          </p>
          <p>{product.description}</p>

          <div className="space-y-4">
            {/* First row: Cart and Checkout */}
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

              <Button
                variant="black"
                onClick={handleCheckout}
                className="w-[180px]"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Checkout
              </Button>
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
                  className={`mr-2 h-5 w-5 shrink-0 transition-colors ${
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
          </div>
        </div>

        {/* Gallery images */}
        {product.gallery_images && product.gallery_images.length > 1 && (
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium mb-2">Gallery</h3>
            <div className="flex flex-wrap gap-4">
              {product.gallery_images.map((image) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(image.image_name)}
                  className={`w-20 h-20 rounded-lg overflow-hidden ${
                    selectedImage === image.image_name
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                >
                  <img
                    src={`/uploads/products/${image.image_name}`}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
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
        open={isCompareOpen} 
        onOpenChange={setIsCompareOpen} 
      />
    </div>
  );
} 