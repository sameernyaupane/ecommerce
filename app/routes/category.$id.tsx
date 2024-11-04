import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { ProductModel } from "@/models/ProductModel";
import { CategoryModel } from "@/models/CategoryModel";


export async function loader({ params }: LoaderFunctionArgs) {
  const categoryId = Number(params.id);
  
  if (!categoryId || isNaN(categoryId)) {
    throw new Error("Invalid category ID");
  }

  const [category, subcategories, products] = await Promise.all([
    CategoryModel.getById(categoryId),
    CategoryModel.getSubcategories(categoryId),
    ProductModel.getByCategoryId(categoryId)
  ]);

  if (!category) {
    throw new Error("Category not found");
  }

  return json({ category, subcategories, products });
}

export default function CategoryPage() {
  const { category, subcategories, products } = useLoaderData<typeof loader>();

  return (
    <div className="container py-2 relative justify-between max-w-7xl mx-auto">
      {/* Category Header with Large Image */}
      <div className="mb-8">
        {category.image && (
          <div className="relative w-full h-[300px] mb-6 rounded-xl overflow-hidden">
            <img
              src={`/uploads/categories/${category.image}`}
              alt={category.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
              {category.description && (
                <p className="text-lg text-white/90">{category.description}</p>
              )}
            </div>
          </div>
        )}
        
        {/* Fallback header if no image */}
        {!category.image && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
            {category.description && (
              <p className="text-muted-foreground">{category.description}</p>
            )}
          </div>
        )}
      </div>

        {/* Subcategories Grid */}
        {subcategories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Subcategories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subcategories.map((subcat) => (
                <Link
                  key={subcat.id}
                  to={`/category/${subcat.id}`}
                  className="group block p-4 rounded-lg border hover:border-primary transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {subcat.image && (
                      <img
                        src={`/uploads/categories/${subcat.image}`}
                        alt={subcat.name}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                    )}
                    <div>
                      <h3 className="font-medium group-hover:text-primary">
                        {subcat.name}
                      </h3>
                      {subcat.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {subcat.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Products Grid */}
        {products.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="group block"
                >
                  {product.gallery_images?.[0] && (
                    <div className="aspect-square mb-3 overflow-hidden rounded-lg">
                      <img
                        src={`/uploads/products/${product.gallery_images[0].image_name}`}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
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
              ))}
            </div>
          </div>
        )}

        {/* No Results Message */}
        {subcategories.length === 0 && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No subcategories or products found in this category.
            </p>
          </div>
        )}
    </div>
  );
} 