'use client';

import { useState, useEffect } from 'react';
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
  initialCategoryName?: string;
  initialFlavorName?: string;
}

export default function CustomizationModal({
  isOpen,
  onClose,
  onAddToCart,
  pizzaConfig,
  initialCategoryName,
  initialFlavorName,
}: CustomizationModalProps) {
  const { flavors, sizes, toppings } = pizzaConfig;

  // Active Category Filter within Pizza Customizer
  const [activeCategory, setActiveCategory] = useState<string>('Urban Special Pizza');

  const [selectedFlavor, setSelectedFlavor] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<any>(null);
  const [selectedToppings, setSelectedToppings] = useState<CartItemTopping[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [specialInstructions, setSpecialInstructions] = useState<string>('');

  // Category definitions for Pizza system
  const pizzaCategories = [
    'Urban Special Pizza',
    'Urban Stuffer Pizza',
    'Urban Pizza',
    'Urban Square Pizza',
  ];

  // Helper to get topping price based on selected size
  const getToppingPriceForSize = (toppingName: string, sizeCode?: string) => {
    if (toppingName.toLowerCase().includes('dip')) {
      return 60;
    }
    switch (sizeCode) {
      case 'S':
        return 70;
      case 'M':
        return 150;
      case 'L':
        return 200;
      case 'XL':
        return 250;
      default:
        return 150;
    }
  };

  // Set default selections when modal opens or category changes
  useEffect(() => {
    if (!isOpen) return;

    let catName = initialCategoryName || 'Urban Special Pizza';
    if (!pizzaCategories.includes(catName)) {
      catName = 'Urban Special Pizza';
    }
    setActiveCategory(catName);

    // Default Size to Medium or Large
    if (sizes?.length > 0) {
      const medium = sizes.find((s: any) => s.code === 'M') || sizes[0];
      setSelectedSize(medium);
    }

  }, [isOpen, initialCategoryName, sizes]);

  // Update selected flavor when category or flavors change
  useEffect(() => {
    if (!isOpen || !flavors || flavors.length === 0) return;

    let filtered = flavors;
    if (activeCategory === 'Urban Special Pizza') {
      filtered = flavors.filter((f) =>
        ['Urban Special', 'Malai Boti', 'Behari Kebab', 'Peri Peri'].some((n) => f.name.includes(n))
      );
    } else if (activeCategory === 'Urban Pizza') {
      filtered = flavors.filter((f) =>
        ['Chicken Tikka', 'Chicken Fajita', 'Chicken Supreme', 'Cheese Lover', 'Veggie Lover'].some((n) => f.name.includes(n))
      );
    } else if (activeCategory === 'Urban Square Pizza') {
      filtered = flavors.filter((f) => f.name.toLowerCase().includes('square'));
    } else if (activeCategory === 'Urban Stuffer Pizza') {
      filtered = flavors.filter((f) => f.name.toLowerCase().includes('stuffer'));
    }

    if (filtered.length > 0) {
      if (initialFlavorName) {
        const match = filtered.find((f) => f.name.toLowerCase().includes(initialFlavorName.toLowerCase()));
        setSelectedFlavor(match || filtered[0]);
      } else {
        setSelectedFlavor(filtered[0]);
      }
    } else {
      setSelectedFlavor(flavors[0]);
    }
  }, [isOpen, activeCategory, flavors, initialFlavorName]);

  if (!isOpen || !selectedFlavor || !selectedSize) return null;

  // Filter flavors displayed based on activeCategory
  const availableFlavors = flavors.filter((f) => {
    if (activeCategory === 'Urban Special Pizza') {
      return ['Urban Special', 'Malai Boti', 'Behari Kebab', 'Peri Peri'].some((n) => f.name.includes(n));
    }
    if (activeCategory === 'Urban Pizza') {
      return ['Chicken Tikka', 'Chicken Fajita', 'Chicken Supreme', 'Cheese Lover', 'Veggie Lover'].some((n) => f.name.includes(n));
    }
    if (activeCategory === 'Urban Square Pizza') {
      return f.name.toLowerCase().includes('square');
    }
    if (activeCategory === 'Urban Stuffer Pizza') {
      return f.name.toLowerCase().includes('stuffer');
    }
    return true;
  });

  // Calculate Base Price from flavor-size matrix
  const flavorPriceObj = selectedFlavor.flavorPrices?.find(
    (fp: any) => fp.sizeId === selectedSize.id
  );
  const basePrice = flavorPriceObj ? flavorPriceObj.price : (selectedSize.code === 'S' ? 500 : selectedSize.code === 'M' ? 1000 : 1450);

  // Calculate Toppings Extra Cost with dynamic size pricing
  const toppingsPrice = selectedToppings.reduce(
    (sum, t) => sum + getToppingPriceForSize(t.name, selectedSize?.code),
    0
  );

  // Calculate Unit Total
  const unitPrice = basePrice + toppingsPrice;
  const totalPrice = unitPrice * quantity;

  const toggleTopping = (topping: any) => {
    const exists = selectedToppings.some((t) => t.toppingId === topping.id);
    const dynamicPrice = getToppingPriceForSize(topping.name, selectedSize?.code);
    if (exists) {
      setSelectedToppings(selectedToppings.filter((t) => t.toppingId !== topping.id));
    } else {
      setSelectedToppings([
        ...selectedToppings,
        {
          toppingId: topping.id,
          name: topping.name,
          price: dynamicPrice,
        },
      ]);
    }
  };

  const handleAdd = () => {
    const finalToppings = selectedToppings.map((t) => ({
      ...t,
      price: getToppingPriceForSize(t.name, selectedSize?.code),
    }));

    const cartItem: CartItem = {
      cartId: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      productId: selectedFlavor.id || 'custom-pizza',
      productName: `${activeCategory} - ${selectedFlavor.name}`,
      isPizza: true,
      flavorId: selectedFlavor.id,
      flavorName: selectedFlavor.name,
      sizeId: selectedSize.id,
      sizeName: selectedSize.name,
      toppings: finalToppings,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl w-full max-w-3xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 shrink-0">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 pr-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
              <PizzaIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-100 truncate">
                Pizza Configuration Panel
              </h2>
              <p className="text-[10px] sm:text-xs text-amber-400 font-semibold truncate">
                Category ➔ Flavor ➔ Size ➔ Extras
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4 sm:space-y-5">
          {/* STEP 1: PIZZA CATEGORY SELECTOR */}
          <div>
            <label className="block text-xs font-black text-amber-400 uppercase tracking-wider mb-2">
              1. Select Pizza Category / Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
              {pizzaCategories.map((catName) => {
                const isSelected = activeCategory === catName;
                return (
                  <button
                    key={catName}
                    onClick={() => setActiveCategory(catName)}
                    className={`py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl border text-xs font-extrabold transition-all text-center truncate ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 scale-[1.02]'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {catName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: FLAVOR SELECTION */}
          <div>
            <label className="block text-xs font-black text-amber-400 uppercase tracking-wider mb-2">
              2. Select {activeCategory} Flavor
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              {availableFlavors.map((flavor) => {
                const isSelected = selectedFlavor.id === flavor.id;
                const priceObj = flavor.flavorPrices?.find(
                  (fp: any) => fp.sizeId === selectedSize.id
                );
                const price = priceObj ? priceObj.price : 0;
                return (
                  <button
                    key={flavor.id}
                    onClick={() => setSelectedFlavor(flavor)}
                    className={`p-2.5 sm:p-3 rounded-xl border text-left flex items-start space-x-2.5 sm:space-x-3 transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10 ring-1 ring-amber-500'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-slate-700/50 flex items-center justify-center">
                      {flavor.image ? (
                        <img src={flavor.image} alt={flavor.name} className="w-full h-full object-cover" />
                      ) : (
                        <PizzaIcon className="w-5 h-5 text-amber-500/60" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-extrabold text-xs text-slate-100 truncate">{flavor.name}</span>
                        {price > 0 && (
                          <span className="text-xs font-mono font-bold text-amber-400 shrink-0">{formatCurrency(price)}</span>
                        )}
                      </div>
                      {flavor.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 font-sans leading-tight">
                          {flavor.description}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 3: SIZE SELECTION */}
          <div>
            <label className="block text-xs font-black text-amber-400 uppercase tracking-wider mb-2">
              3. Select Size
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
              {sizes.map((size) => {
                const isSelected = selectedSize.id === size.id;
                const priceObj = selectedFlavor?.flavorPrices?.find(
                  (fp: any) => fp.sizeId === size.id
                );
                const price = priceObj ? priceObj.price : 0;
                
                // Hide small size for Behari Kebab & Peri Peri if price is 0
                if (price === 0 && (selectedFlavor?.name.includes('Behari') || selectedFlavor?.name.includes('Peri'))) {
                  return null;
                }

                return (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size)}
                    className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10 ring-1 ring-amber-500'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-extrabold text-xs text-slate-100">{size.name}</div>
                    <div className="text-xs font-mono font-bold text-amber-400 mt-0.5">
                      {price > 0 ? formatCurrency(price) : 'N/A'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 4: EXTRA TOPPINGS */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1">
              <label className="block text-xs font-black text-amber-400 uppercase tracking-wider">
                4. Extra Toppings ({selectedSize.name})
              </label>
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono">
                Rate: +{formatCurrency(getToppingPriceForSize('Extra Topping', selectedSize?.code))}
              </span>
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2">
              {toppings.map((topping) => {
                const isSelected = selectedToppings.some((t) => t.toppingId === topping.id);
                const toppingPrice = getToppingPriceForSize(topping.name, selectedSize?.code);
                return (
                  <button
                    key={topping.id}
                    onClick={() => toggleTopping(topping)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate min-w-0 pr-1">
                      <div className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                        isSelected ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-700'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-xs font-semibold truncate">{topping.name}</span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-amber-400 shrink-0">
                      +{formatCurrency(toppingPrice)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Special Instructions / Notes
            </label>
            <input
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder='e.g. "Less spicy", "Extra cheese", "No onions"'
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-sans"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center justify-between sm:justify-start space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-400">Qty:</span>
              <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-xl p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 font-bold transition-colors text-xs"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center font-bold text-xs font-mono text-slate-100">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 font-bold transition-colors text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="text-right sm:hidden">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Price</div>
              <div className="text-sm font-extrabold text-amber-400 font-mono">{formatCurrency(totalPrice)}</div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Configured Price</div>
              <div className="text-base font-extrabold text-amber-400 font-mono">{formatCurrency(totalPrice)}</div>
            </div>

            <button
              onClick={handleAdd}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
