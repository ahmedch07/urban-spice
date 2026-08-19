'use client';

import { useState, useEffect } from 'react';
import { X, CreditCard, Banknote, Building2, Globe, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { CartItem, CustomerItem, OrderType, PaymentMethod, RiderItem } from '@/lib/types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  selectedCustomer: CustomerItem | null;
  selectedRider?: RiderItem | null;
  orderType: OrderType;
  tableNo: string;
  subtotal: number;
  discount: number;
  discountType: 'FIXED' | 'PERCENTAGE';
  taxRate: number;
  deliveryFee: number;
  onOrderCompleted: (completedOrder: any) => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  cart,
  selectedCustomer,
  selectedRider,
  orderType,
  tableNo,
  subtotal,
  discount,
  discountType,
  taxRate,
  deliveryFee,
  onOrderCompleted,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [isPendingPayment, setIsPendingPayment] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Calculate totals
  const discountAmount = discountType === 'PERCENTAGE'
    ? (subtotal * discount) / 100
    : discount;
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const taxAmount = (afterDiscount * taxRate) / 100;
  const activeDeliveryFee = orderType === 'DELIVERY' ? deliveryFee : 0;
  const grandTotal = Math.round(afterDiscount + taxAmount + activeDeliveryFee);

  // Reset modal states whenever modal opens or total changes
  useEffect(() => {
    if (isOpen) {
      setAmountPaid(grandTotal);
      setIsPendingPayment(false);
      setErrorMsg('');
      setIsSubmitting(false);
    }
  }, [isOpen, grandTotal]);

  const changeAmount = Math.max(0, amountPaid - grandTotal);

  if (!isOpen) return null;

  const handleQuickCash = (extra: number) => {
    if (extra === 0) {
      setAmountPaid(grandTotal);
    } else {
      const rounded = Math.ceil(grandTotal / extra) * extra;
      setAmountPaid(rounded > grandTotal ? rounded : grandTotal + extra);
    }
  };

  const handleCompletePayment = async () => {
    if (isSubmitting) return;

    setErrorMsg('');
    if (!isPendingPayment && amountPaid < grandTotal) {
      setErrorMsg(`Tendered cash (${amountPaid}) is less than total (${grandTotal})`);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomer?.id || null,
          riderId: selectedRider?.id || null,
          riderName: selectedRider?.name || null,
          riderPhone: selectedRider?.phone || null,
          orderType,
          tableNo,
          items: cart,
          discount,
          discountType,
          tax: taxRate,
          deliveryFee: activeDeliveryFee,
          paymentMethod,
          amountPaid: isPendingPayment ? 0 : amountPaid,
          notes,
          isPendingPayment,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to complete order');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      onOrderCompleted(data.order);
    } catch (e) {
      console.error(e);
      setErrorMsg('Network error submitting order');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-slate-100">Order Checkout & Payment</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          {/* Grand Total Summary Display */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-center shadow-inner">
            <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">
              Total Amount Due
            </span>
            <div className="text-3xl font-black text-amber-400 font-mono mt-1">
              {formatCurrency(grandTotal)}
            </div>
            <div className="text-xs text-slate-400 mt-2 flex items-center justify-center space-x-3">
              <span>Type: <strong className="text-slate-200">{orderType}</strong></span>
              {selectedCustomer && <span>Customer: <strong className="text-slate-200">{selectedCustomer.name}</strong></span>}
            </div>
          </div>

          {/* Payment Status Option: Paid vs Unpaid / Credit */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-xl gap-2">
            <div>
              <h4 className="text-xs font-bold text-slate-200">Order Payment Status</h4>
              <p className="text-[11px] text-slate-400">Save as Paid or Unpaid / Credit (Pending Payment)</p>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsPendingPayment(false);
                  setAmountPaid(grandTotal);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                  !isPendingPayment
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                Paid (Complete)
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPendingPayment(true);
                  setAmountPaid(0);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                  isPendingPayment
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                Unpaid / Credit (Pending)
              </button>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'CASH', label: 'Cash', icon: Banknote },
                { id: 'CARD', label: 'Card', icon: CreditCard },
                { id: 'BANK', label: 'Bank Transfer', icon: Building2 },
                { id: 'ONLINE', label: 'Online / Wallet', icon: Globe },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setPaymentMethod(m.id as PaymentMethod);
                      if (m.id !== 'CASH') setAmountPaid(grandTotal);
                    }}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1.5 ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-bold">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash Tendered & Change Calculator */}
          {paymentMethod === 'CASH' && (
            <div className="space-y-3 bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Amount Received / Tendered (Rs.)
                </label>
                <input
                  type="number"
                  value={amountPaid || ''}
                  onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-lg font-bold font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Quick tender shortcut buttons */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleQuickCash(0)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700"
                >
                  Exact
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickCash(500)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 font-mono"
                >
                  +500
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickCash(1000)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 font-mono"
                >
                  +1000
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickCash(2000)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 font-mono"
                >
                  +2000
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickCash(5000)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 font-mono"
                >
                  +5000
                </button>
              </div>

              {/* Change Box */}
              <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <span className="text-xs font-bold text-emerald-400 uppercase">Change to Return</span>
                <span className="text-xl font-extrabold text-emerald-400 font-mono">
                  {formatCurrency(changeAmount)}
                </span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Order Notes (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Paid via JazzCash / Delivery instructions"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
          >
            Back to Cart
          </button>

          <button
            disabled={isSubmitting}
            onClick={handleCompletePayment}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition-all"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{isSubmitting ? 'Processing Order...' : 'Complete & Print Invoice'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
