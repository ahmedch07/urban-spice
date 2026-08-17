'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Check, Pizza as PizzaIcon, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { CartItem, CartItemTopping } from '@/lib/types';

interface CustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
  pizzaConfig: {
    flavors: any[];
    sizes: any[];
    crusts: any[];
    toppings: any[];
  };
}

export default function CustomizationModal({
  isOpen,
  onClose,
  onAddToCart,
  pizzaConfig,
}: CustomizationModalProps) {
  const { flavors, sizes, crusts, toppings } = pizzaConfig;

  const [selectedFlavor, setSelectedFlavor] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<any>(null);
  const [selectedCrust, setSelectedCrust] = useState<any>(null);
  const [selectedToppings, setSelectedToppings] = useState<CartItemTopping[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [specialInstructions, setSpecialInstructions] = useState<string>('');

  // Set default initial selection when config loads
  useEffect(() => {
    if (flavors?.length > 0 && !selectedFlavor) {
      setSelectedFlavor(flavors[0]);
    }
    if (sizes?.length > 0 && !selectedSize) {
      const large = sizes.find((s) => s.code === 'L') || sizes[0];
      setSelectedSize(large);
    }
    if (crusts?.length > 0 && !selectedCrust) {
      setSelectedCrust(crusts[0]);
    }
  }, [flavors, sizes, crusts]);

  if (!isOpen || !selectedFlavor || !selectedSize || !selectedCrust) return null;

  // Calculate Base Price from flavor-size matrix
  const flavorPriceObj = selectedFlavor.flavorPrices?.find(
    (fp: any) => fp.sizeId === selectedSize.id
  );
  const basePrice = flavorPriceObj ? flavorPriceObj.price : 1000;

  // Calculate Crust Extra Price
  const crustPrice = selectedCrust.additionalPrice || 0;

  // Calculate Toppings Extra Cost
  const toppingsPrice = selectedToppings.reduce((sum, t) => sum + t.price, 0);

  // Calculate Unit Total
  const unitPrice = basePrice + crustPrice + toppingsPrice;
  const totalPrice = unitPrice * quantity;

  const toggleTopping = (topping: any) => {
    const exists = selectedToppings.some((t) => t.toppingId === topping.id);
    if (exists) {
      setSelectedToppings(selectedToppings.filter((t) => t.toppingId !== topping.id));
    } else {
      setSelectedToppings([
        ...selectedToppings,
        {
          toppingId: topping.id,
          name: topping.name,
          price: topping.additionalPrice,
        },
      ]);
    }
  };

  const handleAdd = () => {
    const cartItem: CartItem = {
      cartId: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      productId: selectedFlavor.id || 'custom-pizza',
      productName: `${selectedSize.name} ${selectedFlavor.name}`,
      isPizza: true,
      flavorId: selectedFlavor.id,
      flavorName: selectedFlavor.name,
      sizeId: selectedSize.id,
      sizeName: selectedSize.name,
      crustId: selectedCrust.id,
      crustName: selectedCrust.name,
      crustPrice,
      toppings: selectedToppings,
      specialInstructions,
      unitPrice,
      quantity,
      itemDiscount: 0,
      totalPrice,
    };

    onAddToCart(cartItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <PizzaIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Customize Pizza</h2>
              <p className="text-xs text-slate-400">Configure size, crust, flavor, and add-ons</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. Size Selection */}
          <div>
            <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2.5">
              1. Select Pizza Size
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {sizes.map((size) => {
                const isSelected = selectedSize.id === size.id;
                const priceObj = selectedFlavor?.flavorPrices?.find(
                  (fp: any) => fp.sizeId === size.id
                );
                const price = priceObj ? priceObj.price : 0;
                return (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-sm">{size.name}</div>
                    <div className="text-xs text-slate-400 mt-1">{formatCurrency(price)}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Flavor Selection */}
          <div>
            <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2.5">
              2. Select Pizza Flavor
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {flavors.map((flavor) => {
                const isSelected = selectedFlavor.id === flavor.id;
                const priceObj = flavor.flavorPrices?.find(
                  (fp: any) => fp.sizeId === selectedSize.id
                );
                const price = priceObj ? priceObj.price : 0;
                return (
                  <button
                    key={flavor.id}
                    onClick={() => setSelectedFlavor(flavor)}
                    className={`p-3.5 rounded-xl border text-left flex items-start space-x-3 transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg bg-slate-950 overflow-hidden shrink-0 border border-slate-700/50">
                      {flavor.image ? (
                        <img src={flavor.image} alt={flavor.name} className="w-full h-full object-cover" />
                      ) : (
                        <PizzaIcon className="w-full h-full p-2.5 text-amber-500/50" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-100 truncate">{flavor.name}</span>
                        <span className="text-xs font-semibold text-amber-400">{formatCurrency(price)}</span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{flavor.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Crust Selection */}
          <div>
            <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2.5">
              3. Select Crust Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {crusts.map((crust) => {
                const isSelected = selectedCrust.id === crust.id;
                return (
                  <button
                    key={crust.id}
                    onClick={() => setSelectedCrust(crust)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-sm">{crust.name}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      {crust.additionalPrice > 0 ? `+${formatCurrency(crust.additionalPrice)}` : 'Included'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Extra Toppings Multi-Select */}
          <div>
            <label className="block text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2.5">
              4. Extra Toppings (Optional)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {toppings.map((topping) => {
                const isSelected = selectedToppings.some((t) => t.toppingId === topping.id);
                return (
                  <button
                    key={topping.id}
                    onClick={() => toggleTopping(topping)}
                    className={`p-2.5 px-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                        isSelected ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-600'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-xs font-medium">{topping.name}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">+${topping.additionalPrice}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Special Instructions */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Special Instructions
            </label>
            <textarea
              rows={2}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder='e.g. "Less spicy", "Extra crispy crust", "No onions"'
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-400">Qty:</span>
            <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700 rounded-xl p-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-200 font-bold transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-bold text-sm text-slate-100">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-200 font-bold transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-[11px] text-slate-400">Total Price</div>
              <div className="text-lg font-extrabold text-amber-400">{formatCurrency(totalPrice)}</div>
            </div>

            <button
              onClick={handleAdd}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 flex items-center space-x-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Add to Order</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
