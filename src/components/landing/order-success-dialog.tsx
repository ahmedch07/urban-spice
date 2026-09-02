import { CheckCircle2, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CartItem, Customer, OrderType, PaymentMethod } from "./types";

type ReceiptOrder = {
  invoiceNo?: string;
  createdAt: string;
  customer: Customer;
  orderType: OrderType;
  paymentMethod: PaymentMethod;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
  storeName?: string;
  storeLogo?: string;
};

type OrderSuccessDialogProps = { order: ReceiptOrder; onClose: () => void };
const formatMoney = (value: number) => `Rs. ${Math.round(value).toLocaleString()}`;

export function OrderSuccessDialog({
  order,
  onClose,
}: OrderSuccessDialogProps) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-[#32170e]/50 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-dialog-title"
        className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-[#fffaf3] shadow-2xl"
      >
        <header className="no-print flex items-center justify-between border-b border-orange-100 p-5">
          <div className="flex items-center gap-3 text-left">
            <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-500" />
            <div>
              <h2 id="receipt-dialog-title" className="font-black text-[#32170e]">Order received!</h2>
              <p className="text-sm text-stone-500">Your receipt is ready.</p>
            </div>
          </div>
          <Button type="button" variant="ghost" size="icon" className="rounded-full" onClick={onClose} aria-label="Close receipt"><X className="h-5 w-5" /></Button>
        </header>

        <div className="flex-1 overflow-y-auto bg-stone-100 p-5">
          <article id="printable-receipt" className="mx-auto w-full max-w-[80mm] bg-white p-5 font-mono text-xs text-black shadow-sm">
            <div className="border-b border-dashed border-stone-400 pb-3 text-center">
              {order.storeLogo && <img src={order.storeLogo} alt="Store logo" className="mx-auto mb-2 h-12 w-12 rounded-full object-contain" />}
              <h3 className="text-base font-black uppercase">{order.storeName || "Urban Spice"}</h3>
              <p className="mt-1 text-[10px]">Thank you for your order!</p>
            </div>
            <div className="space-y-1 border-b border-dashed border-stone-400 py-3">
              <div className="flex justify-between"><span>Invoice</span><strong>{order.invoiceNo || "—"}</strong></div>
              <div className="flex justify-between"><span>Date</span><span>{new Date(order.createdAt).toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Order type</span><span>{order.orderType}</span></div>
              <div className="pt-1 text-[10px]"><p>Customer: {order.customer.name}</p><p>Phone: {order.customer.phone}</p>{order.customer.address && <p>Address: {order.customer.address}</p>}</div>
            </div>
            <div className="space-y-3 border-b border-dashed border-stone-400 py-3">
              {order.items.map((item) => <div key={item.key} className="space-y-1"><div className="flex justify-between gap-3 font-bold"><span>{item.name}</span><span>{formatMoney(item.price * item.quantity)}</span></div><div className="flex justify-between text-[10px] text-stone-600"><span>{item.quantity} × {formatMoney(item.price)}</span>{item.toppingIds.length > 0 && <span>Custom toppings</span>}</div></div>)}
            </div>
            <div className="space-y-1 border-b border-dashed border-stone-400 py-3">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatMoney(order.subtotal)}</span></div>
              {order.deliveryFee > 0 && <div className="flex justify-between"><span>Delivery fee</span><span>{formatMoney(order.deliveryFee)}</span></div>}
              <div className="flex justify-between border-t border-stone-300 pt-2 text-sm font-black"><span>Total</span><span>{formatMoney(order.grandTotal)}</span></div>
              <div className="flex justify-between pt-1 text-[10px]"><span>Payment</span><span>{order.paymentMethod}</span></div>
            </div>
            <p className="pt-3 text-center text-[10px] text-stone-600">Please keep this receipt for your records.</p>
          </article>
        </div>

        <footer className="no-print flex gap-3 border-t border-orange-100 bg-white p-4">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Back to menu</Button>
          <Button type="button" className="flex-1 bg-[#32170e] text-white hover:bg-[#572314]" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Print Bill</Button>
        </footer>
      </section>
    </div>
  );
}
