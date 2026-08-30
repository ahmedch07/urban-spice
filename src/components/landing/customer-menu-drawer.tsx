import { ClipboardList, History, Home, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type CustomerMenuDrawerProps = { onClose: () => void; onHome: () => void; onCart: () => void; onMyOrders: () => void; onOrderHistory: () => void };

export function CustomerMenuDrawer({ onClose, onHome, onCart, onMyOrders, onOrderHistory }: CustomerMenuDrawerProps) {
  const links = [{ label: "Home", icon: Home, onClick: onHome }, { label: "Cart", icon: ShoppingBag, onClick: onCart }, { label: "My Orders", icon: ClipboardList, onClick: onMyOrders }, { label: "Order History", icon: History, onClick: onOrderHistory }];
  return <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" role="presentation"><aside aria-label="Customer menu" className="h-full w-[min(21rem,88vw)] bg-white p-5 shadow-2xl"><div className="flex items-center justify-between border-b border-stone-100 pb-4"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a4854f]">Urban Spice</p><h2 className="mt-1 text-xl font-black text-[#78001b]">Menu</h2></div><Button type="button" variant="ghost" size="icon" className="rounded-full text-[#78001b] hover:bg-rose-50" onClick={onClose} aria-label="Close menu"><X className="h-5 w-5" /></Button></div><nav className="mt-5 space-y-1">{links.map(({ label, icon: Icon, onClick }) => <Button key={label} type="button" variant="ghost" className="h-12 w-full justify-start gap-3 rounded-xl px-3 text-sm font-bold text-[#4a0a18] hover:bg-rose-50 hover:text-[#78001b]" onClick={() => { onClick(); onClose(); }}><Icon className="h-4 w-4 text-[#c4002c]" />{label}</Button>)}</nav></aside></div>;
}
