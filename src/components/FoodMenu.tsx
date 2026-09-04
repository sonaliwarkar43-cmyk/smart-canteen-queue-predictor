import React, { useState } from 'react';
import { 
  Search, 
  Clock, 
  Plus, 
  ShoppingBag, 
  Check, 
  Filter, 
  Flame,
  ArrowRight
} from 'lucide-react';
import { FoodItem, CartItem } from '../types';

interface FoodMenuProps {
  foodItems: FoodItem[];
  cart: CartItem[];
  onAddToCart: (food: FoodItem) => void;
  onNavigateToCart: () => void;
}

export const FoodMenu: React.FC<FoodMenuProps> = ({
  foodItems,
  cart,
  onAddToCart,
  onNavigateToCart,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addedAnimationId, setAddedAnimationId] = useState<number | null>(null);

  const categories = ['All', 'Snacks', 'Sandwiches', 'Fast Food', 'Beverages', 'Meals'];

  const filteredItems = foodItems.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAdd = (food: FoodItem) => {
    onAddToCart(food);
    setAddedAnimationId(food.id);
    setTimeout(() => {
      setAddedAnimationId(null);
    }, 800);
  };

  const totalCartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const totalCartAmount = cart.reduce((sum, i) => sum + i.food.price * i.quantity, 0);

  return (
    <div className="space-y-6 pb-16">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-950 flex items-center gap-2">
            <span>Canteen Food Menu</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
              {filteredItems.length} items
            </span>
          </h1>
          <p className="text-sm text-gray-500">
            Freshly prepared snacks, breakfast, meals and beverages. Pre-order to skip the line!
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Vada Pav, Chai, Burger..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9.5 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Food Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <p className="text-4xl mb-3">🔍</p>
          <h3 className="font-bold text-gray-900 text-base">No items found</h3>
          <p className="text-xs text-gray-500 mt-1">Try changing your search term or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.map((item) => {
            const inCart = cart.find((c) => c.food.id === item.id);
            const isJustAdded = addedAnimationId === item.id;

            return (
              <div
                key={item.id}
                className="group bg-white rounded-2xl border border-gray-200/90 hover:border-amber-300 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                {/* Image & Badges */}
                <div className="relative h-44 overflow-hidden bg-gray-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Prep Time Tag */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-xs font-medium flex items-center gap-1.5 shadow-xs">
                    <Clock className="w-3.5 h-3.5 text-amber-300" />
                    <span>Preparation: {item.preparation_time} min</span>
                  </div>

                  {/* Availability Badge */}
                  <div className="absolute top-3 right-3">
                    {item.availability ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/95 backdrop-blur-xs text-white text-[10px] font-bold shadow-xs">
                        Available
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-red-500/95 backdrop-blur-xs text-white text-[10px] font-bold shadow-xs">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  {item.popular && (
                    <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-bold flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      <span>Popular</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col justify-between grow">
                  <div>
                    <span className="text-[11px] font-semibold text-amber-700 tracking-wide uppercase">
                      {item.category}
                    </span>
                    <h3 className="font-bold text-gray-900 text-base mt-0.5 leading-snug">{item.name}</h3>
                    <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Footer Price & Add Button */}
                  <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-gray-400 font-medium">Price</span>
                      <p className="text-lg font-black text-gray-950">₹{item.price}</p>
                    </div>

                    <button
                      onClick={() => handleAdd(item)}
                      disabled={!item.availability}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        !item.availability
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : isJustAdded
                            ? 'bg-emerald-600 text-white scale-105'
                            : 'bg-amber-500 hover:bg-amber-600 text-white shadow-2xs hover:scale-102'
                      }`}
                    >
                      {isJustAdded ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Added!</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Add to Cart</span>
                          {inCart && (
                            <span className="ml-1 w-4 h-4 rounded-full bg-white text-amber-700 text-[10px] flex items-center justify-center font-black">
                              {inCart.quantity}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Cart Bar (Bottom) */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-xl bg-gray-950 text-white rounded-2xl p-3.5 shadow-2xl flex items-center justify-between border border-gray-800 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex items-center gap-3 pl-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white font-black flex items-center justify-center text-sm shadow-xs">
              {totalCartCount}
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">
                {totalCartCount} item{totalCartCount > 1 ? 's' : ''} in your cart
              </p>
              <p className="text-xs text-amber-400 font-extrabold">Total: ₹{totalCartAmount}</p>
            </div>
          </div>

          <button
            onClick={onNavigateToCart}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs shadow-xs hover:from-amber-600 hover:to-orange-600 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Proceed to Pre-Order</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
