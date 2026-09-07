'use client';

import type { CSSProperties } from 'react';
import { X, Printer, CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

interface ThermalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onNewOrder?: () => void;
}

export default function ThermalReceiptModal({
  isOpen,
  onClose,
  order,
  onNewOrder,
}: ThermalReceiptModalProps) {
  const { storeSettings } = useApp();
  const receiptWidth = storeSettings.receiptSize === '58mm' ? '58mm' : '80mm';
  const receiptStyle = { '--receipt-width': receiptWidth } as CSSProperties;

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="thermal-receipt-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn" style={receiptStyle}>
      <div className="receipt-modal-dialog bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 no-print">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-slate-100">Order Completed & Billed</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thermal Receipt Container */}
        <div className="receipt-preview-shell flex-1 overflow-y-auto p-6 bg-slate-950 flex justify-center">
          <div
            id="printable-receipt"
            style={receiptStyle}
            className="w-full bg-white text-black p-4 text-[13px] font-mono font-semibold rounded shadow-xl border border-slate-200"
          >
            {/* Store Header */}
            <div className="text-center pb-3 border-b border-dashed border-slate-400 space-y-0.5">
              <div className="flex justify-center mb-1.5">
                <img
                  src={storeSettings.storeLogo || '/logo.png'}
                  alt="Urban Spice Logo"
                  className="w-14 h-14 object-contain rounded-full"
                />
              </div>
              <h1 className="font-extrabold text-base uppercase tracking-tight">
                {storeSettings.storeName}
              </h1>
              <p className="text-[11px]">{storeSettings.storeAddress}</p>
              <p className="text-[11px]">
                Ph: {storeSettings.storePhone} {storeSettings.whatsappNumber && `| WA: ${storeSettings.whatsappNumber}`}
              </p>
              {storeSettings.storeEmail && <p className="text-[10px]">{storeSettings.storeEmail}</p>}
            </div>

            {/* Invoice Info */}
            <div className="py-2.5 border-b border-dashed border-slate-400 space-y-1 text-[12px]">
              <div className="flex justify-between font-bold">
                <span>INV #: {order.invoiceNo}</span>
                <span>
                  {order.orderType === 'DINE_IN'
                    ? 'DINE IN'
                    : order.orderType === 'DELIVERY'
                    ? 'DELIVERY'
                    : 'TAKEAWAY'}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-700">
                <span>Date: {formatDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-700">
                <span>Cashier: {order.user?.name || 'Staff'}</span>
                {order.tableNo && <span>Table: <strong>{order.tableNo}</strong></span>}
                {order.riderName && <span>Rider: <strong>{order.riderName}</strong></span>}
              </div>
              {order.customer && (
                <div className="pt-1 border-t border-slate-200 text-[11px] space-y-0.5">
                  <div>Customer: <strong>{order.customer.name}</strong></div>
                  <div>Phone: {order.customer.phone}</div>
                  {order.customer.address && <div>Address: {order.customer.address}</div>}
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="py-3 border-b border-dashed border-slate-400 space-y-2">
              <div className="grid grid-cols-[minmax(0,1fr)_46px_50px] gap-1 font-bold text-[11px] uppercase border-b pb-1 border-slate-300">
                <span>Item / Customization</span>
                <span className="text-right">Qty x Price</span>
                <span className="text-right">Total</span>
              </div>

              {order.items?.map((item: any) => (
                <div key={item.id} className="space-y-0.5">
                  <div className="grid grid-cols-[minmax(0,1fr)_46px_50px] gap-1 font-bold text-[12px]">
                    <span className="break-words">{item.productName}</span>
                    <span className="text-right whitespace-nowrap">{item.quantity} × {item.unitPrice}</span>
                    <span className="text-right whitespace-nowrap">{item.total}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 break-words">
                    <span>
                      {item.sizeName} {item.flavorName} {item.crustName ? `(${item.crustName})` : ''}
                    </span>
                  </div>
                  {item.toppings && item.toppings.length > 0 && (
                    <div className="text-[10px] text-slate-500 italic pl-1">
                      + Toppings: {item.toppings.map((t: any) => t.toppingName).join(', ')}
                    </div>
                  )}
                  {item.specialInstructions && (
                    <div className="text-[10px] text-slate-500 italic pl-1">
                      Note: "{item.specialInstructions}"
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Billing Calculation */}
            <div className="py-2.5 border-b border-dashed border-slate-400 space-y-1 text-[12px]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{order.subtotal}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>Discount</span>
                  <span>-{order.discount}</span>
                </div>
              )}
              {order.tax > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>Tax ({storeSettings.taxRate}%)</span>
                  <span>+{order.tax}</span>
                </div>
              )}
              {order.deliveryFee > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>Delivery Fee</span>
                  <span>+{order.deliveryFee}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-[15px] border-t border-slate-300 pt-1.5 mt-1">
                <span>Grand Total</span>
                <span>{storeSettings.currency} {order.grandTotal}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-600 pt-1">
                <span>Payment Method</span>
                <span className="uppercase font-bold">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-600">
                <span>Cash Tendered</span>
                <span>{order.amountPaid}</span>
              </div>
              <div className="flex justify-between text-[11px] font-bold">
                <span>Change Given</span>
                <span>{order.change}</span>
              </div>
            </div>

            {/* Receipt Footer */}
            <div className="text-center pt-3 text-[11px] space-y-1 text-slate-600">
              <p className="font-semibold">{storeSettings.invoiceFooter}</p>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between gap-3 no-print">
          <button
            onClick={() => {
              if (onNewOrder) onNewOrder();
              onClose();
            }}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors"
          >
            New Order (F4)
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
