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
import { CartItem, CategoryItem, CustomerItem, OrderType, ProductItem } from '@/lib/types';

export default function POSPage() {
  // Session User
  const [currentUser, setCurrentUser] = useState<any>(null);

  // POS Data
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [pizzaConfig, setPizzaConfig] = useState<any>({ flavors: [], sizes: [], crusts: [], toppings: [] });

  // Filters & Cart
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);

  // Customer & Order Config
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);
  const [orderType, setOrderType] = useState<OrderType>('DINE_IN');
  const [tableNo, setTableNo] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'FIXED' | 'PERCENTAGE'>('FIXED');
  const [deliveryFee, setDeliveryFee] = useState<number>(150);
  const [taxRate, setTaxRate] = useState<number>(5);

  // Modals visibility
  const [isPizzaModalOpen, setIsPizzaModalOpen] = useState<boolean>(false);
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

  // Fetch Categories, Products & Pizza Config
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

  // Subtotal for modal
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar userRole={currentUser?.role} userName={currentUser?.name} userEmail={currentUser?.email} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Navbar */}
        <Navbar title="Point of Sale (POS) & Billing" />

        {/* POS Workstation split */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Products & Categories */}
          <ProductGrid
            categories={categories}
            products={products}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectProduct={handleAddStandardProductToCart}
            onOpenPizzaModal={() => setIsPizzaModalOpen(true)}
          />

          {/* Right: Cart & Calculation Sidebar */}
          <CartSidebar
            cart={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={() => setCart([])}
            selectedCustomer={selectedCustomer}
            onOpenCustomerModal={() => setIsCustomerModalOpen(true)}
            onRemoveCustomer={() => setSelectedCustomer(null)}
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
            onCheckout={() => setIsPaymentModalOpen(true)}
          />
        </div>
      </div>

      {/* Modals */}
      <CustomizationModal
        isOpen={isPizzaModalOpen}
        onClose={() => setIsPizzaModalOpen(false)}
        onAddToCart={handleAddToCart}
        pizzaConfig={pizzaConfig}
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
