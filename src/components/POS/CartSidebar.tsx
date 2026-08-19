'use client';

import React, { useState } from 'react';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  UserPlus,
  UserCheck,
  Percent,
  Truck,
  Armchair,
  ShoppingBag as TakeawayIcon,
  CreditCard,
  X,
  Edit2,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { CartItem, CustomerItem, OrderType, RiderItem } from '@/lib/types';

interface CartSidebarProps {
  cart: CartItem[];
  onUpdateQuantity: (cartId: string, delta: number) => void;
  onRemoveItem: (cartId: string) => void;
  onClearCart: () => void;
  selectedCustomer: CustomerItem | null;
  onOpenCustomerModal: () => void;
  onRemoveCustomer: () => void;
  riders?: RiderItem[];
  selectedRider?: RiderItem | null;
  onSelectRider?: (rider: RiderItem | null) => void;
  orderType: OrderType;
  onOrderTypeChange: (type: OrderType) => void;
  tableNo: string;
  onTableNoChange: (t: string) => void;
  discount: number;
  onDiscountChange: (d: number) => void;
  discountType: 'FIXED' | 'PERCENTAGE';
  onDiscountTypeChange: (t: 'FIXED' | 'PERCENTAGE') => void;
  deliveryFee: number;
  onDeliveryFeeChange: (f: number) => void;
  taxRate: number;
  onTaxRateChange?: (r: number) => void;
  onCheckout: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function CartSidebar({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  selectedCustomer,
  onOpenCustomerModal,
  onRemoveCustomer,
  riders = [],
  selectedRider,
  onSelectRider,
  orderType,
  onOrderTypeChange,
  tableNo,
  onTableNoChange,
  discount,
  onDiscountChange,
  discountType,
  onDiscountTypeChange,
  deliveryFee,
  onDeliveryFeeChange,
  taxRate,
  onTaxRateChange,
  onCheckout,
  isMobileOpen = false,
  onCloseMobile,
}: CartSidebarProps) {
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [showTaxInput, setShowTaxInput] = useState(false);
  const [showTaxBreakdown, setShowTaxBreakdown] = useState(false);

  // Subtotal Calculation
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  // Discount Calculation
  const discountAmount =
    discountType === 'PERCENTAGE'
      ? Math.round((subtotal * discount) / 100)
      : Math.min(discount, subtotal);

  const afterDiscount = Math.max(0, subtotal - discountAmount);

  // GST Tax Calculation
  const taxAmount = Math.round((afterDiscount * taxRate) / 100);

  // Delivery Fee
  const activeDeliveryFee = orderType === 'DELIVERY' ? deliveryFee : 0;

  // Grand Total
  const grandTotal = Math.round(afterDiscount + taxAmount + activeDeliveryFee);

  const cartContent = (
    <div className="w-full h-full bg-slate-900 flex flex-col select-none">
      {/* 1. Header & Order Type Selector */}
      <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-900/90">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-base text-slate-100">Current Order</h2>
            {cart.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                {cart.reduce((s, i) => s + i.quantity, 0)} items
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {cart.length > 0 && (
              <button
                onClick={onClearCart}
                className="text-xs text-red-400 hover:text-red-300 hover:underline flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                title="Close Cart"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Order Type Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => onOrderTypeChange('DINE_IN')}
            className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 transition-all ${
              orderType === 'DINE_IN'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Armchair className="w-3.5 h-3.5" />
            <span>Dine In</span>
          </button>
          <button
            onClick={() => onOrderTypeChange('TAKEAWAY')}
            className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 transition-all ${
              orderType === 'TAKEAWAY'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TakeawayIcon className="w-3.5 h-3.5" />
            <span>Takeaway</span>
          </button>
          <button
            onClick={() => onOrderTypeChange('DELIVERY')}
            className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 transition-all ${
              orderType === 'DELIVERY'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Delivery</span>
          </button>
        </div>

        {/* Dine In Table No Input */}
        {orderType === 'DINE_IN' && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">Table No:</span>
            <input
              type="text"
              value={tableNo}
              onChange={(e) => onTableNoChange(e.target.value)}
              placeholder="e.g. T-05"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>
        )}

        {/* Delivery Order Rider Selector */}
        {orderType === 'DELIVERY' && (
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-2.5 space-y-1">
            <label className="block text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1">
              <Truck className="w-3 h-3 text-amber-400" />
              <span>Assign Delivery Rider *</span>
            </label>
            <select
              value={selectedRider?.id || ''}
              onChange={(e) => {
                const found = riders.find((r) => r.id === e.target.value);
                if (onSelectRider) onSelectRider(found || null);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-semibold focus:outline-none focus:border-amber-500"
            >
              <option value="">-- Select Delivery Rider --</option>
              {riders.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.phone})
                </option>
              ))}
            </select>
            {selectedRider && (
              <p className="text-[11px] text-emerald-400 font-mono pt-0.5">
                Assigned: <strong>{selectedRider.name}</strong> - {selectedRider.phone}
              </p>
            )}
          </div>
        )}

        {/* Customer Selector Card */}
        <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-2.5">
          {selectedCustomer ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 overflow-hidden">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-100 truncate">{selectedCustomer.name}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{selectedCustomer.phone}</p>
                </div>
              </div>
              <button
                onClick={onRemoveCustomer}
                className="p-1 text-slate-400 hover:text-red-400 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenCustomerModal}
              className="w-full py-1.5 flex items-center justify-center space-x-2 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Customer</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2">
            <ShoppingBag className="w-12 h-12 stroke-1" />
            <p className="text-sm font-medium">Your order cart is empty</p>
            <p className="text-xs text-slate-500">Click products or customize pizza to add</p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.cartId}
              className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 space-y-2 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-100 leading-tight">
                    {item.productName}
                  </h4>
                  {item.isPizza && (
                    <div className="text-[11px] text-amber-400/90 mt-0.5 space-y-0.5">
                      <div>Crust: {item.crustName}</div>
                      {item.toppings && item.toppings.length > 0 && (
                        <div>
                          Toppings: {item.toppings.map((t) => t.name).join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                  {item.specialInstructions && (
                    <p className="text-[11px] text-slate-400 italic mt-0.5">
                      "{item.specialInstructions}"
                    </p>
                  )}
                </div>

                <button
                  onClick={() => onRemoveItem(item.cartId)}
                  className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                  <button
                    onClick={() => onUpdateQuantity(item.cartId, -1)}
                    className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center text-xs font-bold"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-slate-100">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(item.cartId, 1)}
                    className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center text-xs font-bold"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 font-mono block">
                    {item.quantity} × {item.unitPrice}
                  </span>
                  <span className="text-sm font-bold text-amber-400 font-mono">
                    {formatCurrency(item.totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 3. Calculations & Checkout Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/90 space-y-3">
        {/* Breakdown */}
        <div className="space-y-1.5 text-xs text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-400">Subtotal</span>
            <span className="font-mono font-semibold">{formatCurrency(subtotal)}</span>
          </div>

          {/* Discount controls */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowDiscountInput(!showDiscountInput)}
              className="text-amber-400 hover:underline flex items-center space-x-1"
            >
              <Percent className="w-3 h-3" />
              <span>Discount {discount > 0 ? `(${discount}${discountType === 'PERCENTAGE' ? '%' : ' Rs.'})` : ''}</span>
            </button>
            <span className="font-mono font-semibold text-emerald-400">
              -{formatCurrency(discountAmount)}
            </span>
          </div>

          {showDiscountInput && (
            <div className="flex items-center space-x-2 pt-1 pb-1">
              <input
                type="number"
                value={discount || ''}
                onChange={(e) => onDiscountChange(parseFloat(e.target.value) || 0)}
                placeholder="Discount value"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={() => onDiscountTypeChange(discountType === 'FIXED' ? 'PERCENTAGE' : 'FIXED')}
                className="px-2.5 py-1 bg-slate-800 text-amber-400 font-bold rounded-lg border border-slate-700 text-xs shrink-0"
              >
                {discountType === 'FIXED' ? 'Rs.' : '%'}
              </button>
            </div>
          )}

          {/* Tax controls */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowTaxInput(!showTaxInput)}
              className="text-amber-400 hover:underline flex items-center space-x-1"
            >
              <span>GST Tax ({taxRate}%)</span>
            </button>
            <span className="font-mono font-semibold">{formatCurrency(taxAmount)}</span>
          </div>

          {showTaxInput && (
            <div className="flex items-center space-x-1.5 pt-1 pb-1 flex-wrap gap-y-1">
              <button
                type="button"
                onClick={() => onTaxRateChange && onTaxRateChange(0)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  taxRate === 0 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                0% (OFF)
              </button>
              <button
                type="button"
                onClick={() => onTaxRateChange && onTaxRateChange(5)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  taxRate === 5 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                5%
              </button>
              <button
                type="button"
                onClick={() => onTaxRateChange && onTaxRateChange(13)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  taxRate === 13 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                13%
              </button>
              <button
                type="button"
                onClick={() => onTaxRateChange && onTaxRateChange(16)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  taxRate === 16 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                16%
              </button>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => onTaxRateChange && onTaxRateChange(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-14 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-center font-mono text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          {/* Delivery Charges if Delivery order */}
          {orderType === 'DELIVERY' && (
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Delivery Charges</span>
              <input
                type="number"
                value={deliveryFee || ''}
                onChange={(e) => onDeliveryFeeChange(parseFloat(e.target.value) || 0)}
                className="w-20 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-right font-mono text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
            <span className="text-sm font-bold text-slate-100">Grand Total</span>
            <span className="text-xl font-extrabold text-amber-400 font-mono">
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>

          {/* Checkout Button */}
        <button
          disabled={cart.length === 0}
          onClick={onCheckout}
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-extrabold text-base rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all"
        >
          <CreditCard className="w-5 h-5" />
          <span>Checkout (F8) • {formatCurrency(grandTotal)}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-80 xl:w-96 border-l border-slate-800 h-full shrink-0 z-20 shadow-2xl">
        {cartContent}
      </aside>

      {/* Mobile / Tablet Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Backdrop */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in-0"
          />

          {/* Drawer Sheet */}
          <aside className="relative w-full sm:w-96 max-w-full h-full z-10 shadow-2xl animate-in slide-in-from-right duration-200">
            {cartContent}
          </aside>
        </div>
      )}
    </>
  );
}
