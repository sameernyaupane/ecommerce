import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { ProductModel } from "@/models/ProductModel";
import { ProductDetails } from "@/components/ProductDetails";

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

  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
      </div>

      {/* Product Details */}
      <ProductDetails productId={product.id} />

      {/* Additional Product Information */}
      {/* ... */}
    </div>
  );
} 