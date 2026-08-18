'use client';

import React from 'react';
import { Search, Pizza, Package, Layers, Sparkles } from 'lucide-react';
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
  onOpenPizzaModal: () => void;
}

export default function ProductGrid({
  categories = [],
  products,
  selectedCategory = 'all',
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onSelectProduct,
  onOpenPizzaModal,
}: ProductGridProps) {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950 p-4 space-y-4">
      {/* Top Search & Filter Header */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            id="pos-search-input"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search items by name, category or SKU... (Press F2)"
            className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors shadow-inner font-sans"
          />
        </div>

        {/* Category Tabs Scroll Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800 select-none">
          {/* ALL CATEGORIES TAB */}
          <button
            onClick={() => onSelectCategory && onSelectCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all duration-150 flex items-center space-x-1.5 shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-105'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>All Items</span>
          </button>

          {/* DYNAMIC CATEGORY TABS IN EXACT MENU ORDER */}
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            const isPizzaCategory = cat.name.toLowerCase().includes('pizza');
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory && onSelectCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all duration-150 flex items-center space-x-1.5 shrink-0 ${
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

      {/* Quick Pizza Builder Banner */}
      <div
        onClick={onOpenPizzaModal}
        className="bg-gradient-to-r from-amber-600 via-amber-500 to-red-600 rounded-2xl p-3.5 cursor-pointer shadow-lg shadow-amber-500/10 hover:brightness-110 transition-all flex items-center justify-between border border-amber-400/30 group shrink-0"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-950/40 text-amber-300 flex items-center justify-center backdrop-blur">
            <Pizza className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-950/50 text-amber-300 border border-amber-400/30">
                Customizer
              </span>
              <h3 className="font-extrabold text-sm text-slate-950">Select Pizza Flavor & Size</h3>
            </div>
            <p className="text-[11px] text-slate-950/80 font-medium">
              Pick Small (7"), Medium (10"), Large (13"), X.Large (17") & Crusts
            </p>
          </div>
        </div>
        <button className="px-3.5 py-1.5 bg-slate-950 text-amber-400 font-bold text-xs rounded-xl shadow group-hover:scale-105 transition-transform">
          Pizza Multi-Size →
        </button>
      </div>

      {/* Products Grid - Sorted & Categorized */}
      <div className="flex-1 overflow-y-auto pr-1">
        {products.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-2">
            <Package className="w-12 h-12 stroke-1 text-slate-600" />
            <p className="text-sm font-semibold">Is category mein koi item nahi mila</p>
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
                className="group bg-slate-900 border border-slate-800 hover:border-amber-500/60 rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10 select-none"
              >
                <div>
                  {/* Image container */}
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
                          <Pizza className="w-10 h-10 text-amber-500/40" />
                        ) : (
                          <Package className="w-10 h-10 text-slate-800" />
                        )}
                        <span className="text-[10px] text-slate-600 mt-1 font-mono uppercase">
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
                    <span className="text-xs text-slate-400 block text-[9px] uppercase font-semibold">Price</span>
                    <span className="text-xs font-black text-amber-400 font-mono">
                      {formatCurrency(product.basePrice)}
                    </span>
                  </div>
                  <button className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 group-hover:bg-amber-500 text-amber-400 group-hover:text-slate-950 text-xs font-black transition-all flex items-center space-x-1 shadow">
                    <span>+ Add</span>
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
