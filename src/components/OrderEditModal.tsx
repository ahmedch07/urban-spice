'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CartItemTopping, ProductItem } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

interface OrderEditModalProps {
  order: any | null;
  products: ProductItem[];
  isSaving?: boolean;
  errorMsg?: string;
  onClose: () => void;
  onSave: (updates: Record<string, unknown>) => void;
}

export default function OrderEditModal({
  order,
  products,
  isSaving = false,
  errorMsg = '',
  onClose,
  onSave,
}: OrderEditModalProps) {
  const { riders } = useApp();
  const [status, setStatus] = useState('PENDING');
  const [paymentStatus, setPaymentStatus] = useState('UNPAID');
  const [orderType, setOrderType] = useState('DINE_IN');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [tableNo, setTableNo] = useState('');
  const [riderId, setRiderId] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');

  useEffect(() => {
    if (!order) return;
    setStatus(order.status || 'PENDING');
    setPaymentStatus(order.paymentStatus || 'UNPAID');
    setOrderType(order.orderType || 'DINE_IN');
    setPaymentMethod(order.paymentMethod || 'CASH');
    setTableNo(order.tableNo || '');
    setRiderId(order.riderId || '');
    setItems((order.items || []).map((item: any) => ({
      productId: item.productId,
      productName: item.productName,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      toppings: item.toppings || [],
    })));
    setSelectedProductId('');
  }, [order]);

  if (!order) return null;

  const editableProducts = products.filter((product) => product.active && !product.isPizza);
  const itemsTotal = items.reduce(
    (sum, item) =>
      sum +
      (item.unitPrice +
        (item.toppings || []).reduce(
          (toppingSum: number, topping: CartItemTopping) =>
            toppingSum + (topping.price || 0),
          0
        )) *
        item.quantity,
    0
  );

  const updateQuantity = (index: number, delta: number) => {
    setItems((currentItems) =>
      currentItems.flatMap((item, itemIndex) => {
        if (itemIndex !== index) return [item];
        const quantity = item.quantity + delta;
        return quantity > 0 ? [{ ...item, quantity }] : [];
      })
    );
  };

  const addProduct = () => {
    const product = editableProducts.find((item) => item.id === selectedProductId);
    if (!product) return;
    setItems((currentItems) => {
      const existingIndex = currentItems.findIndex(
        (item) => item.productId === product.id && (!item.toppings || item.toppings.length === 0)
      );
      if (existingIndex < 0) {
        return [
          ...currentItems,
          {
            productId: product.id,
            productName: product.name,
            unitPrice: product.basePrice,
            quantity: 1,
            toppings: [],
          },
        ];
      }
      return currentItems.map((item, index) =>
        index === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
      );
    });
    setSelectedProductId('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-100">Edit Order</h2>
            <p className="mt-0.5 text-xs font-mono text-amber-400">{order.invoiceNo}</p>
          </div>
          <button onClick={onClose} disabled={isSaving} className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="text-xs font-semibold text-slate-300">
            Kitchen Status
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-xs text-slate-100 focus:border-amber-500 focus:outline-none font-bold"
            >
              {['PENDING', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED', 'REFUNDED'].map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>

          <label className="text-xs font-semibold text-slate-300">
            Payment Status
            <select
              value={paymentStatus}
              onChange={(event) => setPaymentStatus(event.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-xs text-slate-100 focus:border-amber-500 focus:outline-none font-bold text-amber-400"
            >
              <option value="UNPAID">UNPAID (Open Tab)</option>
              <option value="PAID">PAID (Settled)</option>
            </select>
          </label>

          <label className="text-xs font-semibold text-slate-300">
            Order Type
            <select
              value={orderType}
              onChange={(event) => setOrderType(event.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
            >
              <option value="DINE_IN">Dine In (Table)</option>
              <option value="TAKEAWAY">Takeaway Counter</option>
              <option value="DELIVERY">Delivery Order</option>
            </select>
          </label>

          {orderType === 'DINE_IN' ? (
            <label className="text-xs font-semibold text-slate-300">
              Table Name / No.
              <Input
                value={tableNo}
                onChange={(event) => setTableNo(event.target.value)}
                placeholder="e.g. Table 1"
                className="mt-1 font-mono font-bold text-xs"
              />
            </label>
          ) : orderType === 'DELIVERY' ? (
            <label className="text-xs font-semibold text-slate-300">
              Assigned Delivery Rider
              <select
                value={riderId}
                onChange={(e) => setRiderId(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-xs text-slate-100 focus:border-amber-500 focus:outline-none font-mono"
              >
                <option value="">-- No Rider Assigned --</option>
                {riders.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.phone})
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <div />
          )}

          <label className="text-xs font-semibold text-slate-300 sm:col-span-2">
            Payment Method
            <select
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
            >
              {['CASH', 'CARD', 'BANK', 'ONLINE'].map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>
        </div>

        {/* Ordered Items Editor */}
        <div className="mt-5 border-t border-slate-800 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-300">Ordered Items</p>
            <span className="font-mono text-sm font-black text-amber-400">{formatCurrency(itemsTotal)}</span>
          </div>
          <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
            {items.map((item, index) => (
              <div key={`${item.productId || item.productName}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950 p-2.5">
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-slate-100">{item.productName}</p>
                  <p className="text-[10px] text-slate-400">{formatCurrency(item.unitPrice)} each</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => updateQuantity(index, -1)} className="h-7 w-7 rounded-lg border border-slate-700 text-sm font-bold text-slate-300 hover:border-amber-500">−</button>
                  <span className="w-5 text-center font-mono text-xs font-bold text-slate-100">{item.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(index, 1)} className="h-7 w-7 rounded-lg border border-slate-700 text-sm font-bold text-slate-300 hover:border-amber-500">+</button>
                  <button type="button" onClick={() => setItems((currentItems) => currentItems.filter((_, itemIndex) => itemIndex !== index))} className="ml-1 text-xs font-bold text-rose-400 hover:text-rose-300">Remove</button>
                </div>
              </div>
            ))}
            {items.length === 0 && <p className="rounded-xl border border-dashed border-slate-700 p-3 text-center text-xs text-slate-400">Add at least one item before saving.</p>}
          </div>
          <div className="mt-3 flex gap-2">
            <select value={selectedProductId} onChange={(event) => setSelectedProductId(event.target.value)} className="h-10 min-w-0 flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 text-xs text-slate-100 focus:border-amber-500 focus:outline-none">
              <option value="">Add menu item...</option>
              {editableProducts.map((product) => <option key={product.id} value={product.id}>{product.name} — {formatCurrency(product.basePrice)}</option>)}
            </select>
            <Button type="button" variant="outline" onClick={addProduct} disabled={!selectedProductId}>Add</Button>
          </div>
        </div>

        {errorMsg && <p className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">{errorMsg}</p>}

        <div className="mt-6 flex justify-end gap-3 border-t border-slate-800 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button
            onClick={() => onSave({
              status,
              paymentStatus,
              paymentMethod,
              orderType,
              tableNo: orderType === 'DINE_IN' ? (tableNo || null) : null,
              riderId: orderType === 'DELIVERY' ? (riderId || null) : null,
              items,
            })}
            disabled={isSaving || items.length === 0}
          >
            {isSaving ? 'Saving...' : 'Save Order Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
