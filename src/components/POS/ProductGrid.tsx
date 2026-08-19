'use client';

import { Search, Pizza, Package, Layers } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { CategoryItem, ProductItem } from '@/lib/types';

interface ProductGridProps {
  categories?: CategoryItem[];
  products: ProductItem[];
  selectedCategory?: string;
  onSelectCategory?: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectProduct: (product: ProductItem) => void;
  onOpenPizzaModalWithCategory: (categoryName: string, flavorName?: string) => void;
}

export default function ProductGrid({
  categories = [],
  products,
  selectedCategory = 'all',
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onSelectProduct,
  onOpenPizzaModalWithCategory,
}: ProductGridProps) {

  // Main Category Cards Configuration
  const categoryCards = [
    {
      id: 'cat-urban-special',
      name: 'Urban Special Pizza',
      categoryQueryName: 'Urban Special Pizza',
      icon: '🍕',
      badge: '4 Flavors',
      desc: 'Urban Special, Malai Boti, Behari Kebab, Peri Peri',
      fromPrice: 'Rs. 500',
      gradient: 'from-amber-600 via-amber-500 to-red-600',
      isPizza: true,
    },
    {
      id: 'cat-urban-pizza',
      name: 'Urban Pizza',
      categoryQueryName: 'Urban Pizza',
      icon: '🍕',
      badge: '6 Flavors',
      desc: 'Tikka, Fajita, Supreme, Sicilian, Cheese & Veggie Lover',
      fromPrice: 'Rs. 500',
      gradient: 'from-orange-600 via-amber-600 to-amber-500',
      isPizza: true,
    },
    {
      id: 'cat-urban-square',
      name: 'Urban Square Pizza',
      categoryQueryName: 'Urban Square Pizza',
      icon: '🍕',
      badge: 'Medium & Large',
      desc: 'Square Regular (1300/1750) & Square Special (1350/1800)',
      fromPrice: 'Rs. 1,300',
      gradient: 'from-amber-600 via-red-600 to-red-700',
      isPizza: true,
    },
    {
      id: 'cat-urban-stuffer',
      name: 'Urban Stuffer Pizza',
      categoryQueryName: 'Urban Stuffer Pizza',
      icon: '🍕',
      badge: 'Stuffed Crust',
      desc: 'Cheese Stuffer, Chicken Cheese Stuffer, Kabab Stuffer',
      fromPrice: 'Rs. 1,300',
      gradient: 'from-red-600 via-amber-600 to-orange-600',
      isPizza: true,
    },
    {
      id: 'cat-sandwiches-burgers',
      name: 'Sandwiches & Burgers',
      slug: 'sandwiches-burgers',
      icon: '🥪',
      badge: 'With Fries',
      desc: 'Special, Grilled, Malai Boti Sandwiches & Burgers',
      fromPrice: 'Rs. 300',
      gradient: 'from-emerald-700 via-emerald-600 to-teal-600',
      isPizza: false,
    },
    {
      id: 'cat-pasta',
      name: 'Pasta',
      slug: 'pasta',
      icon: '🍝',
      badge: 'Half & Full',
      desc: 'Urban Special Pasta, Crunchy Pasta & Creamy Pasta',
      fromPrice: 'Rs. 450',
      gradient: 'from-purple-700 via-purple-600 to-indigo-600',
      isPizza: false,
    },
    {
      id: 'cat-appetizers',
      name: 'Appetizers',
      slug: 'appetizers',
      icon: '🍗',
      badge: 'Wings & Fries',
      desc: 'Baked Wings, Hot Wings, Nuggets, Mayo & Loaded Fries',
      fromPrice: 'Rs. 300',
      gradient: 'from-rose-700 via-pink-600 to-red-600',
      isPizza: false,
    },
    {
      id: 'cat-spin-rolls',
      name: 'Spin Rolls',
      slug: 'spin-rolls',
      icon: '🌯',
      badge: '4 Pcs Deals',
      desc: 'Chicken, Behari, Malai Boti & Special Spin Rolls',
      fromPrice: 'Rs. 450',
      gradient: 'from-blue-700 via-indigo-600 to-violet-600',
      isPizza: false,
    },
    {
      id: 'cat-platter',
      name: 'Urban Special Platter',
      slug: 'urban-special-platter',
      icon: '🍽️',
      badge: 'Combo Deal',
      desc: '4Pcs Spin Roll + 6Pcs Oven Baked Wings + Fries',
      fromPrice: 'Rs. 850',
      gradient: 'from-yellow-600 via-amber-600 to-orange-600',
      isPizza: false,
    },
    {
      id: 'cat-beverages',
      name: 'Beverages',
      slug: 'beverages',
      icon: '🥤',
      badge: 'Drinks & Water',
      desc: 'Soft Drinks (250ml, 500ml, 1L, 1.5L) & Mineral Water',
      fromPrice: 'Rs. 70',
      gradient: 'from-cyan-700 via-blue-600 to-indigo-600',
      isPizza: false,
    },
  ];

  // Helper to find DB category ID by slug or name
  const findCategoryId = (slugOrName: string) => {
    const match = categories.find(
      (c) => c.slug === slugOrName || c.name.toLowerCase() === slugOrName.toLowerCase()
    );
    return match ? match.id : 'all';
  };

  const isMainOverview = selectedCategory === 'all' && searchQuery.trim() === '';

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 p-4 space-y-4 select-none">
      {/* Top Bar: Search Input */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            id="pos-search-input"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search items by name, SKU or flavor (e.g. Malai Boti, Wings, Can)... (F2)"
            className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors shadow-inner font-sans"
          />
        </div>

        {/* Top Horizontal Category Selector Tabs Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
          <button
            onClick={() => onSelectCategory && onSelectCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center space-x-1.5 shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-105'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Main Categories Overview</span>
          </button>

          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            const isPizzaCategory = cat.name.toLowerCase().includes('pizza');
            return (
              <button
                key={cat.id}
                onClick={() => {
                  if (isPizzaCategory) {
                    onOpenPizzaModalWithCategory(cat.name);
                  } else {
                    onSelectCategory && onSelectCategory(cat.id);
                  }
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center space-x-1.5 shrink-0 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-105'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 hover:bg-slate-800'
                }`}
              >
                {isPizzaCategory && <Pizza className="w-3.5 h-3.5" />}
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main View Mode 1: High Level Category Cards Overview (Default Clean POS Main Screen) */}
      {isMainOverview ? (
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-1 xl:grid-cols-3 gap-4">
            {categoryCards.map((card) => (
              <div
                key={card.id}
                onClick={() => {
                  if (card.isPizza) {
                    onOpenPizzaModalWithCategory(card.categoryQueryName || card.name);
                  } else {
                    const catId = findCategoryId(card.slug || card.name);
                    if (onSelectCategory) onSelectCategory(catId);
                  }
                }}
                className={`group bg-gradient-to-br ${card.gradient} rounded-2xl p-4 cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-white/10 flex flex-col justify-between select-none relative overflow-hidden`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-slate-950/40 text-white text-2xl flex items-center justify-center backdrop-blur shadow-inner">
                    {card.icon}
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-slate-950/60 text-white backdrop-blur border border-white/20">
                    {card.badge}
                  </span>
                </div>

                <div className="my-4">
                  <h3 className="text-lg font-black text-white tracking-tight leading-snug group-hover:translate-x-1 transition-transform">
                    {card.name}
                  </h3>
                  <p className="text-xs text-white/80 line-clamp-2 mt-1 font-medium leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/20">
                  <div>
                    <span className="text-[10px] text-white/70 uppercase font-semibold block">Starting From</span>
                    <span className="text-sm font-black text-white font-mono">{card.fromPrice}</span>
                  </div>
                  <button className="px-3 py-1.5 bg-slate-950/80 text-white font-extrabold text-xs rounded-xl shadow group-hover:bg-slate-950 group-hover:scale-105 transition-all">
                    {card.isPizza ? 'Configure →' : 'View Items →'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Main View Mode 2: Detailed Items Grid for Filtered Category or Search Results */
        <div className="flex-1 overflow-y-auto pr-1">
          {products.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-2">
              <Package className="w-12 h-12 stroke-1 text-slate-600" />
              <p className="text-sm font-semibold">Is category ya search query mein koi item nahi mila</p>
              <button
                onClick={() => onSelectCategory && onSelectCategory('all')}
                className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-amber-400 font-bold text-xs rounded-xl"
              >
                Back to All Categories
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    if (product.isPizza) {
                      onOpenPizzaModalWithCategory(
                        product.category?.name || 'Urban Pizza',
                        product.name
                      );
                    } else {
                      onSelectProduct(product);
                    }
                  }}
                  className="group bg-slate-900 border border-slate-800 hover:border-amber-500/60 rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10 select-none"
                >
                  <div>
                    {/* Item Container */}
                    <div className="relative w-full h-28 bg-slate-950 rounded-xl overflow-hidden mb-2.5 border border-slate-800/60 flex items-center justify-center">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-700">
                          {product.isPizza ? (
                            <Pizza className="w-10 h-10 text-amber-500/50" />
                          ) : (
                            <Package className="w-10 h-10 text-slate-800" />
                          )}
                          <span className="text-[10px] text-slate-500 mt-1 font-mono uppercase">
                            {product.category?.name || 'Item'}
                          </span>
                        </div>
                      )}

                      {product.isPizza ? (
                        <span className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black rounded-md shadow uppercase tracking-wider">
                          Pizza
                        </span>
                      ) : (
                        <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-slate-800/80 text-slate-300 text-[9px] font-bold rounded uppercase">
                          {product.category?.name?.split(' ')[0]}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <h4 className="font-bold text-xs text-slate-100 line-clamp-1 group-hover:text-amber-400 transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 font-sans">
                      {product.description || `Category: ${product.category?.name}`}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/60">
                    <div>
                      <span className="text-xs text-slate-500 block text-[9px] uppercase font-semibold">Price</span>
                      <span className="text-xs font-black text-amber-400 font-mono">
                        {formatCurrency(product.basePrice)}
                      </span>
                    </div>
                    <button className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 group-hover:bg-amber-500 text-amber-400 group-hover:text-slate-950 text-xs font-black transition-all flex items-center space-x-1 shadow">
                      <span>{product.isPizza ? 'Configure' : '+ Add'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
