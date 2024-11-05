import { Link } from "@remix-run/react";
import { ProductActions } from "@/components/ProductActions";

interface FeaturedProductsProps {
  products: Array<{
    id: number;
    name: string;
    price: number;
    gallery_images: Array<{
      image_name: string;
      is_main: boolean;
    }>;
  }>;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ products }) => {
  // Take only the first 8 products for featured section
  const featuredProducts = products.slice(0, 8);

  return (
    <section className="container max-w-7xl mx-auto py-12">
      {/* Updated heading section with subheading */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-lime-600 to-lime-500 bg-clip-text text-transparent">
          Featured Products
        </h2>
        <p className="text-lg text-muted-foreground mt-2">
          Discover our handpicked selection of premium beauty products
        </p>
        <div className="w-24 h-1 bg-lime-600 mx-auto mt-4 rounded-full"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {featuredProducts.map((product) => (
          <div key={product.id} className="group relative">
            <Link
              to={`/product/${product.id}`}
              className="block"
            >
              {product.gallery_images?.[0] && (
                <div className="aspect-square mb-3 overflow-hidden rounded-lg relative">
                  <img
                    src={`/uploads/products/${product.gallery_images[0].image_name}`}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
                  <ProductActions 
                    productId={product.id}
                    className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 opacity-0 transition-all group-hover:opacity-100"
                  />
                </div>
              )}
              <h3 className="font-medium group-hover:text-primary">
                {product.name}
              </h3>
              <p className="text-muted-foreground">
                ${product.price}
              </p>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;
