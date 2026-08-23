'use client';

import { useState, useEffect } from 'react';
import { X, CreditCard, Banknote, Building2, Globe, CheckCircle2, Truck } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { formatCurrency } from '@/lib/utils';
import { CartItem, CustomerItem, OrderType, PaymentMethod, RestaurantTableItem, RiderItem } from '@/lib/types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  selectedCustomer: CustomerItem | null;
  selectedTable?: RestaurantTableItem | null;
  selectedRider?: RiderItem | null;
  deliveryFee?: number;
  activeOrderId?: string | null;
  orderType: OrderType;
  tableNo: string;
  subtotal: number;
  discount: number;
  discountType: 'FIXED' | 'PERCENTAGE';
  taxRate: number;
  onOrderCompleted: (completedOrder: any) => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  cart,
  selectedCustomer,
  selectedTable,
  selectedRider,
  deliveryFee = 0,
  activeOrderId,
  orderType,
  tableNo,
  subtotal,
  discount,
  discountType,
  taxRate,
  onOrderCompleted,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Calculate totals
  const discountAmount = discountType === 'PERCENTAGE'
    ? (subtotal * discount) / 100
    : discount;
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const taxAmount = (afterDiscount * taxRate) / 100;
  const effectiveDeliveryFee = orderType === 'DELIVERY' ? Number(deliveryFee || 0) : 0;
  const grandTotal = Math.round(afterDiscount + taxAmount + effectiveDeliveryFee);

  // Reset modal states whenever modal opens or total changes
  useEffect(() => {
    if (isOpen) {
      setAmountPaid(grandTotal);
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
    if (amountPaid < grandTotal) {
      setErrorMsg(`Tendered cash (${amountPaid}) is less than total bill (${grandTotal})`);
      return;
    }

    setIsSubmitting(true);

    try {
      let data: any;

      if (activeOrderId) {
        // Settle / Pay an existing open table order
        const res = await fetch(`/api/orders/${activeOrderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'COMPLETED',
            paymentStatus: 'PAID',
            paymentMethod,
            amountPaid,
            notes,
            items: cart,
            riderId: selectedRider?.id || null,
            riderName: selectedRider?.name || null,
            riderPhone: selectedRider?.phone || null,
            deliveryFee: effectiveDeliveryFee,
          }),
        });

        data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.error || 'Failed to complete payment for table order');
          setIsSubmitting(false);
          return;
        }
      } else {
        // Create and complete new paid order
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerId: selectedCustomer?.id || null,
            tableId: selectedTable?.id || null,
            tableNo: selectedTable?.name || tableNo || null,
            riderId: selectedRider?.id || null,
            riderName: selectedRider?.name || null,
            riderPhone: selectedRider?.phone || null,
            deliveryFee: effectiveDeliveryFee,
            orderType,
            items: cart,
            discount,
            discountType,
            tax: taxRate,
            paymentMethod,
            amountPaid,
            notes,
            paymentStatus: 'PAID',
          }),
        });

        data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.error || 'Failed to complete payment');
          setIsSubmitting(false);
          return;
        }
      }

      setIsSubmitting(false);
      toast.success('Payment completed successfully!');
      onOrderCompleted(data.order);
    } catch {
      toast.error('Network error submitting payment');
      setErrorMsg('Network error submitting payment');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <CreditCard className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-100">
                Payment & Bill Settlement
              </h2>
              <p className="text-xs text-slate-400">
                {selectedTable
                  ? `${selectedTable.name} • Dine-In Order`
                  : orderType === 'DELIVERY'
                  ? `Delivery Order ${selectedRider ? `• Rider: ${selectedRider.name}` : ''}`
                  : 'Takeaway Counter Order'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {errorMsg && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-2xl font-medium">
              {errorMsg}
            </div>
          )}

          {/* Amount Due Banner */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-inner">
            <div>
              <span className="text-xs text-slate-400 font-medium">Total Bill Amount</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">
                {formatCurrency(grandTotal)}
              </div>
            </div>

            <div className="text-right text-xs space-y-0.5 text-slate-400">
              <div>Subtotal: {formatCurrency(subtotal)}</div>
              {discountAmount > 0 && <div className="text-emerald-400">Discount: -{formatCurrency(discountAmount)}</div>}
              {taxAmount > 0 && <div>Tax: +{formatCurrency(taxAmount)}</div>}
              {effectiveDeliveryFee > 0 && <div className="text-amber-400">Delivery: +{formatCurrency(effectiveDeliveryFee)}</div>}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Payment Method
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`py-3 rounded-2xl border flex flex-col items-center justify-center space-y-1.5 transition-all ${
                  paymentMethod === 'CASH'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-lg shadow-amber-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span className="text-xs">Cash</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`py-3 rounded-2xl border flex flex-col items-center justify-center space-y-1.5 transition-all ${
                  paymentMethod === 'CARD'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-lg shadow-amber-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-xs">Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('BANK')}
                className={`py-3 rounded-2xl border flex flex-col items-center justify-center space-y-1.5 transition-all ${
                  paymentMethod === 'BANK'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-lg shadow-amber-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span className="text-xs">Bank Transfer</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('ONLINE')}
                className={`py-3 rounded-2xl border flex flex-col items-center justify-center space-y-1.5 transition-all ${
                  paymentMethod === 'ONLINE'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-lg shadow-amber-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-5 h-5" />
                <span className="text-xs">Online / Easypaisa</span>
              </button>
            </div>
          </div>

          {/* Cash Received & Change Calculations (Only if Cash selected) */}
          {paymentMethod === 'CASH' && (
            <div className="space-y-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Tendered Cash Received (Rs.)
                </label>
                <input
                  type="number"
                  value={amountPaid || ''}
                  onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-lg font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Quick Cash Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-slate-500 font-semibold">Quick Cash:</span>
                <button
                  type="button"
                  onClick={() => handleQuickCash(0)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono font-bold border border-slate-700 transition"
                >
                  Exact ({formatCurrency(grandTotal)})
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickCash(500)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono font-bold border border-slate-700 transition"
                >
                  +500
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickCash(1000)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono font-bold border border-slate-700 transition"
                >
                  +1,000
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickCash(5000)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono font-bold border border-slate-700 transition"
                >
                  +5,000
                </button>
              </div>

              {/* Change calculation */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-sm">
                <span className="font-bold text-slate-300">Change Due to Customer:</span>
                <span
                  className={`font-mono font-extrabold text-lg ${
                    amountPaid < grandTotal ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {amountPaid < grandTotal
                    ? `Underpaid by ${formatCurrency(grandTotal - amountPaid)}`
                    : formatCurrency(changeAmount)}
                </span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Order Notes / Instructions (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Less spicy, packing with extra sauces"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-colors"
          >
            Back to Order
          </button>

          <button
            type="button"
            onClick={handleCompletePayment}
            disabled={isSubmitting || amountPaid < grandTotal}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Processing...' : `Complete Payment (${formatCurrency(grandTotal)})`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
