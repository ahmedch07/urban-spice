'use client';

import React from 'react';
import { Search, Pizza, Flame, Coffee, Package, Sparkles, Layers, Cookie, MoreHorizontal } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { CategoryItem, ProductItem } from '@/lib/types';

interface ProductGridProps {
  categories: CategoryItem[];
  products: ProductItem[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectProduct: (product: ProductItem) => void;
  onOpenPizzaModal: () => void;
}

export default function ProductGrid({
  categories,
  products,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onSelectProduct,
  onOpenPizzaModal,
}: ProductGridProps) {

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'pizza': return Pizza;
      case 'burgers': return Flame;
      case 'fries': return Layers;
      case 'drinks': return Coffee;
      case 'deals': return Sparkles;
      case 'sides': return Package;
      case 'desserts': return Cookie;
      default: return MoreHorizontal;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 p-4 space-y-4">
      {/* Top Bar: Search + Category Tabs */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            id="pos-search-input"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products by name or SKU... (Press F2)"
            className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors shadow-inner"
          />
        </div>

        {/* Categories Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span>All Products</span>
          </button>

          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.slug);
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-4 h-4 object-cover rounded-md" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Special Pizza Banner Card */}
      {(selectedCategory === 'all' || categories.find((c) => c.id === selectedCategory)?.slug === 'pizza') && (
        <div
          onClick={onOpenPizzaModal}
          className="bg-gradient-to-r from-amber-600 via-amber-500 to-red-600 rounded-2xl p-4 cursor-pointer shadow-lg shadow-amber-500/10 hover:brightness-110 transition-all flex items-center justify-between border border-amber-400/30 group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-slate-950/40 text-amber-300 flex items-center justify-center backdrop-blur">
              <Pizza className="w-7 h-7 group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-slate-950/50 text-amber-300 border border-amber-400/30">
                  Customizer
                </span>
                <h3 className="font-extrabold text-base text-slate-950">Build Custom Pizza</h3>
              </div>
              <p className="text-xs text-slate-950/80 font-medium mt-0.5">
                Configure Flavors (Chicken Tikka, Pepperoni, BBQ), Sizes, Crusts & Extra Toppings
              </p>
            </div>
          </div>
          <button className="px-4 py-2 bg-slate-950 text-amber-400 font-bold text-xs rounded-xl shadow group-hover:scale-105 transition-transform">
            Customize Pizza →
          </button>
        </div>
      )}

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto pr-1">
        {products.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-2">
            <Package className="w-12 h-12 stroke-1" />
            <p className="text-sm font-medium">No products found for this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  if (product.isPizza) {
                    onOpenPizzaModal();
                  } else {
                    onSelectProduct(product);
                  }
                }}
                className="group bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/5 select-none"
              >
                <div>
                  {/* Image container */}
                  <div className="relative w-full h-28 bg-slate-950 rounded-xl overflow-hidden mb-2.5 border border-slate-800/60">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-700">
                        <Package className="w-8 h-8" />
                      </div>
                    )}
                    {product.isPizza && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black rounded-md shadow uppercase">
                        Pizza
                      </span>
                    )}
                    {product.stock <= product.minStock && !product.isPizza && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-500/90 text-white text-[10px] font-bold rounded-md shadow">
                        Low Stock ({product.stock})
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <h4 className="font-bold text-sm text-slate-100 line-clamp-1 group-hover:text-amber-400 transition-colors">
                    {product.name}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5 font-sans">
                    {product.description || product.category?.name}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/60">
                  <span className="text-sm font-extrabold text-amber-400">
                    {formatCurrency(product.basePrice)}
                  </span>
                  <button className="w-7 h-7 rounded-lg bg-amber-500/10 group-hover:bg-amber-500 text-amber-400 group-hover:text-slate-950 flex items-center justify-center font-bold transition-colors">
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
