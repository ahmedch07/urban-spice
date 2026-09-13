import { ChevronRight, Home, ShoppingBag, UtensilsCrossed, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type CategoryItem = {
  id: string;
  name: string;
  itemCount?: number;
};

type CustomerMenuDrawerProps = {
  onClose: () => void;
  onHome: () => void;
  onCart: () => void;
  categories?: CategoryItem[];
  selectedCategory?: string;
  onSelectCategory?: (id: string) => void;
};

export function CustomerMenuDrawer({
  onClose,
  onHome,
  onCart,
  categories = [],
  selectedCategory = "all",
  onSelectCategory,
}: CustomerMenuDrawerProps) {
  const links = [
    { label: "Home", icon: Home, onClick: onHome },
    { label: "Cart", icon: ShoppingBag, onClick: onCart },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity" role="presentation">
      <aside
        aria-label="Customer menu"
        className="h-full w-[min(22rem,88vw)] bg-white p-5 shadow-2xl flex flex-col justify-between overflow-hidden"
      >
        <div className="flex-1 overflow-y-auto pr-1">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-4 sticky top-0 bg-white z-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a4854f]">Urban Spice</p>
              <h2 className="mt-1 text-xl font-black text-[#78001b]">Menu & Navigation</h2>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full text-[#78001b] hover:bg-rose-50"
              onClick={onClose}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Quick Nav Links */}
          <nav className="mt-4 space-y-1">
            {links.map(({ label, icon: Icon, onClick }) => (
              <Button
                key={label}
                type="button"
                variant="ghost"
                className="h-11 w-full justify-start gap-3 rounded-xl px-3 text-sm font-bold text-[#4a0a18] hover:bg-rose-50 hover:text-[#78001b]"
                onClick={() => {
                  onClick();
                  onClose();
                }}
              >
                <Icon className="h-4 w-4 text-[#c4002c]" />
                {label}
              </Button>
            ))}
          </nav>

          {/* Category Section Header */}
          {categories.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between px-1 mb-2">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#a4854f]">
                  Menu Categories
                </p>
                <span className="text-[10px] font-bold text-stone-400">
                  {categories.length} Categories
                </span>
              </div>

              <div className="space-y-1">
                {/* All items button */}
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectCategory) onSelectCategory("all");
                    onClose();
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition-colors ${
                    selectedCategory === "all"
                      ? "bg-[#78001b] text-white shadow-sm"
                      : "text-stone-700 hover:bg-rose-50 hover:text-[#78001b]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <UtensilsCrossed className={`h-4 w-4 ${selectedCategory === "all" ? "text-amber-400" : "text-[#c4002c]"}`} />
                    <span>All Menu Items</span>
                  </div>
                  <ChevronRight className={`h-3.5 w-3.5 ${selectedCategory === "all" ? "text-white" : "text-stone-400"}`} />
                </button>

                {categories.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        if (onSelectCategory) onSelectCategory(cat.id);
                        onClose();
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition-colors ${
                        isActive
                          ? "bg-[#78001b] text-white shadow-sm"
                          : "text-stone-700 hover:bg-rose-50 hover:text-[#78001b]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`grid h-6 w-6 place-items-center rounded-lg text-xs font-black ${
                          isActive ? "bg-white/20 text-white" : "bg-rose-50 text-[#c4002c]"
                        }`}>
                          {cat.name.charAt(0)}
                        </span>
                        <span>{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {typeof cat.itemCount === "number" && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-stone-100 text-stone-500"
                            }`}
                          >
                            {cat.itemCount}
                          </span>
                        )}
                        <ChevronRight className={`h-3.5 w-3.5 ${isActive ? "text-white" : "text-stone-300"}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer info inside sidebar */}
        <div className="border-t border-stone-100 pt-3 mt-2 text-center shrink-0">
          <p className="text-[11px] font-bold text-stone-400">Urban Spice — Ultimate Taste</p>
        </div>
      </aside>
    </div>
  );
}
