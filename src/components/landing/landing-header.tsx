import { Flame, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

type LandingHeaderProps = { storeLogo?: string; storeName?: string; itemCount: number; onOpenCart: () => void };

export function LandingHeader({ storeLogo, storeName, itemCount, onOpenCart }: LandingHeaderProps) {
  return <header className="sticky top-0 z-20 border-b border-orange-200/70 bg-[#fffaf3]/90 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6"><div className="flex items-center gap-3"><img className="h-11 w-11 rounded-2xl border border-orange-200 bg-white object-cover p-0.5 shadow-sm" src={storeLogo || "/logo.png"} alt={storeName || "Urban Spice"} /><div className="leading-tight"><p className="font-black tracking-tight text-[#32170e]">{storeName || "Urban Spice"}</p><p className="mt-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-600"><Flame className="h-3 w-3" /> Fresh from our kitchen</p></div></div><Button type="button" size="lg" onClick={onOpenCart} className="h-10 rounded-full bg-[#32170e] px-4 text-xs text-white shadow-lg shadow-orange-950/15 hover:bg-[#572314] sm:px-5"><ShoppingBag className="h-4 w-4" /><span className="hidden sm:inline">Your order</span><span className="grid h-5 min-w-5 place-items-center rounded-full bg-orange-400 px-1 text-[10px] text-[#32170e]">{itemCount}</span></Button></div></header>;
}
