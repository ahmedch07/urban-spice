import { Button } from "@/components/ui/button";
import type { Product } from "./types";

const formatMoney = (value: number) => `Rs. ${Math.round(value).toLocaleString()}`;
type ProductGridProps = { products: Product[]; onAdd: (product: Product) => void; onCustomize: (product: Product) => void };

export function ProductGrid({ products, onAdd, onCustomize }: ProductGridProps) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => <article key={product.id} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900"><img src={product.image || "/logo.png"} alt={product.name} className="h-44 w-full object-cover" /><div className="p-4"><p className="text-xs font-bold text-amber-400">{product.category?.name}</p><h2 className="mt-1 font-extrabold">{product.name}</h2><p className="mt-1 min-h-10 text-xs text-slate-400">{product.description || "Freshly prepared Urban Spice favourite."}</p><div className="mt-4 flex items-center justify-between gap-3"><strong>{product.isPizza ? "From " : ""}{formatMoney(product.basePrice)}</strong><Button type="button" size="sm" onClick={() => product.isPizza ? onCustomize(product) : onAdd(product)}>{product.isPizza ? "Customize" : "Add"}</Button></div></div></article>)}</div>;
}
