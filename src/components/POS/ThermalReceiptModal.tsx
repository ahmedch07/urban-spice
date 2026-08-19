'use client';

import React, { useState, useEffect } from 'react';
import { X, Printer, Download, CheckCircle2, Pizza as PizzaIcon, Plus } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

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
  const [storeSettings, setStoreSettings] = useState<any>({
    storeName: 'Slice & Spice Pizza POS',
    storeAddress: '123 Main Commercial Area, Gulberg III, Lahore',
    storePhone: '+92 300 1234567',
    whatsappNumber: '+92 300 1234567',
    storeEmail: 'orders@sliceandspice.com',
    currency: 'Rs.',
    taxRate: '5',
    invoiceFooter: 'Thank you for ordering from Slice & Spice Pizza! Have a delicious day!',
    socialMedia: '@sliceandspicepizza',
  });

  useEffect(() => {
    if (isOpen) {
      try {
        const cached = localStorage.getItem('urban_spice_store_settings');
        if (cached) {
          setStoreSettings((prev: any) => ({ ...prev, ...JSON.parse(cached) }));
        }
      } catch (e) {}

      fetch('/api/settings')
        .then((res) => res.json())
        .then((data) => {
          if (data.settings && Object.keys(data.settings).length > 0) {
            setStoreSettings((prev: any) => ({ ...prev, ...data.settings }));
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
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
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 flex justify-center">
          <div
            id="printable-receipt"
            className="w-full max-w-[80mm] bg-white text-black p-4 text-xs font-mono rounded shadow-xl border border-slate-200"
          >
            {/* Store Header */}
            <div className="text-center pb-3 border-b border-dashed border-slate-400 space-y-0.5">
              <div className="flex justify-center mb-1.5">
                <img src={storeSettings.storeLogo || '/logo.png'} alt="Urban Spice Logo" className="w-14 h-14 object-contain rounded-full" />
              </div>
              <h1 className="font-extrabold text-base uppercase tracking-tight">
                {storeSettings.storeName}
              </h1>
              <p className="text-[10px]">{storeSettings.storeAddress}</p>
              <p className="text-[10px]">
                Ph: {storeSettings.storePhone} {storeSettings.whatsappNumber && `| WA: ${storeSettings.whatsappNumber}`}
              </p>
              {storeSettings.storeEmail && <p className="text-[9px]">{storeSettings.storeEmail}</p>}
            </div>

            {/* Invoice Info */}
            <div className="py-2.5 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
              <div className="flex justify-between font-bold">
                <span>INV #: {order.invoiceNo}</span>
                <span>{order.orderType}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-700">
                <span>Date: {formatDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-700">
                <span>Cashier: {order.user?.name || 'Staff'}</span>
                {order.tableNo && <span>Table: {order.tableNo}</span>}
              </div>
              {order.customer && (
                <div className="pt-1 border-t border-slate-200 text-[10px] space-y-0.5">
                  <div>Customer: <strong>{order.customer.name}</strong></div>
                  <div>Phone: {order.customer.phone}</div>
                  {order.customer.address && <div>Addr: {order.customer.address}</div>}
                </div>
              )}
              {order.orderType === 'DELIVERY' && order.riderName && (
                <div className="pt-1 border-t border-slate-200 text-[10px] space-y-0.5">
                  <div>Rider Name: <strong>{order.riderName}</strong></div>
                  <div>Rider Contact: <strong>{order.riderPhone || '-'}</strong></div>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="py-3 border-b border-dashed border-slate-400 space-y-2">
              <div className="flex justify-between font-bold text-[10px] uppercase border-b pb-1 border-slate-300">
                <span>Item / Customization</span>
                <span>Qty x Price</span>
                <span>Total</span>
              </div>

              {order.items?.map((item: any) => (
                <div key={item.id} className="space-y-0.5">
                  <div className="flex justify-between font-bold text-[11px]">
                    <span className="truncate pr-1">{item.productName}</span>
                    <span className="shrink-0">{item.total}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-600">
                    <span>
                      {item.sizeName} {item.flavorName} {item.crustName ? `(${item.crustName})` : ''}
                    </span>
                    <span>{item.quantity} × {item.unitPrice}</span>
                  </div>
                  {item.toppings && item.toppings.length > 0 && (
                    <div className="text-[9px] text-slate-500 italic pl-1">
                      + Toppings: {item.toppings.map((t: any) => t.toppingName).join(', ')}
                    </div>
                  )}
                  {item.specialInstructions && (
                    <div className="text-[9px] text-slate-500 italic pl-1">
                      Note: "{item.specialInstructions}"
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Billing Calculation */}
            <div className="py-2.5 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
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
              <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-slate-300">
                <span>GRAND TOTAL</span>
                <span>{formatCurrency(order.grandTotal, storeSettings.currency)}</span>
              </div>
            </div>

            {/* Payment & Change Info */}
            <div className="py-2 border-b border-dashed border-slate-400 text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-bold">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount Paid:</span>
                <span>{order.amountPaid}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Change Returned:</span>
                <span>{order.change}</span>
              </div>
            </div>

            {/* Receipt Footer */}
            {storeSettings.invoiceFooter && (
              <div className="text-center pt-3 space-y-1 text-[10px] text-slate-700">
                <p className="font-bold uppercase">{storeSettings.invoiceFooter}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between no-print">
          <button
            onClick={onNewOrder || onClose}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>{onNewOrder ? 'New Order (F4)' : 'Close Preview'}</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors border border-slate-700"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Save / PDF</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center space-x-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Bill</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
