'use client';

import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { CartItem, ProductItem } from '@/lib/types';
import { displayProductName, formatCurrency } from '@/lib/utils';

interface DrinkCustomizationModalProps {
  isOpen: boolean;
  products: ProductItem[];
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

const drinkTypes = ['Coke', 'Sprite', 'Mint', 'Diet', 'Fanta', 'Water'];

export default function DrinkCustomizationModal({
  isOpen,
  products,
  onClose,
  onAddToCart,
}: DrinkCustomizationModalProps) {
  const [selectedDrink, setSelectedDrink] = useState<string | null>(null);
  const [cartSequence, setCartSequence] = useState(0);

  useEffect(() => {
    if (isOpen) setSelectedDrink(null);
  }, [isOpen]);

  const beverageSizes = useMemo(
    () => products.filter((product) => product.category?.slug === 'beverages'),
    [products]
  );

  const availableSizes = selectedDrink === 'Water'
    ? beverageSizes.filter((product) => product.name.toLowerCase().includes('water'))
    : beverageSizes.filter((product) => !product.name.toLowerCase().includes('water'));

  if (!isOpen) return null;

  const handleAdd = (size: ProductItem) => {
    const drinkName = `${selectedDrink} - ${displayProductName(size.name)}`;
    onAddToCart({
      cartId: `drink-${selectedDrink?.toLowerCase()}-${size.id}-${cartSequence}`,
      productId: `drink-${selectedDrink?.toLowerCase()}-${size.id}`,
      productName: drinkName,
      isPizza: false,
      toppings: [],
      unitPrice: size.basePrice,
      quantity: 1,
      itemDiscount: 0,
      totalPrice: size.basePrice,
    });
    setCartSequence((value) => value + 1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-extrabold text-slate-100">Select Drink</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {selectedDrink ? `Select ${selectedDrink} size` : 'First select a drink type'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {drinkTypes.map((drink) => (
              <button
                key={drink}
                onClick={() => setSelectedDrink(drink)}
                className={`rounded-xl border px-3 py-3 text-sm font-extrabold transition-colors ${
                  selectedDrink === drink
                    ? 'border-amber-500 bg-amber-500 text-slate-950'
                    : 'border-slate-700 bg-slate-950 text-slate-200 hover:border-amber-500/70'
                }`}
              >
                {drink}
              </button>
            ))}
          </div>

          {selectedDrink && (
            <div className="border-t border-slate-800 pt-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Available sizes</p>
              {availableSizes.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => handleAdd(size)}
                      className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-left text-slate-100 hover:border-amber-500 hover:bg-slate-800"
                    >
                      <span className="text-sm font-bold">{displayProductName(size.name)}</span>
                      <span className="font-mono text-sm font-black text-amber-400">{formatCurrency(size.basePrice)}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No sizes are configured for this drink.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
