'use client';

import { useState } from 'react';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  UserPlus,
  UserCheck,
  Armchair,
  ShoppingBag as TakeawayIcon,
  Truck,
  CreditCard,
  X,
  Flame,
  ChevronRight,
  MapPin,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { CartItem, CustomerItem, OrderType, RestaurantTableItem, RiderItem } from '@/lib/types';
import { useApp } from '@/context/AppContext';

interface CartSidebarProps {
  cart: CartItem[];
  onUpdateQuantity: (cartId: string, delta: number) => void;
  onRemoveItem: (cartId: string) => void;
  onClearCart: () => void;
  selectedCustomer: CustomerItem | null;
  onOpenCustomerModal: () => void;
  onRemoveCustomer: () => void;
  selectedTable: RestaurantTableItem | null;
  onOpenTableModal: () => void;
  onRemoveTable: () => void;
  selectedRider?: RiderItem | null;
  onSelectRider?: (rider: RiderItem | null) => void;
  deliveryFee?: number;
  onDeliveryFeeChange?: (fee: number) => void;
  activeOrderId: string | null;
  orderType: OrderType;
  onOrderTypeChange: (type: OrderType) => void;
  tableNo: string;
  onTableNoChange: (t: string) => void;
  discount: number;
  onDiscountChange: (d: number) => void;
  discountType: 'FIXED' | 'PERCENTAGE';
  onDiscountTypeChange: (t: 'FIXED' | 'PERCENTAGE') => void;
  taxRate: number;
  onTaxRateChange?: (r: number) => void;
  onSendToKitchen?: () => void;
  onCheckout: () => void;
  isSavingOpenOrder?: boolean;
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
  selectedTable,
  onOpenTableModal,
  onRemoveTable,
  selectedRider,
  onSelectRider,
  deliveryFee = 0,
  onDeliveryFeeChange,
  activeOrderId,
  orderType,
  onOrderTypeChange,
  tableNo,
  onTableNoChange,
  discount,
  onDiscountChange,
  discountType,
  onDiscountTypeChange,
  taxRate,
  onTaxRateChange,
  onSendToKitchen,
  onCheckout,
  isSavingOpenOrder = false,
  isMobileOpen = false,
  onCloseMobile,
}: CartSidebarProps) {
  const { riders } = useApp();
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [showTaxInput, setShowTaxInput] = useState(false);
  const [showDeliveryFeeInput, setShowDeliveryFeeInput] = useState(false);

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

  // Delivery Fee Calculation
  const effectiveDeliveryFee = orderType === 'DELIVERY' ? Number(deliveryFee || 0) : 0;

  // Grand Total
  const grandTotal = Math.round(afterDiscount + taxAmount + effectiveDeliveryFee);

  const cartContent = (
    <div className="w-full h-full bg-slate-900 flex flex-col select-none">
      {/* 1. Header & Order Type Selector */}
      <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-900/90">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-base text-slate-100">
              {activeOrderId ? 'Active Table Tab' : 'Current Order'}
            </h2>
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

        {/* Order Type Tabs (3 Tabs: Dine-In, Takeaway, Delivery) */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => onOrderTypeChange('DINE_IN')}
            className={`py-1.5 px-1.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 transition-all ${
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
            className={`py-1.5 px-1.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 transition-all ${
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
            className={`py-1.5 px-1.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1 transition-all ${
              orderType === 'DELIVERY'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Delivery</span>
          </button>
        </div>

        {/* Dine In Table Selector Card */}
        {orderType === 'DINE_IN' && (
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1">
                <Armchair className="w-3.5 h-3.5 text-amber-400" />
                <span>Assigned Table</span>
              </span>
              <button
                onClick={onOpenTableModal}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-0.5 underline"
              >
                <span>{selectedTable ? 'Change Table' : 'Select Table'}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {selectedTable ? (
              <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
                <div>
                  <span className="text-sm font-extrabold text-slate-100 font-mono">
                    {selectedTable.name}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-2">
                    ({selectedTable.capacity} Seats)
                  </span>
                </div>
                <button
                  onClick={onRemoveTable}
                  className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
                  title="Clear Table"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenTableModal}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800/80 border border-dashed border-slate-700 hover:border-amber-500 text-amber-400 font-bold text-xs rounded-lg flex items-center justify-center space-x-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Choose Restaurant Table</span>
              </button>
            )}
          </div>
        )}

        {/* Delivery Rider & Address Card */}
        {orderType === 'DELIVERY' && (
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <span>Delivery Rider</span>
              </span>
            </div>

            {/* Rider select dropdown */}
            <select
              value={selectedRider?.id || ''}
              onChange={(e) => {
                const r = riders.find((r) => r.id === e.target.value) || null;
                onSelectRider && onSelectRider(r);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-medium focus:outline-none focus:border-amber-500"
            >
              <option value="">-- Assign Rider (Optional) --</option>
              {riders.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.phone}) {r.vehicleNo ? `[${r.vehicleNo}]` : ''}
                </option>
              ))}
            </select>

            {/* Delivery address from customer */}
            {selectedCustomer?.address ? (
              <div className="flex items-start space-x-1.5 text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{selectedCustomer.address}</span>
              </div>
            ) : (
              <p className="text-[10px] text-amber-400/90 italic">
                * Please attach customer to record delivery address
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
              className="w-full py-1.5 flex items-center justify-center space-x-2 text-xs font-semibold text-slate-400 hover:text-amber-300 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-400" />
              <span>Attach Customer (Optional)</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-2 py-10">
            <ShoppingBag className="w-12 h-12 stroke-[1.2] text-slate-600" />
            <p className="text-sm font-medium">Cart is empty</p>
            <p className="text-xs text-slate-600 max-w-[200px]">
              Select dishes or customize pizzas from the catalog to build an order
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.cartId}
              className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 shadow-sm hover:border-slate-700 transition-colors"
            >
              {/* Product Title & Remove */}
              <div className="flex items-start justify-between">
                <div className="pr-2">
                  <h4 className="text-xs font-bold text-slate-100 tracking-tight leading-tight">
                    {item.productName}
                  </h4>
                  {item.isPizza && (
                    <div className="text-[11px] text-amber-400 font-medium mt-0.5">
                      {item.sizeName} • {item.flavorName} {item.crustName && `(${item.crustName})`}
                    </div>
                  )}
                  {/* Toppings list */}
                  {item.toppings && item.toppings.length > 0 && (
                    <div className="text-[10px] text-slate-400 mt-1 pl-1 border-l border-amber-500/40 space-y-0.5">
                      {item.toppings.map((t, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>+ {t.name}</span>
                          <span className="font-mono">{formatCurrency(t.price)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Special instructions */}
                  {item.specialInstructions && (
                    <div className="text-[10px] text-amber-400/90 italic mt-1 pl-1">
                      Note: "{item.specialInstructions}"
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onRemoveItem(item.cartId)}
                  className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                  title="Remove Item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Price & Quantity Controls */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => onUpdateQuantity(item.cartId, -1)}
                    className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center font-bold text-xs font-mono text-slate-100">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.cartId, 1)}
                    className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="text-right">
                  <span className="text-xs font-extrabold text-amber-400 font-mono">
                    {formatCurrency(item.totalPrice)}
                  </span>
                  <div className="text-[9px] text-slate-500">
                    {formatCurrency(item.unitPrice)} each
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 3. Footer Summary & Actions */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/95 space-y-3">
        {/* Subtotal & Discounts */}
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal</span>
            <span className="font-mono font-semibold text-slate-200">{formatCurrency(subtotal)}</span>
          </div>

          {/* Discount controls */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowDiscountInput(!showDiscountInput)}
              className="text-amber-400 hover:underline flex items-center space-x-1"
            >
              <span>Discount {discount > 0 && `(${discountType === 'FIXED' ? 'Rs.' : '%'}${discount})`}</span>
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

          {/* Delivery Fee controls (Only for Delivery) */}
          {orderType === 'DELIVERY' && (
            <div className="space-y-1 pt-1 border-t border-slate-800/80">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setShowDeliveryFeeInput(!showDeliveryFeeInput)}
                  className="text-amber-400 hover:underline flex items-center space-x-1"
                >
                  <Truck className="w-3 h-3 text-amber-400" />
                  <span>Delivery Fee</span>
                </button>
                <span className="font-mono font-semibold text-slate-200">
                  {formatCurrency(effectiveDeliveryFee)}
                </span>
              </div>

              {showDeliveryFeeInput && (
                <div className="flex items-center space-x-1.5 pt-1">
                  <input
                    type="number"
                    value={deliveryFee || ''}
                    onChange={(e) => onDeliveryFeeChange && onDeliveryFeeChange(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="Fee (e.g. 100)"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => onDeliveryFeeChange && onDeliveryFeeChange(0)}
                    className="px-2 py-1 bg-slate-800 text-slate-300 font-bold rounded text-xs shrink-0"
                  >
                    Free
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
            <span className="text-sm font-bold text-slate-100">Grand Total</span>
            <span className="text-xl font-extrabold text-amber-400 font-mono">
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-2 pt-1">
          {orderType === 'DINE_IN' && onSendToKitchen && (
            <button
              disabled={cart.length === 0 || isSavingOpenOrder}
              onClick={onSendToKitchen}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-amber-400 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all shadow-sm"
            >
              <Flame className="w-4 h-4 text-amber-400" />
              <span>{activeOrderId ? 'Update Kitchen Order' : 'Send to Kitchen (Hold Tab)'}</span>
            </button>
          )}

          <button
            disabled={cart.length === 0}
            onClick={onCheckout}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all"
          >
            <CreditCard className="w-4 h-4" />
            <span>Pay & Settle (F8) • {formatCurrency(grandTotal)}</span>
          </button>
        </div>
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
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in-0"
          />
          <aside className="relative w-full sm:w-96 max-w-full h-full z-10 shadow-2xl animate-in slide-in-from-right duration-200">
            {cartContent}
          </aside>
        </div>
      )}
    </>
  );
}
