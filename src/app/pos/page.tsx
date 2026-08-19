'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import ProductGrid from '@/components/POS/ProductGrid';
import CartSidebar from '@/components/POS/CartSidebar';
import CustomizationModal from '@/components/POS/CustomizationModal';
import CustomerModal from '@/components/POS/CustomerModal';
import PaymentModal from '@/components/POS/PaymentModal';
import ThermalReceiptModal from '@/components/POS/ThermalReceiptModal';
import { CartItem, CategoryItem, CustomerItem, OrderType, ProductItem, RiderItem } from '@/lib/types';
import { mergeRiderOverrides } from '@/lib/rider-overrides';
import { formatCurrency } from '@/lib/utils';

export default function POSPage() {
  // Session User
  const [currentUser, setCurrentUser] = useState<any>(null);

  // POS Data
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [pizzaConfig, setPizzaConfig] = useState<any>({ flavors: [], sizes: [], crusts: [], toppings: [] });
  const [riders, setRiders] = useState<RiderItem[]>([]);

  // Filters & Cart
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);

  // Customer & Order Config
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);
  const [selectedRider, setSelectedRider] = useState<RiderItem | null>(null);
  const [orderType, setOrderType] = useState<OrderType>('DINE_IN');
  const [tableNo, setTableNo] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'FIXED' | 'PERCENTAGE'>('FIXED');
  const [deliveryFee, setDeliveryFee] = useState<number>(150);
  const [taxRate, setTaxRate] = useState<number>(5);

  // Modals visibility
  const [isPizzaModalOpen, setIsPizzaModalOpen] = useState<boolean>(false);
  const [modalCategoryName, setModalCategoryName] = useState<string>('Urban Special Pizza');
  const [modalFlavorName, setModalFlavorName] = useState<string | undefined>(undefined);

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState<boolean>(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  // Load User Profile
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch(console.error);
  }, []);

  // Fetch Categories, Products, Pizza Config & Riders
  useEffect(() => {
    fetch('/api/pos/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch(console.error);

    fetch('/api/pos/pizza-config')
      .then((res) => res.json())
      .then((data) => {
        setPizzaConfig(data);
      })
      .catch(console.error);

    const fetchRiders = () => fetch('/api/riders?all=true', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.riders) setRiders(mergeRiderOverrides(data.riders));
      })
      .catch(console.error);

    fetchRiders();
    window.addEventListener('riders-updated', fetchRiders);
    return () => window.removeEventListener('riders-updated', fetchRiders);
  }, []);

  // Fetch Products based on category/search
  useEffect(() => {
    const url = `/api/pos/products?categoryId=${selectedCategory}&search=${encodeURIComponent(searchQuery)}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setProducts(data.products);
      })
      .catch(console.error);
  }, [selectedCategory, searchQuery]);

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
        setIsCustomerModalOpen(false);
        setIsPaymentModalOpen(false);
        setIsReceiptModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
        pizzaConfig={pizzaConfig}
        initialCategoryName={modalCategoryName}
        initialFlavorName={modalFlavorName}
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
