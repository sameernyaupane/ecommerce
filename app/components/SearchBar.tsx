import { useState, ChangeEvent, useEffect } from "react";
import { Search, Heart, ShoppingCart, User } from 'lucide-react';
import { products} from '@/products';
import { Product } from "@/types"
import { Link } from "@remix-run/react" 
import { WishlistSheet } from "./WishlistSheet";
import { CartSheet } from "./CartSheet";
import { guestStorage } from "@/utils/guestStorage";

// Arrow function component
const SearchBar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  // Update counts when storage changes
  useEffect(() => {
    const updateCounts = () => {
      setWishlistCount(guestStorage.getWishlist().length);
      setCartCount(guestStorage.getCart().reduce((sum, item) => sum + item.quantity, 0));
    };

    updateCounts();
    window.addEventListener('local-storage', updateCounts);
    window.addEventListener('storage', updateCounts);

    return () => {
      window.removeEventListener('local-storage', updateCounts);
      window.removeEventListener('storage', updateCounts);
    };
  }, []);

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
    <div className="container pt-4 relative justify-between max-w-7xl">
      {/* Logo and Search bar side by side */}
      <div className="flex items-center justify-between gap-8">
        <Link to={"/"}><img src="/images/logo.png" className="w-[60px] h-auto" alt="Logo" /></Link>

        {/* Search bar */}
        <div className="flex items-center w-[65%] md:w-[70%] lg:w-[65%] border border-gray-200 hover:border-gray-300 rounded-full overflow-hidden transition-all duration-300 shadow-sm hover:shadow">
          <div className="flex-grow flex items-center px-6">
            <Search className="w-6 h-6 text-gray-400 mr-3 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search for products..."
              name="search"
              value={searchTerm}
              onChange={handleSearch}
              className="w-full py-3.5 text-base text-gray-700 bg-transparent focus:outline-none placeholder-gray-400"
            />
          </div>
        </div>

        {/* Icons on the right side */}
        <div className="hidden md:flex space-x-5">
          <button 
            className="p-2 hover:bg-gray-200 rounded relative group"
            onClick={() => setIsWishlistOpen(true)}
          >
            <Heart className="w-8 h-8 text-gray-400 stroke-[1]" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-lime-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>
          <button 
            className="p-2 hover:bg-gray-200 rounded relative group"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="w-8 h-8 text-gray-400 stroke-[1]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-lime-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <button className="p-2 hover:bg-gray-200 rounded">
            <User className="w-8 h-8 text-gray-400 stroke-[1]" />
          </button>
        </div>
      </div>

      {/* Search results */}
      {filteredProducts.length > 0 && (
        <div className="absolute left-0 right-0 bg-white shadow-md rounded-lg p-4 z-50">
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

      <WishlistSheet 
        open={isWishlistOpen}
        onOpenChange={setIsWishlistOpen}
      />
      
      <CartSheet 
        open={isCartOpen}
        onOpenChange={setIsCartOpen}
      />
    </div>
  );
};

export default SearchBar;
