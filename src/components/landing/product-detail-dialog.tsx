import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MenuData, Product } from "./types";

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

function getPizzaFlavorOrder(name: string) {
  const normalized = name.toLowerCase();

  if (normalized.includes("special")) return 0;
  if (normalized.includes("stuffer")) return 1;
  if (normalized.includes("regular")) return 2;
  if (normalized.includes("square")) return 3;

  return 4;
}

function sortPizzaFlavors<T extends { name: string; id: string }>(items: T[]) {
  return [...items].sort((a, b) => {
    const aOrder = getPizzaFlavorOrder(a.name);
    const bOrder = getPizzaFlavorOrder(b.name);

    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.name.localeCompare(b.name);
  });
}

type ProductDetailDialogProps = {
  product: Product;
  menu: MenuData;
  flavorId: string;
  sizeId: string;
  crustId: string;
  toppingIds: string[];
  onFlavorChange: (value: string) => void;
  onSizeChange: (value: string) => void;
  onCrustChange: (value: string) => void;
  onToggleTopping: (id: string) => void;
  onAdd: () => void;
  onClose: () => void;
};

export function ProductDetailDialog({
  product,
  menu,
  flavorId,
  sizeId,
  crustId,
  toppingIds,
  onFlavorChange,
  onSizeChange,
  onCrustChange,
  onToggleTopping,
  onAdd,
  onClose,
}: ProductDetailDialogProps) {
  const hasPizzaOptions = product.isPizza || menu.flavors.length > 0;
  const sizeOptions = menu.sizes.length > 0
    ? menu.sizes
    : [
        { id: "small", name: "Small" },
        { id: "medium", name: "Medium" },
        { id: "large", name: "Large" },
      ];

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-[#32170e]/60 p-0 backdrop-blur-sm sm:place-items-center sm:p-4">
      <section className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-t-3xl bg-[#fffaf3] p-5 text-[#32170e] shadow-2xl sm:rounded-3xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
              <img
                src={getProductImage(product)}
                alt={product.name}
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.src = getProductImage({ ...product, image: null });
                }}
              />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a4854f]">
                {product.category?.name || "Urban Spice"}
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight">{product.name}</h2>
            </div>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close product details">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-100">
          <p className="text-sm leading-6 text-stone-600">
            {product.description || "Freshly prepared and packed with rich flavor."}
          </p>
        </div>

        {hasPizzaOptions && (
          <div className="mt-5 space-y-5">
            <div>
              <p className="mb-2 text-sm font-black uppercase tracking-[0.14em] text-[#a4854f]">Size</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {sizeOptions.map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => onSizeChange(size.id)}
                    className={sizeId === size.id
                      ? "rounded-xl bg-[#4a0a18] px-3 py-2 text-center text-xs font-black text-white"
                      : "rounded-xl border border-stone-200 bg-white px-3 py-2 text-center text-xs font-bold text-[#4a0a18] hover:bg-stone-50"}
                  >
                    {size.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-black uppercase tracking-[0.14em] text-[#a4854f]">Crust</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onCrustChange("")}
                  className={crustId === "" ? "rounded-full bg-[#4a0a18] px-3 py-1.5 text-xs font-black text-white" : "rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-[#4a0a18] hover:bg-stone-50"}
                >
                  Regular
                </button>
                {menu.crusts.map((crust) => (
                  <button
                    key={crust.id}
                    type="button"
                    onClick={() => onCrustChange(crust.id)}
                    className={crustId === crust.id ? "rounded-full bg-[#4a0a18] px-3 py-1.5 text-xs font-black text-white" : "rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-[#4a0a18] hover:bg-stone-50"}
                  >
                    {crust.name} (+{formatMoney(crust.additionalPrice)})
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-5">
          <p className="mb-2 text-sm font-black uppercase tracking-[0.14em] text-[#a4854f]">Extra toppings</p>
          <div className="grid grid-cols-2 gap-2">
            {menu.toppings.map((topping) => (
              <button
                key={topping.id}
                type="button"
                onClick={() => onToggleTopping(topping.id)}
                className={toppingIds.includes(topping.id)
                  ? "rounded-xl bg-[#ffedd5] px-3 py-2 text-left text-xs font-black text-[#4a0a18] ring-1 ring-[#f59e0b]"
                  : "rounded-xl border border-stone-200 bg-white px-3 py-2 text-left text-xs font-bold text-[#4a0a18] hover:bg-stone-50"}
              >
                {topping.name} (+{formatMoney(topping.additionalPrice)})
              </button>
            ))}
          </div>
        </div>

        <Button type="button" size="lg" className="mt-6 w-full bg-[#32170e] text-white hover:bg-[#572314]" onClick={onAdd}>
          Add to bill
        </Button>
      </section>
    </div>
  );
}
