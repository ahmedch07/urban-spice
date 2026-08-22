'use client';

import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { CartItem, ProductItem } from '@/lib/types';
import { displayProductName, formatCurrency } from '@/lib/utils';

interface PastaCustomizationModalProps {
  isOpen: boolean;
  product: ProductItem | null;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
  title?: string;
  extraToppingPrice?: number;
  extraToppingName?: string;
}

export default function PastaCustomizationModal({
  isOpen,
  product,
  onClose,
  onAddToCart,
  title = 'Customize Pasta',
  extraToppingPrice,
  extraToppingName = 'Extra Topping',
}: PastaCustomizationModalProps) {
  const [hasExtraTopping, setHasExtraTopping] = useState(false);

  useEffect(() => {
    if (isOpen) setHasExtraTopping(false);
  }, [isOpen, product?.id]);

  if (!isOpen || !product) return null;

  const isHalf = product.name.toLowerCase().includes('(half)');
  const toppingPrice = extraToppingPrice ?? (isHalf ? 70 : 150);
  const unitPrice = product.basePrice + (hasExtraTopping ? toppingPrice : 0);

  const handleAdd = () => {
    const toppings = hasExtraTopping
      ? [{ toppingId: 'extra-topping', name: extraToppingName, price: toppingPrice }]
      : [];

    onAddToCart({
      cartId: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      productId: product.id,
      productName: displayProductName(product.name),
      isPizza: false,
      toppings,
      unitPrice,
      quantity: 1,
      itemDiscount: 0,
      totalPrice: unitPrice,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-extrabold text-slate-100">{title}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{displayProductName(product.name)}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <button
            onClick={() => setHasExtraTopping((value) => !value)}
            className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
              hasExtraTopping
                ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-2 text-sm font-bold">
              <span className={`w-5 h-5 rounded border flex items-center justify-center ${hasExtraTopping ? 'bg-amber-500 border-amber-500 text-slate-950' : 'border-slate-600'}`}>
                {hasExtraTopping && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </span>
              {extraToppingName}
            </span>
            <span className="font-mono text-sm font-black">+{formatCurrency(toppingPrice)}</span>
          </button>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold">Total</p>
            <p className="text-lg font-mono font-black text-amber-400">{formatCurrency(unitPrice)}</p>
          </div>
          <button onClick={handleAdd} className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-sm hover:bg-amber-400">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
