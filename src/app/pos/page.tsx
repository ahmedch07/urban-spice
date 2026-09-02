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
import TableSelectorModal from '@/components/POS/TableSelectorModal';
import PaymentModal from '@/components/POS/PaymentModal';
import ThermalReceiptModal from '@/components/POS/ThermalReceiptModal';
import { toast } from '@/components/ui/sonner';
import { CartItem, CustomerItem, OrderType, ProductItem, RestaurantTableItem, RiderItem } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import { displayProductName, formatCurrency } from '@/lib/utils';
import { Armchair, Layers } from 'lucide-react';

export default function POSPage() {
  const {
    currentUser,
    categories,
    products: globalProducts,
    pizzaConfig,
    tables,
    storeSettings,
    refreshTables,
    refreshOrders,
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

  // Customer, Table, Rider & Order Config
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);
  const [selectedTable, setSelectedTable] = useState<RestaurantTableItem | null>(null);
  const [selectedRider, setSelectedRider] = useState<RiderItem | null>(null);
  const [deliveryFee, setDeliveryFee] = useState<number>(() => Number(storeSettings.defaultDeliveryFee) || 100);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [orderType, setOrderType] = useState<OrderType>('DINE_IN');
  const [tableNo, setTableNo] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'FIXED' | 'PERCENTAGE'>('FIXED');
  const [taxRate, setTaxRate] = useState<number>(() =>
    storeSettings.taxEnabled === 'true' ? Number(storeSettings.taxRate) || 0 : 0
  );
  const [isSavingOpenOrder, setIsSavingOpenOrder] = useState<boolean>(false);

  // Modals visibility
  const [isPizzaModalOpen, setIsPizzaModalOpen] = useState<boolean>(false);
  const [modalCategoryName, setModalCategoryName] = useState<string>('Urban Special Pizza');
  const [modalFlavorName, setModalFlavorName] = useState<string | undefined>(undefined);
  const [selectedPastaProduct, setSelectedPastaProduct] = useState<ProductItem | null>(null);
  const [selectedSandwichProduct, setSelectedSandwichProduct] = useState<ProductItem | null>(null);
  const [selectedBurgerProduct, setSelectedBurgerProduct] = useState<ProductItem | null>(null);
  const [selectedLoadedFriesProduct, setSelectedLoadedFriesProduct] = useState<ProductItem | null>(null);
  const [isDrinkModalOpen, setIsDrinkModalOpen] = useState(false);

  const [isTableModalOpen, setIsTableModalOpen] = useState<boolean>(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState<boolean>(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  // Keyboard Shortcuts Listener
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
        setIsTableModalOpen(false);
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
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (i) =>
          i.productId === item.productId &&
          i.flavorId === item.flavorId &&
          i.sizeId === item.sizeId &&
          i.crustId === item.crustId &&
          JSON.stringify(i.toppings) === JSON.stringify(item.toppings) &&
          i.specialInstructions === item.specialInstructions
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        const current = updated[existingIdx];
        const newQty = current.quantity + item.quantity;
        updated[existingIdx] = {
          ...current,
          quantity: newQty,
          totalPrice: newQty * current.unitPrice,
        };
        return updated;
      }
      return [...prev, item];
    });
    toast.success(`Added ${item.productName} to order`);
  };

  const handleAddPastaToCart = (item: CartItem) => {
    handleAddToCart(item);
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
    setCart((prev) => prev.filter((i) => i.cartId !== cartId));
  };

  const handleClearCart = () => {
    setCart([]);
    toast.info('Cart cleared');
  };

  const handleResetOrder = () => {
    setCart([]);
    setSelectedCustomer(null);
    setSelectedTable(null);
    setSelectedRider(null);
    setActiveOrderId(null);
    setTableNo('');
    setDiscount(0);
    setTaxRate(storeSettings.taxEnabled === 'true' ? Number(storeSettings.taxRate) || 0 : 0);
    setOrderType('DINE_IN');
    toast.info('Ready for new order');
  };

  // Table selection from TableSelectorModal
  const handleSelectTable = (table: RestaurantTableItem) => {
    setSelectedTable(table);
    setTableNo(table.name);
    setOrderType('DINE_IN');
    toast.success(`Selected ${table.name}`);
  };

  // Reopen existing unpaid table tab
  const handleReopenOrder = (table: RestaurantTableItem, activeOrder: any) => {
    if (!activeOrder) return;
    setSelectedTable(table);
    setTableNo(table.name);
    setActiveOrderId(activeOrder.id);
    setOrderType('DINE_IN');

    if (activeOrder.customer) {
      setSelectedCustomer(activeOrder.customer);
    }

    if (activeOrder.discount !== undefined) {
      setDiscount(activeOrder.discount);
      setDiscountType(activeOrder.discountType || 'FIXED');
    }

    // Convert order items to CartItem format
    const loadedCart: CartItem[] = (activeOrder.items || []).map((item: any) => ({
      cartId: `reopen_${item.id || Math.random()}`,
      productId: item.productId || '',
      productName: item.productName || 'Menu Item',
      isPizza: !!(item.flavorName || item.sizeName),
      flavorId: item.flavorId,
      flavorName: item.flavorName,
      sizeId: item.sizeId,
      sizeName: item.sizeName,
      crustId: item.crustId,
      crustName: item.crustName,
      toppings: (item.toppings || []).map((t: any) => ({
        toppingId: t.toppingId || '',
        name: t.toppingName || '',
        price: Number(t.price) || 0,
      })),
      specialInstructions: item.specialInstructions || '',
      unitPrice: Number(item.unitPrice) || 0,
      quantity: Number(item.quantity) || 1,
      itemDiscount: Number(item.discount) || 0,
      totalPrice: Number(item.total) || 0,
    }));

    setCart(loadedCart);
    toast.success(`Reopened Tab #${activeOrder.invoiceNo} for ${table.name}`);
  };

  // Send to Kitchen (Hold Tab)
  const handleSendToKitchen = async () => {
    if (cart.length === 0) {
      toast.error('Cannot send empty cart to kitchen');
      return;
    }

    if (orderType === 'DINE_IN' && !selectedTable && !tableNo) {
      setIsTableModalOpen(true);
      toast.error('Please assign a table for Dine-In order');
      return;
    }

    setIsSavingOpenOrder(true);

    try {
      if (activeOrderId) {
        // Update existing open table order
        const res = await fetch(`/api/orders/${activeOrderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cart,
            tableId: selectedTable?.id || null,
            tableNo: selectedTable?.name || tableNo || null,
            orderType,
            status: 'PENDING',
            paymentStatus: 'UNPAID',
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          toast.error(err.error || 'Failed to update kitchen order');
          return;
        }

        toast.success(`Updated Kitchen Order for ${selectedTable?.name || tableNo}!`);
      } else {
        // Create new open table order
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerId: selectedCustomer?.id || null,
            tableId: selectedTable?.id || null,
            tableNo: selectedTable?.name || tableNo || null,
            orderType,
            items: cart,
            discount,
            discountType,
            tax: taxRate,
            isPendingPayment: true,
            paymentStatus: 'UNPAID',
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          toast.error(err.error || 'Failed to create open order');
          return;
        }

        toast.success(`Order sent to Kitchen for ${selectedTable?.name || tableNo || 'Table'}!`);
      }

      await refreshTables();
      await refreshOrders();
      handleResetOrder();
    } catch {
      toast.error('Network error sending order to kitchen');
    } finally {
      setIsSavingOpenOrder(false);
    }
  };

  const handleOrderCompleted = (order: any) => {
    setCompletedOrder(order);
    setIsPaymentModalOpen(false);
    setIsReceiptModalOpen(true);
    refreshTables();
    refreshOrders();
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
  const effectiveDeliveryFee = orderType === 'DELIVERY' ? Number(deliveryFee || 0) : 0;
  const grandTotal = Math.round(afterDiscount + taxAmount + effectiveDeliveryFee);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar userRole={currentUser?.role} userName={currentUser?.name} userEmail={currentUser?.email} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Navbar */}
        <Navbar title="Point of Sale (POS) & Restaurant Billing" />

        {/* Top Table Selector Quick Access Bar */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2.5 overflow-x-auto py-0.5">
            <button
              onClick={() => setIsTableModalOpen(true)}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 shrink-0 transition-all"
            >
              <Armchair className="w-4 h-4" />
              <span>{selectedTable ? selectedTable.name : 'Choose Table'}</span>
            </button>

            {selectedTable && (
              <div className="flex items-center space-x-1.5 px-3 py-1 bg-slate-950 border border-slate-800 rounded-xl text-xs shrink-0">
                <span className="text-slate-400 font-medium">Active Dining:</span>
                <span className="font-bold text-amber-400 font-mono">{selectedTable.name}</span>
                {activeOrderId && (
                  <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded">
                    Open Tab
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="hidden sm:flex items-center space-x-3 text-xs text-slate-400">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>{tables.filter((t) => t.status === 'AVAILABLE').length} Tables Free</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>{tables.filter((t) => t.status === 'OCCUPIED').length} Dining</span>
            </span>
          </div>
        </div>

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
            onSelectProduct={(p: ProductItem) =>
              handleAddToCart({
                cartId: `prod_${p.id}_${Math.random().toString(36).substring(2, 7)}`,
                productId: p.id,
                productName: displayProductName(p.name),
                isPizza: false,
                toppings: [],
                unitPrice: p.basePrice,
                quantity: 1,
                itemDiscount: 0,
                totalPrice: p.basePrice,
              })
            }
            onConfigurePasta={(p: ProductItem) => setSelectedPastaProduct(p)}
            onConfigureSandwich={(p: ProductItem) => setSelectedSandwichProduct(p)}
            onConfigureBurger={(p: ProductItem) => setSelectedBurgerProduct(p)}
            onConfigureLoadedFries={(p: ProductItem) => setSelectedLoadedFriesProduct(p)}
            onAddDipSauce={() => {
              const dip = globalProducts.find((p) => p.name.toLowerCase().includes('dip') || p.SKU === 'TOP-DIP');
              if (dip) {
                handleAddToCart({
                  cartId: `dip_${Math.random().toString(36).substring(2, 7)}`,
                  productId: dip.id,
                  productName: dip.name,
                  isPizza: false,
                  toppings: [],
                  unitPrice: dip.basePrice,
                  quantity: 1,
                  itemDiscount: 0,
                  totalPrice: dip.basePrice,
                });
              } else {
                toast.info('Dip sauce not found in catalog');
              }
            }}
            onConfigureDrinks={() => setIsDrinkModalOpen(true)}
            onOpenPizzaModalWithCategory={handleOpenPizzaModalWithCategory}
          />

          {/* Right: Cart Sidebar */}
          <CartSidebar
            cart={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            selectedCustomer={selectedCustomer}
            onOpenCustomerModal={() => setIsCustomerModalOpen(true)}
            onRemoveCustomer={() => setSelectedCustomer(null)}
            selectedTable={selectedTable}
            onOpenTableModal={() => setIsTableModalOpen(true)}
            onRemoveTable={() => {
              setSelectedTable(null);
              setActiveOrderId(null);
              setTableNo('');
            }}
            selectedRider={selectedRider}
            onSelectRider={setSelectedRider}
            deliveryFee={deliveryFee}
            onDeliveryFeeChange={setDeliveryFee}
            activeOrderId={activeOrderId}
            orderType={orderType}
            onOrderTypeChange={setOrderType}
            tableNo={tableNo}
            onTableNoChange={setTableNo}
            discount={discount}
            onDiscountChange={setDiscount}
            discountType={discountType}
            onDiscountTypeChange={setDiscountType}
            taxRate={taxRate}
            onTaxRateChange={setTaxRate}
            onSendToKitchen={handleSendToKitchen}
            onCheckout={() => {
              setIsMobileCartOpen(false);
              setIsPaymentModalOpen(true);
            }}
            isSavingOpenOrder={isSavingOpenOrder}
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
      <TableSelectorModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        tables={tables}
        selectedTableId={selectedTable?.id}
        onSelectTable={handleSelectTable}
        onReopenOrder={handleReopenOrder}
        onRefreshTables={refreshTables}
      />

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
        selectedTable={selectedTable}
        selectedRider={selectedRider}
        deliveryFee={deliveryFee}
        activeOrderId={activeOrderId}
        orderType={orderType}
        tableNo={selectedTable?.name || tableNo}
        subtotal={subtotal}
        discount={discount}
        discountType={discountType}
        taxRate={taxRate}
        onOrderCompleted={handleOrderCompleted}
      />

      <ThermalReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        order={completedOrder}
        onNewOrder={handleResetOrder}
        autoPrint
      />
    </div>
  );
}
