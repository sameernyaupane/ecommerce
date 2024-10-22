import { useState, ChangeEvent } from "react";
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';

// Define a type for the product
interface Product {
  id: number;
  name: string;
  image: string;
  price: string;
}

// Sample product data with online image URLs
const products: Product[] = [
  {
    id: 1,
    name: "Hydrating Face Cream",
    image: "https://via.placeholder.com/100x100.png?text=Face+Cream",
    price: "$25.00",
  },
  {
    id: 2,
    name: "Vitamin C Serum",
    image: "https://via.placeholder.com/100x100.png?text=Vitamin+C+Serum",
    price: "$30.00",
  },
  {
    id: 3,
    name: "Exfoliating Scrub",
    image: "https://via.placeholder.com/100x100.png?text=Scrub",
    price: "$20.00",
  },
  {
    id: 4,
    name: "Moisturizing Lotion",
    image: "https://via.placeholder.com/100x100.png?text=Lotion",
    price: "$22.00",
  },
];

// Arrow function component
const SearchBar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Filter products based on the search term
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.length > 0) {
      const results = products.filter((product) =>
        product.name.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredProducts(results);
    } else {
      setFilteredProducts([]);
    }
  };

  return (
    <div className="container py-2 max-w-2xl relative"> {/* Set relative position here */}
      {/* Search bar */}
      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden mb-4">
        <input
          type="text"
          placeholder="Search beauty products..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full px-4 py-2 text-gray-700 focus:outline-none"
        />
        <button className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 flex items-center justify-center">
          <MagnifyingGlassIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Search results */}
      {filteredProducts.length > 0 && (
        <div className="absolute left-0 right-0 bg-white shadow-md rounded-lg p-4 z-10"> {/* Positioning results absolutely */}
          <ul>
            {filteredProducts.map((product) => (
              <li key={product.id} className="flex items-center mb-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-md"
                />
                <div className="ml-4">
                  <h3 className="text-lg font-medium">{product.name}</h3>
                  <p className="text-gray-500">{product.price}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
