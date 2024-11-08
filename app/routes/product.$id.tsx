import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate, Link } from "@remix-run/react";
import { ProductModel } from "@/models/ProductModel";
import { useEffect, useState } from "react";
import { ProductActionButtons } from "@/components/ProductActionButtons";
import { formatPrice } from "@/lib/utils";

export async function loader({ params }: LoaderFunctionArgs) {
  const productId = Number(params.id);

  if (!productId || isNaN(productId)) {
    throw new Error("Invalid product ID");
  }

  const [product, latestProducts] = await Promise.all([
    ProductModel.findById(productId),
    ProductModel.getPaginated({ page: 1, limit: 3, sort: 'created_at', direction: 'desc' })
  ]);

  if (!product) {
    throw new Error("Product not found");
  }

  const filteredLatestProducts = latestProducts.products
    .filter(item => item.id !== productId)
    .slice(0, 2);

  return json({ product, latestProducts: filteredLatestProducts });
}

export default function ProductPage() {
  const { product, latestProducts } = useLoaderData<typeof loader>();
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

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-4">
        {/* Left column - Main product image */}
        <div className="md:col-span-5">
          <div className="max-w-[500px] aspect-square mb-3 overflow-hidden rounded-lg relative">
            <img
              src={`/uploads/products/${selectedImage}`}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Gallery images */}
          {product.gallery_images && product.gallery_images.length > 1 && (
            <div>
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

        {/* Middle column - Product details */}
        <div className="md:col-span-4 space-y-4">
          <h2 className="text-2xl font-bold">{product.name}</h2>
          <p className="text-lg font-medium text-muted-foreground">
            {formatPrice(product.price)}
          </p>
          <p>{product.description}</p>

          <ProductActionButtons
            productId={product.id}
            showCheckoutButton={true}
            onCheckoutClick={handleCheckout}
          />
        </div>

        {/* Right column - Latest Products */}
        <div className="md:col-span-3 space-y-6">
          <h3 className="text-lg font-medium">Latest Products</h3>
          <div className="space-y-4">
            {latestProducts.map((item) => (
              <Link 
                key={item.id} 
                to={`/product/${item.id}`}
                className="group block"
              >
                <div className="space-y-2">
                  <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={`/uploads/products/${item.gallery_images[0]?.image_name || 'placeholder.jpg'}`}
                      alt={item.name}
                      className="h-full w-full object-cover group-hover:opacity-75"
                    />
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">{formatPrice(item.price)}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 