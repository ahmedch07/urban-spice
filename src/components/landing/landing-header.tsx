import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

type LandingHeaderProps = { storeLogo?: string; storeName?: string; itemCount: number; onOpenCart: () => void };

export function LandingHeader({ storeLogo, storeName, itemCount, onOpenCart }: LandingHeaderProps) {
  return <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 backdrop-blur"><div className="mx-auto flex max-w-6xl items-center justify-between p-4"><div className="flex items-center gap-3"><img className="h-10 w-10 rounded-full object-cover" src={storeLogo || "/logo.png"} alt={storeName || "Urban Spice"} /><div><p className="font-bold">{storeName || "Urban Spice"}</p><p className="text-xs text-amber-400">Order fresh, your way</p></div></div><Button type="button" onClick={onOpenCart} className="gap-1.5"><ShoppingBag className="h-4 w-4" />Cart ({itemCount})</Button></div></header>;
}
