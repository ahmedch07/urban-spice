"use client";

import { useEffect, useMemo, useState } from "react";
import { AddToCartDialog } from "./add-to-cart-dialog";
import { CartDrawer } from "./cart-drawer";
import { CategoryFilter } from "./category-filter";
import { LandingHeader } from "./landing-header";
import { MenuHero } from "./menu-hero";
import { OrderSuccessDialog } from "./order-success-dialog";
import { PizzaCustomizationDialog } from "./pizza-customization-dialog";
import { ProductGrid } from "./product-grid";
import type { CartItem, Customer, MenuData, OrderType, PaymentMethod, Product } from "./types";

type PizzaConfiguration = { flavorId: string; sizeId: string; crustId: string; toppingIds: string[] };
type SuccessOrder = { invoiceNo?: string };
type PendingCartItem = { product: Product; configuration: PizzaConfiguration };

const defaultCustomer: Customer = { name: "", phone: "", address: "" };

function normalizeMenu(data: Partial<MenuData>): MenuData {
  return {
    categories: Array.isArray(data.categories) ? data.categories : [],
    products: Array.isArray(data.products) ? data.products : [],
    flavors: Array.isArray(data.flavors) ? data.flavors : [],
    sizes: Array.isArray(data.sizes) ? data.sizes : [],
    crusts: Array.isArray(data.crusts) ? data.crusts : [],
    toppings: Array.isArray(data.toppings) ? data.toppings : [],
    settings: data.settings && typeof data.settings === "object" ? data.settings : {},
  };
}

export function Landing() {
  const [menu, setMenu] = useState<MenuData>();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [category, setCategory] = useState("all");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [pizza, setPizza] = useState<Product>();
  const [pendingCartItem, setPendingCartItem] = useState<PendingCartItem>();
  const [pizzaConfiguration, setPizzaConfiguration] = useState<PizzaConfiguration>({ flavorId: "", sizeId: "", crustId: "", toppingIds: [] });
  const [customer, setCustomer] = useState<Customer>(defaultCustomer);
  const [orderType, setOrderType] = useState<OrderType>("DELIVERY");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [message, setMessage] = useState("");
  const [placing, setPlacing] = useState(false);
  const [successOrder, setSuccessOrder] = useState<SuccessOrder>();

  useEffect(() => {
    async function loadMenu() {
      try {
        const response = await fetch("/api/public/menu");
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Could not load the menu.");
        setMenu(normalizeMenu(data));
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not load the menu.");
      }
    }
    void loadMenu();
  }, []);

  const products = useMemo(() => menu?.products.filter((product) => category === "all" || product.categoryId === category) ?? [], [category, menu]);
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const deliveryFee = orderType === "DELIVERY" ? Number(menu?.settings.defaultDeliveryFee || 0) : 0;
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  function requestAddToCart(product: Product, configuration: PizzaConfiguration = { flavorId: "", sizeId: "", crustId: "", toppingIds: [] }) {
    setPendingCartItem({ product, configuration });
    setPizza(undefined);
  }

  function addProduct(product: Product, configuration: PizzaConfiguration) {
    if (!menu) return;
    const flavor = menu.flavors.find((item) => item.id === configuration.flavorId);
    const flavorPrice = flavor?.flavorPrices.find((item) => item.sizeId === configuration.sizeId)?.price;
    const crustPrice = menu.crusts.find((item) => item.id === configuration.crustId)?.additionalPrice || 0;
    const toppingsPrice = configuration.toppingIds.reduce((total, toppingId) => total + (menu.toppings.find((item) => item.id === toppingId)?.additionalPrice || 0), 0);
    const price = product.isPizza ? (flavorPrice || product.basePrice) + crustPrice + toppingsPrice : product.basePrice;
    const key = `${product.id}-${configuration.flavorId}-${configuration.sizeId}-${configuration.crustId}-${configuration.toppingIds.join(",")}`;

    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.key === key);
      return existingItem ? currentCart.map((item) => item.key === key ? { ...item, quantity: item.quantity + 1 } : item) : [...currentCart, { key, productId: product.id, name: product.name, price, quantity: 1, ...configuration }];
    });
    setPendingCartItem(undefined);
  }

  function openPizzaCustomization(product: Product) {
    if (!menu) return;
    setPizza(product);
    setPizzaConfiguration({ flavorId: menu.flavors[0]?.id || "", sizeId: menu.sizes[0]?.id || "", crustId: "", toppingIds: [] });
  }

  async function placeOrder() {
    setMessage("");
    if (customer.name.trim().length < 2) return setMessage("Please enter your name.");
    if (customer.phone.trim().length < 5) return setMessage("Please enter a valid contact number.");
    if (orderType === "DELIVERY" && customer.address.trim().length < 5) return setMessage("Please enter your complete delivery address.");

    setPlacing(true);
    try {
      const response = await fetch("/api/public/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customer, orderType, paymentMethod, items: cart }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || `Order could not be placed (error ${response.status}).`);
      setSuccessOrder(data.order);
      setCart([]);
      setIsCheckoutOpen(false);
      setIsCartOpen(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to place order. Please try again.");
    } finally {
      setPlacing(false);
    }
  }

  if (!menu) return <main className="grid min-h-screen place-items-center bg-slate-950 p-6 text-center text-amber-400">{message || "Loading Urban Spice…"}</main>;

  return <main className="min-h-screen bg-slate-950 text-slate-100"><LandingHeader storeLogo={menu.settings.storeLogo} storeName={menu.settings.storeName} itemCount={itemCount} onOpenCart={() => setIsCartOpen(true)} /><section className="mx-auto max-w-6xl p-4 md:p-8"><MenuHero /><CategoryFilter categories={menu.categories} selectedCategory={category} onSelect={setCategory} /><ProductGrid products={products} onAdd={requestAddToCart} onCustomize={openPizzaCustomization} /></section>{pizza && <PizzaCustomizationDialog product={pizza} menu={menu} {...pizzaConfiguration} onFlavorChange={(flavorId) => setPizzaConfiguration((current) => ({ ...current, flavorId }))} onSizeChange={(sizeId) => setPizzaConfiguration((current) => ({ ...current, sizeId }))} onCrustChange={(crustId) => setPizzaConfiguration((current) => ({ ...current, crustId }))} onToggleTopping={(toppingId) => setPizzaConfiguration((current) => ({ ...current, toppingIds: current.toppingIds.includes(toppingId) ? current.toppingIds.filter((id) => id !== toppingId) : [...current.toppingIds, toppingId] }))} onAdd={() => requestAddToCart(pizza, pizzaConfiguration)} onClose={() => setPizza(undefined)} />}{pendingCartItem && <AddToCartDialog product={pendingCartItem.product} onConfirm={() => addProduct(pendingCartItem.product, pendingCartItem.configuration)} onCancel={() => setPendingCartItem(undefined)} />}{isCartOpen && <CartDrawer cart={cart} checkout={isCheckoutOpen} subtotal={subtotal} deliveryFee={deliveryFee} customer={customer} orderType={orderType} paymentMethod={paymentMethod} message={message} placing={placing} onClose={() => { setIsCartOpen(false); setIsCheckoutOpen(false); }} onCheckout={() => setIsCheckoutOpen(true)} onChangeQuantity={(key, change) => setCart((current) => current.flatMap((item) => item.key !== key ? [item] : item.quantity + change > 0 ? [{ ...item, quantity: item.quantity + change }] : []))} onRemove={(key) => setCart((current) => current.filter((item) => item.key !== key))} onCustomerChange={setCustomer} onOrderTypeChange={setOrderType} onPaymentMethodChange={setPaymentMethod} onPlaceOrder={placeOrder} />}{successOrder && <OrderSuccessDialog invoiceNo={successOrder.invoiceNo} onClose={() => setSuccessOrder(undefined)} />}</main>;
}
