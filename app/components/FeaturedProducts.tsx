import React from "react";

// Define a type for the product
interface Product {
  id: number;
  name: string;
  image: string;
  price: string;
}

// Sample featured products data
const featuredProducts: Product[] = [
  {
    id: 1,
    name: "Hydrating Face Cream",
    image: "https://via.placeholder.com/200x200.png?text=Face+Cream",
    price: "$25.00",
  },
  {
    id: 2,
    name: "Vitamin C Serum",
    image: "https://via.placeholder.com/200x200.png?text=Vitamin+C+Serum",
    price: "$30.00",
  },
  {
    id: 3,
    name: "Exfoliating Scrub",
    image: "https://via.placeholder.com/200x200.png?text=Scrub",
    price: "$20.00",
  },
  {
    id: 4,
    name: "Moisturizing Lotion",
    image: "https://via.placeholder.com/200x200.png?text=Lotion",
    price: "$22.00",
  },
];

const FeaturedProducts: React.FC = () => {
  return (
    <section>
      <h2 className="text-2xl font-bold text-center mb-6">Featured Products</h2>
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {featuredProducts.map((product) => (
          <div key={product.id} className="border rounded-lg overflow-hidden shadow-md">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-gray-600">{product.price}</p>
              <button className="mt-2 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;
