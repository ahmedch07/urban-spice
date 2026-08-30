import { Plus, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "./types";

const formatMoney = (value: number) => `Rs. ${Math.round(value).toLocaleString()}`;

function getProductImage(product: Product) {
  if (product.image) return product.image;

  const title = (product.name || "Urban Spice").replace(/&/g, "and");
  const label = (product.category?.name || "Menu Item").replace(/&/g, "and");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#fff1e6"/>
          <stop offset="100%" stop-color="#f2d7ad"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="#fffaf3"/>
      <rect x="40" y="40" width="720" height="520" rx="32" fill="url(#g)"/>
      <circle cx="400" cy="220" r="120" fill="#c4002c" opacity="0.12"/>
      <circle cx="400" cy="220" r="80" fill="#c4002c" opacity="0.18"/>
      <text x="400" y="360" text-anchor="middle" font-size="48" font-family="Segoe UI, Arial, sans-serif" font-weight="700" fill="#4a0a18">${title}</text>
      <text x="400" y="420" text-anchor="middle" font-size="22" font-family="Segoe UI, Arial, sans-serif" fill="#7c4d1d">${label}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

type ProductGridProps = { products: Product[]; onAdd: (product: Product) => void; onCustomize: (product: Product) => void };

export function ProductGrid({ products, onAdd, onCustomize }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-white/70 p-8 text-center text-sm text-stone-500 shadow-sm">
        No items found in this category yet.
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <article
          key={product.id}
          className="group overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-900/10"
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
            <img
              src={getProductImage(product)}
              alt={product.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            {product.isPizza && (
              <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#78001b] shadow-md">
                Customize
              </span>
            )}
          </div>
          <div className="p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#a4854f]">
              {product.category?.name || "Urban Spice"}
            </p>
            <h2 className="mt-1.5 truncate text-base font-black tracking-tight text-[#4a0a18]">
              {product.name}
            </h2>
            <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-stone-500">
              {product.description || "Freshly prepared Urban Spice favourite."}
            </p>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-stone-100 pt-3">
              <strong className="text-base text-[#4a0a18]">
                {product.isPizza ? "From " : ""}
                {formatMoney(product.basePrice)}
              </strong>
              <Button
                type="button"
                size="icon"
                className="h-9 w-9 rounded-full bg-[#c4002c] text-white shadow-sm hover:bg-[#a40025]"
                onClick={() => (product.isPizza ? onCustomize(product) : onAdd(product))}
                aria-label={product.isPizza ? `Customize ${product.name}` : `Add ${product.name} to order`}
              >
                {product.isPizza ? <SlidersHorizontal className="h-4 w-4" /> : <Plus className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
