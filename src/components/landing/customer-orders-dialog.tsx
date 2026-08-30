"use client";

import { useEffect, useState } from "react";
import { CalendarDays, PackageOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CustomerOrder = { invoiceNo: string; status: string; orderType: string; grandTotal: number; createdAt: string; items: Array<{ productName: string; quantity: number }> };
type CustomerOrdersDialogProps = { scope: "active" | "history"; customerName: string; phone: string; onClose: () => void };
const money = (amount: number) => `Rs. ${Math.round(amount).toLocaleString()}`;

export function CustomerOrdersDialog({ scope, customerName, phone: initialPhone, onClose }: CustomerOrdersDialogProps) {
  const [phone, setPhone] = useState(initialPhone);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const title = scope === "active" ? "My Orders" : "Order History";

  async function loadOrders() {
    if (phone.trim().length < 5) return setMessage("Enter the phone number used at checkout.");
    setLoading(true); setMessage("");
    try { const response = await fetch(`/api/public/orders?phone=${encodeURIComponent(phone.trim())}&scope=${scope}`); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Could not load orders."); setOrders(data.orders || []); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not load orders."); } finally { setLoading(false); }
  }

  useEffect(() => { if (initialPhone) void loadOrders(); }, [scope]);

  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4 backdrop-blur-sm"><section role="dialog" aria-modal="true" aria-labelledby="customer-orders-title" className="max-h-[85vh] w-full max-w-lg overflow-auto rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#a4854f]">{customerName ? `Orders for ${customerName}` : "Find your orders"}</p><h2 id="customer-orders-title" className="mt-1 text-2xl font-black text-[#78001b]">{title}</h2></div><Button type="button" variant="ghost" size="icon" className="rounded-full text-[#78001b] hover:bg-rose-50" onClick={onClose} aria-label="Close orders"><X className="h-5 w-5" /></Button></div><div className="mt-5 flex gap-2"><Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone number used at checkout" className="border-stone-200 text-[#4a0a18] focus-visible:border-[#c4002c]" /><Button type="button" className="bg-[#c4002c] text-white hover:bg-[#a40025]" onClick={loadOrders} disabled={loading}>{loading ? "Loading…" : "View"}</Button></div>{message && <p className="mt-3 text-sm text-red-600">{message}</p>}<div className="mt-5 space-y-3">{orders.map((order) => <article key={order.invoiceNo} className="rounded-2xl border border-stone-200 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-black text-[#4a0a18]">{order.invoiceNo}</p><p className="mt-1 flex items-center gap-1 text-xs text-stone-500"><CalendarDays className="h-3.5 w-3.5" />{new Date(order.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}</p></div><span className="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-black uppercase text-[#c4002c]">{order.status.replaceAll("_", " ")}</span></div><p className="mt-3 text-sm text-stone-600">{order.items.map((item) => `${item.quantity}× ${item.productName}`).join(", ")}</p><div className="mt-3 flex justify-between border-t border-stone-100 pt-3 text-sm"><span className="text-stone-500">{order.orderType.toLowerCase()}</span><strong className="text-[#78001b]">{money(order.grandTotal)}</strong></div></article>)}{!loading && !message && orders.length === 0 && <div className="py-10 text-center text-stone-500"><PackageOpen className="mx-auto h-9 w-9 text-[#a4854f]" /><p className="mt-3 font-bold">No {scope === "active" ? "active orders" : "previous orders"} found.</p></div>}</div></section></div>;
}
