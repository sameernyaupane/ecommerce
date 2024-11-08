import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { ProductModel } from "@/models/ProductModel";
import { useEffect, useState } from "react";
import { ProductActionButtons } from "@/components/ProductActionButtons";

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
  const [selectedImage, setSelectedImage] = useState("");
  const navigate = useNavigate();

  const handleCheckout = async () => {
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

          <ProductActionButtons
            productId={product.id}
            showCheckoutButton={true}
            onCheckoutClick={handleCheckout}
          />
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
    </div>
  );
} 