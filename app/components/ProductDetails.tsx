import { useFetcher, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { CompareModal } from "./CompareModal";
import { ProductActionButtons } from "./ProductActionButtons";

interface ProductDetailsProps {
  productId: number;
}

export function ProductDetails({ productId }: ProductDetailsProps) {
  const productFetcher = useFetcher();
  const [selectedImage, setSelectedImage] = useState("");
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const navigate = useNavigate();
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const { data, state } = productFetcher;
  const product = data?.product;

  const handleFullDetails = () => {
    navigate(`/product/${productId}`);
  };

  useEffect(() => {
    if (productId) {
      productFetcher.load(`/api/products?type=details&id=${productId}`);
    }
  }, [productId]);

  useEffect(() => {
    if (product?.gallery_images?.[0]?.image_name) {
      setSelectedImage(product.gallery_images[0].image_name);
    }
  }, [product]);

  if (state === "loading") {
    return <div>Loading...</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
      {/* Render main product image */}
      <div className="aspect-square mb-3 overflow-hidden rounded-lg relative">
        <img
          src={`/uploads/products/${selectedImage}`}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Render product details */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">{product.name}</h2>
        <p className="text-lg font-medium text-muted-foreground">
          {formatPrice(product.price)}
        </p>
        <p>{product.description}</p>

        <ProductActionButtons
          productId={productId}
          onDetailsClick={handleFullDetails}
        />
      </div>

      {/* Render other product images */}
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
      <CompareModal open={isCompareOpen} onOpenChange={setIsCompareOpen} />
    </div>
  );
} 