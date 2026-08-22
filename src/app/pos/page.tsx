'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import ProductGrid from '@/components/POS/ProductGrid';
import CartSidebar from '@/components/POS/CartSidebar';
import CustomizationModal from '@/components/POS/CustomizationModal';
import PastaCustomizationModal from '@/components/POS/PastaCustomizationModal';
import DrinkCustomizationModal from '@/components/POS/DrinkCustomizationModal';
import CustomerModal from '@/components/POS/CustomerModal';
import PaymentModal from '@/components/POS/PaymentModal';
import ThermalReceiptModal from '@/components/POS/ThermalReceiptModal';
import { CartItem, CustomerItem, OrderType, ProductItem, RiderItem } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import { displayProductName, formatCurrency } from '@/lib/utils';

export default function POSPage() {
  const {
    currentUser,
    categories,
    products: globalProducts,
    pizzaConfig,
    riders,
    storeSettings,
  } = useApp();

  // Filters & Cart
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);

  // Filter products instantaneously in memory
  const products = useMemo(() => {
    const productNameFilters: Record<string, string> = {
      'fries-loaded': 'Loaded Fries',
      'fries-mayo-garlic': 'Mayo Garlic Fries',
    };

    const filteredProducts = globalProducts.filter((p) => {
      const productNameFilter = productNameFilters[selectedCategory];
      const matchCat = productNameFilter
        ? p.name === productNameFilter
        : selectedCategory === 'all' ||
          p.categoryId === selectedCategory ||
          p.category?.id === selectedCategory ||
          p.category?.name.toLowerCase() === selectedCategory.toLowerCase();

      const matchSearch =
        !searchQuery.trim() ||
        displayProductName(p.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.SKU.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCat && matchSearch && p.name.toLowerCase() !== 'simple fries';
    });

    const pastaOrder = [
      'Special Pasta (Half)',
      'Special Pasta (Full)',
      'Creamy Pasta (Half)',
      'Creamy Pasta (Full)',
      'Crunchy Pasta (Full)',
    ];
    const sandwichOrder = [
      'Special Sandwich (with Fries)',
      'Creamy Sandwich (with Fries)',
      'Crunchy Sandwich (with Fries)',
      'Grilled Sandwich (with Fries)',
    ];
    const burgerOrder = [
      'Petty Burger (with Fries)',
      'Special (Zinger) Burger (with Fries)',
      'Grilled Burger (with Fries)',
      'Double Decker Burger (with Fries)',
    ];

    return filteredProducts.sort((a, b) => {
      const aName = displayProductName(a.name);
      const bName = displayProductName(b.name);
      if (a.category?.slug === 'pasta' && b.category?.slug === 'pasta') {
        return pastaOrder.indexOf(aName) - pastaOrder.indexOf(bName);
      }
      if (a.category?.slug === 'sandwiches' && b.category?.slug === 'sandwiches') {
        return sandwichOrder.indexOf(aName) - sandwichOrder.indexOf(bName);
      }
      if (a.category?.slug === 'burgers' && b.category?.slug === 'burgers') {
        return burgerOrder.indexOf(aName) - burgerOrder.indexOf(bName);
      }
      return 0;
    });
  }, [globalProducts, selectedCategory, searchQuery]);

  // Customer & Order Config
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);
  const [selectedRider, setSelectedRider] = useState<RiderItem | null>(null);
  const [orderType, setOrderType] = useState<OrderType>('DINE_IN');
  const [tableNo, setTableNo] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'FIXED' | 'PERCENTAGE'>('FIXED');
  const [deliveryFee, setDeliveryFee] = useState<number>(() => Number(storeSettings.defaultDeliveryFee) || 100);
  const [taxRate, setTaxRate] = useState<number>(() => (storeSettings.taxEnabled === 'true' ? Number(storeSettings.taxRate) || 0 : 0));

  // Modals visibility
  const [isPizzaModalOpen, setIsPizzaModalOpen] = useState<boolean>(false);
  const [modalCategoryName, setModalCategoryName] = useState<string>('Urban Special Pizza');
  const [modalFlavorName, setModalFlavorName] = useState<string | undefined>(undefined);
  const [selectedPastaProduct, setSelectedPastaProduct] = useState<ProductItem | null>(null);
  const [selectedSandwichProduct, setSelectedSandwichProduct] = useState<ProductItem | null>(null);
  const [selectedBurgerProduct, setSelectedBurgerProduct] = useState<ProductItem | null>(null);
  const [selectedLoadedFriesProduct, setSelectedLoadedFriesProduct] = useState<ProductItem | null>(null);
  const [isDrinkModalOpen, setIsDrinkModalOpen] = useState(false);

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState<boolean>(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  // Keyboard Shortcuts Listener (F2 Search, F4 New Order, F8 Checkout, ESC Close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        const searchInput = document.getElementById('pos-search-input');
        if (searchInput) searchInput.focus();
      } else if (e.key === 'F4') {
        e.preventDefault();
        handleResetOrder();
      } else if (e.key === 'F8') {
        e.preventDefault();
        if (cart.length > 0) setIsPaymentModalOpen(true);
      } else if (e.key === 'Escape') {
        setIsPizzaModalOpen(false);
        setSelectedPastaProduct(null);
        setSelectedSandwichProduct(null);
        setSelectedBurgerProduct(null);
        setSelectedLoadedFriesProduct(null);
        setIsDrinkModalOpen(false);
        setIsCustomerModalOpen(false);
        setIsPaymentModalOpen(false);
        setIsReceiptModalOpen(false);
      }
    };

    const handleNewOrder = () => handleResetOrder();
    const handleCheckout = () => {
      if (cart.length > 0) setIsPaymentModalOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('pos-shortcut-new-order', handleNewOrder);
    window.addEventListener('pos-shortcut-checkout', handleCheckout);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('pos-shortcut-new-order', handleNewOrder);
      window.removeEventListener('pos-shortcut-checkout', handleCheckout);
    };
  }, [cart]);

  // Open Pizza Modal with category preselected
  const handleOpenPizzaModalWithCategory = (categoryName: string, flavorName?: string) => {
    setModalCategoryName(categoryName);
    setModalFlavorName(flavorName);
    setIsPizzaModalOpen(true);
  };

  // Cart operations
  const handleAddToCart = (item: CartItem) => {
    setCart((prev) => [...prev, item]);
  };

  const handleAddStandardProductToCart = (product: ProductItem) => {
    const existingIndex = cart.findIndex((i) => i.productId === product.id && !i.isPizza);
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].totalPrice = updated[existingIndex].quantity * updated[existingIndex].unitPrice;
      setCart(updated);
    } else {
      const newItem: CartItem = {
        cartId: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        productId: product.id,
        productName: product.name,
        isPizza: false,
        toppings: [],
        unitPrice: product.basePrice,
        quantity: 1,
        itemDiscount: 0,
        totalPrice: product.basePrice,
      };
      setCart((prev) => [...prev, newItem]);
    }
  };

  const handleAddPastaToCart = (item: CartItem) => {
    setCart((prev) => [...prev, item]);
  };

  const handleAddDipSauceToCart = () => {
    handleAddStandardProductToCart({
      id: 'dip-sauce',
      name: 'Dip Sauce',
      SKU: 'DIP-001',
      categoryId: 'dip-sauce',
      basePrice: 50,
      costPrice: 0,
      stock: 0,
      minStock: 0,
      isPizza: false,
      active: true,
    });
  };

  const handleUpdateQuantity = (cartId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartId === cartId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              totalPrice: newQty * item.unitPrice,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (cartId: string) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const handleResetOrder = () => {
    setCart([]);
    setSelectedCustomer(null);
    setSelectedRider(null);
    setDiscount(0);
    setTableNo('');
    setIsPaymentModalOpen(false);
    setIsReceiptModalOpen(false);
    setCompletedOrder(null);
  };

  const handleOrderCompleted = (order: any) => {
    setCompletedOrder(order);
    setIsPaymentModalOpen(false);
    setIsReceiptModalOpen(true);
  };

  const [isMobileCartOpen, setIsMobileCartOpen] = useState<boolean>(false);

  // Subtotal for modal & calculations
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const discountAmount =
    discountType === 'PERCENTAGE'
      ? Math.round((subtotal * discount) / 100)
      : Math.min(discount, subtotal);
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round((afterDiscount * taxRate) / 100);
  const activeDeliveryFee = orderType === 'DELIVERY' ? deliveryFee : 0;
  const grandTotal = Math.round(afterDiscount + taxAmount + activeDeliveryFee);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar userRole={currentUser?.role} userName={currentUser?.name} userEmail={currentUser?.email} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Navbar */}
        <Navbar title="Point of Sale (POS) & Billing" />

        {/* POS Workstation split */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Left: Products & Categories */}
          <ProductGrid
            categories={categories}
            products={products}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectProduct={handleAddStandardProductToCart}
            onConfigurePasta={setSelectedPastaProduct}
            onConfigureSandwich={setSelectedSandwichProduct}
            onConfigureBurger={setSelectedBurgerProduct}
            onConfigureLoadedFries={setSelectedLoadedFriesProduct}
            onAddDipSauce={handleAddDipSauceToCart}
            onConfigureDrinks={() => setIsDrinkModalOpen(true)}
            onOpenPizzaModalWithCategory={handleOpenPizzaModalWithCategory}
          />

          {/* Right: Cart & Calculation Sidebar (Desktop & Mobile Drawer) */}
          <CartSidebar
            cart={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={() => setCart([])}
            selectedCustomer={selectedCustomer}
            onOpenCustomerModal={() => setIsCustomerModalOpen(true)}
            onRemoveCustomer={() => setSelectedCustomer(null)}
            riders={riders}
            selectedRider={selectedRider}
            onSelectRider={setSelectedRider}
            orderType={orderType}
            onOrderTypeChange={setOrderType}
            tableNo={tableNo}
            onTableNoChange={setTableNo}
            discount={discount}
            onDiscountChange={setDiscount}
            discountType={discountType}
            onDiscountTypeChange={setDiscountType}
            deliveryFee={deliveryFee}
            onDeliveryFeeChange={setDeliveryFee}
            taxRate={taxRate}
            onTaxRateChange={setTaxRate}
            onCheckout={() => {
              setIsMobileCartOpen(false);
              setIsPaymentModalOpen(true);
            }}
            isMobileOpen={isMobileCartOpen}
            onCloseMobile={() => setIsMobileCartOpen(false)}
          />
        </div>

        {/* Mobile Floating Cart Summary Bar */}
        {cart.length > 0 && (
          <div className="lg:hidden p-3 bg-slate-900 border-t border-slate-800 shadow-2xl flex items-center justify-between gap-3 shrink-0 z-30 animate-in slide-in-from-bottom-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold font-mono text-xs shadow-inner">
                {totalCartItems}
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Cart Total</p>
                <p className="text-sm font-extrabold text-amber-400 font-mono leading-none">
                  {formatCurrency(grandTotal)}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsMobileCartOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center space-x-1.5 transition-all"
            >
              <span>View Cart & Pay</span>
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <CustomizationModal
        isOpen={isPizzaModalOpen}
        onClose={() => setIsPizzaModalOpen(false)}
        onAddToCart={handleAddToCart}
        pizzaConfig={pizzaConfig || { flavors: [], sizes: [], crusts: [], toppings: [] }}
        initialCategoryName={modalCategoryName}
        initialFlavorName={modalFlavorName}
      />

      <PastaCustomizationModal
        isOpen={selectedPastaProduct !== null}
        product={selectedPastaProduct}
        onClose={() => setSelectedPastaProduct(null)}
        onAddToCart={handleAddPastaToCart}
      />

      <PastaCustomizationModal
        isOpen={selectedSandwichProduct !== null}
        product={selectedSandwichProduct}
        title="Customize Sandwich"
        extraToppingPrice={150}
        onClose={() => setSelectedSandwichProduct(null)}
        onAddToCart={handleAddPastaToCart}
      />

      <PastaCustomizationModal
        isOpen={selectedBurgerProduct !== null}
        product={selectedBurgerProduct}
        title="Customize Burger"
        extraToppingName="With Cheese"
        extraToppingPrice={100}
        onClose={() => setSelectedBurgerProduct(null)}
        onAddToCart={handleAddPastaToCart}
      />

      <PastaCustomizationModal
        isOpen={selectedLoadedFriesProduct !== null}
        product={selectedLoadedFriesProduct}
        title="Customize Loaded Fries"
        extraToppingPrice={150}
        onClose={() => setSelectedLoadedFriesProduct(null)}
        onAddToCart={handleAddPastaToCart}
      />

      <DrinkCustomizationModal
        isOpen={isDrinkModalOpen}
        products={globalProducts}
        onClose={() => setIsDrinkModalOpen(false)}
        onAddToCart={handleAddPastaToCart}
      />

      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSelectCustomer={setSelectedCustomer}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        cart={cart}
        selectedCustomer={selectedCustomer}
        selectedRider={selectedRider}
        orderType={orderType}
        tableNo={tableNo}
        subtotal={subtotal}
        discount={discount}
        discountType={discountType}
        taxRate={taxRate}
        deliveryFee={deliveryFee}
        onOrderCompleted={handleOrderCompleted}
      />

      <ThermalReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        order={completedOrder}
        onNewOrder={handleResetOrder}
      />
    </div>
  );
}
