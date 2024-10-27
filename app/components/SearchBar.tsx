import { useState, ChangeEvent } from "react";
import { MagnifyingGlassIcon, HeartIcon } from '@radix-ui/react-icons';
import { ShoppingCartIcon, UserIcon } from '@heroicons/react/24/outline';
import { products} from '@/products';
import { Product } from "@/types"

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
    <div className="container py-2 relative justify-between max-w-7xl">
      {/* Logo and Search bar side by side */}
      <div className="flex items-center">
        <img src="/images/logo.png" className="w-24 h-24" alt="Logo" />

        {/* Search bar */}
        <div className="flex items-center flex-grow border border-gray-300 rounded-lg overflow-hidden">
          <input
            type="text"
            placeholder="Search for products..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full px-4 py-2 text-gray-700 focus:outline-none"
          />
          <button className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 flex items-center justify-center">
            <MagnifyingGlassIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Icons on the right side of the search bar */}
        <div className="flex space-x-4 ml-4">
          <button className="p-2 hover:bg-gray-200 rounded">
            <HeartIcon className="w-6 h-6 text-gray-700" />
          </button>
          <button className="p-2 hover:bg-gray-200 rounded">
            <ShoppingCartIcon className="w-6 h-6 text-gray-700" />
          </button>
          <button className="p-2 hover:bg-gray-200 rounded">
            <UserIcon className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Search results */}
      {filteredProducts.length > 0 && (
        <div className="absolute left-0 right-0 bg-white shadow-md rounded-lg p-4 z-10">
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
