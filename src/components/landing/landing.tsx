"use client";

import { useEffect, useMemo, useState } from "react";
import { AddToCartDialog } from "./add-to-cart-dialog";
import { CartDrawer } from "./cart-drawer";
import { CustomerMenuDrawer } from "./customer-menu-drawer";
import { CustomerOrdersDialog } from "./customer-orders-dialog";
import { LandingFooter } from "./landing-footer";
import { LandingHeader } from "./landing-header";
import { MenuHero } from "./menu-hero";
import { OrderSuccessDialog } from "./order-success-dialog";
import { ProductDetailDialog } from "./product-detail-dialog";
import { ProductGrid } from "./product-grid";
import { CategoryFilter } from "./category-filter";
import { Button } from "@/components/ui/button";
import type {
  CartItem,
  Customer,
  MenuData,
  OrderType,
  PaymentMethod,
  Product,
} from "./types";

type PizzaConfiguration = {
  flavorId: string;
  sizeId: string;
  crustId: string;
  toppingIds: string[];
};
type SuccessOrder = { invoiceNo?: string };
type PendingCartItem = { product: Product; configuration: PizzaConfiguration };

const defaultCustomer: Customer = { name: "", phone: "", address: "" };
const formatMoney = (value: number) => `Rs. ${Math.round(value).toLocaleString()}`;

const drinkSequence = ["diet", "mint", "coke", "sprite", "water"] as const;

function getDrinkKey(name: string): string {
  const normalized = name.toLowerCase();

  if (/(diet|zero)/.test(normalized)) return "diet";
  if (/(mint|minty)/.test(normalized)) return "mint";
  if (/(coca|cola|coke|fanta)/.test(normalized)) return "coke";
  if (/(sprite|7up|lemon|lime)/.test(normalized)) return "sprite";
  if (/(water|aqua|mineral)/.test(normalized)) return "water";

  return "other";
}

function inferDrinkKey(product: Product): string {
  const direct = getDrinkKey(product.name);
  if (direct !== "other") return direct;

  const text = `${product.name} ${product.category?.name || ""}`.toLowerCase();

  if (text.includes("water")) return "water";
  if (/250ml|can/.test(text)) return "coke";
  if (/500ml|bottle/.test(text)) return "sprite";
  if (/1\s*ltr|1\s*litre|1l/.test(text)) return "mint";
  if (/1\.5\s*ltr|1\.5\s*litre|large/.test(text)) return "diet";

  return "other";
}

function getDrinkLabel(key: string) {
  switch (key) {
    case "diet":
      return "Diet";
    case "mint":
      return "Mint";
    case "coke":
      return "Coke";
    case "sprite":
      return "Sprite";
    case "water":
      return "Water";
    default:
      return "Other";
  }
}

function getDrinkSizeLabel(productName: string, drinkKey: string) {
  const label = getDrinkLabel(drinkKey);
  const cleaned = productName
    .replace(new RegExp(`^${label}`, "i"), "")
    .replace(/^[\s\-:]+/, "")
    .trim();

  if (cleaned) return cleaned;

  const normalized = productName.toLowerCase();
  if (normalized.includes("250ml") || normalized.includes("can")) return "250ml";
  if (normalized.includes("500ml") || normalized.includes("half")) return "500ml";
  if (normalized.includes("1 ltr") || normalized.includes("1 litre") || normalized.includes("1l")) return "1 Ltr";
  if (normalized.includes("1.5 ltr") || normalized.includes("1.5 litre") || normalized.includes("large")) return "1.5 Ltr";
  if (normalized.includes("water") || normalized.includes("small water")) return "Small Water";
  if (normalized.includes("large water")) return "Large Water";

  return label;
}

function getDrinkImage(product?: Product | null) {
  return product?.image || "/logo.png";
}

function getPizzaFlavorOrder(name: string) {
  const normalized = name.toLowerCase();

  if (normalized.includes("special")) return 0;
  if (normalized.includes("stuffer")) return 1;
  if (normalized.includes("regular")) return 2;
  if (normalized.includes("square")) return 3;

  return 4;
}

function sortPizzaFlavors<T extends { name: string; id: string }>(items: T[]) {
  return [...items].sort((a, b) => {
    const aOrder = getPizzaFlavorOrder(a.name);
    const bOrder = getPizzaFlavorOrder(b.name);

    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.name.localeCompare(b.name);
  });
}

function getPizzaGroupKey(categoryName?: string | null): "special" | "stuffer" | "regular" | "square" | "other" {
  const normalized = (categoryName || "").toLowerCase();

  if (normalized.includes("special")) return "special";
  if (normalized.includes("stuffer")) return "stuffer";
  if (normalized.includes("square")) return "square";
  if (normalized.includes("pizza")) return "regular";

  return "other";
}

function getPizzaGroupTitle(group: "special" | "stuffer" | "regular" | "square" | "other") {
  switch (group) {
    case "special":
      return "SPECIAL PIZZAS";
    case "stuffer":
      return "STUFFER PIZZAS";
    case "regular":
      return "REGULAR PIZZAS";
    case "square":
      return "SQUARE PIZZAS";
    default:
      return "OTHER PIZZAS";
  }
}

const categorySequence = [
  { id: "pizza", name: "Pizza" },
  { id: "pasta", name: "Pasta" },
  { id: "burgers", name: "Burger" },
  { id: "sandwiches", name: "Sandwich" },
  { id: "fries", name: "Fries" },
  { id: "spin-rolls", name: "Spin Roll" },
  { id: "wings", name: "Wings" },
  { id: "nuggets", name: "Nuggets" },
  { id: "dips", name: "Dips" },
  { id: "beverages", name: "Drinks" },
] as const;

function getCategoryBucket(categoryName?: string | null): string {
  const normalizedName = (categoryName || "").toLowerCase();

  if (normalizedName.includes("pizza")) return "pizza";
  if (normalizedName.includes("pasta")) return "pasta";
  if (normalizedName.includes("burger")) return "burgers";
  if (normalizedName.includes("sandwich")) return "sandwiches";
  if (normalizedName.includes("fries")) return "fries";
  if (normalizedName.includes("spin")) return "spin-rolls";
  if (normalizedName.includes("wing")) return "wings";
  if (normalizedName.includes("nugget")) return "nuggets";
  if (normalizedName.includes("dip") || normalizedName.includes("sauce")) return "dips";
  if (
    normalizedName.includes("beverage") ||
    normalizedName.includes("drink") ||
    normalizedName.includes("water")
  )
    return "beverages";

  return "other";
}

function normalizeMenu(data: Partial<MenuData>): MenuData {
  return {
    categories: Array.isArray(data.categories) ? data.categories : [],
    products: Array.isArray(data.products) ? data.products : [],
    flavors: Array.isArray(data.flavors) ? data.flavors : [],
    sizes: Array.isArray(data.sizes) ? data.sizes : [],
    crusts: Array.isArray(data.crusts) ? data.crusts : [],
    toppings: Array.isArray(data.toppings) ? data.toppings : [],
    settings:
      data.settings && typeof data.settings === "object" ? data.settings : {},
  };
}

type LandingProps = { initialMenu?: MenuData };

export function Landing({ initialMenu }: LandingProps) {
  const [menu, setMenu] = useState<MenuData | undefined>(initialMenu);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hasLoadedCart, setHasLoadedCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCustomerMenuOpen, setIsCustomerMenuOpen] = useState(false);
  const [ordersScope, setOrdersScope] = useState<"active" | "history">();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [pizza, setPizza] = useState<Product>();
  const [pendingCartItem, setPendingCartItem] = useState<PendingCartItem>();
  const [selectedDrinkKey, setSelectedDrinkKey] = useState<string | null>(null);
  const [drinkSelectedProduct, setDrinkSelectedProduct] = useState<Product | null>(null);
  const [drinkQuantity, setDrinkQuantity] = useState(1);
  const [pizzaConfiguration, setPizzaConfiguration] =
    useState<PizzaConfiguration>({
      flavorId: "",
      sizeId: "",
      crustId: "",
      toppingIds: [],
    });
  const [customer, setCustomer] = useState<Customer>(defaultCustomer);
  const [orderType, setOrderType] = useState<OrderType>("DELIVERY");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [message, setMessage] = useState("");
  const [placing, setPlacing] = useState(false);
  const [successOrder, setSuccessOrder] = useState<SuccessOrder>();

  useEffect(() => {
    if (initialMenu) return;

    async function loadMenu() {
      try {
        const response = await fetch("/api/public/menu");
        const data = await response.json().catch(() => ({}));
        if (!response.ok)
          throw new Error(data.error || "Could not load the menu.");
        setMenu(normalizeMenu(data));
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Could not load the menu.",
        );
      }
    }
    void loadMenu();
  }, [initialMenu]);

  useEffect(() => {
    const savedCustomer = window.localStorage.getItem("urban-spice-customer");
    if (!savedCustomer) return;
    try { setCustomer(JSON.parse(savedCustomer)); } catch { window.localStorage.removeItem("urban-spice-customer"); }
  }, []);

  useEffect(() => {
    try { setCart(JSON.parse(window.localStorage.getItem("urban-spice-cart") || "[]")); } catch { window.localStorage.removeItem("urban-spice-cart"); }
    setHasLoadedCart(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedCart) return;
    window.localStorage.setItem("urban-spice-cart", JSON.stringify(cart));
  }, [cart, hasLoadedCart]);

  const products = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const selectedBucket = selectedCategory === "all" ? "all" : selectedCategory;

    return [...(menu?.products ?? [])]
      .filter((product) => {
        const productBucket = getCategoryBucket(product.category?.name || "");
        const categoryMatches =
          selectedBucket === "all" || productBucket === selectedBucket;

        if (!categoryMatches) return false;

        if (!query) return true;

        return [product.name, product.description, product.category?.name]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(query));
      })
      .sort((a, b) => {
        const aBucket = getCategoryBucket(a.category?.name || "");
        const bBucket = getCategoryBucket(b.category?.name || "");
        const aOrder = categorySequence.findIndex((item) => item.id === aBucket);
        const bOrder = categorySequence.findIndex((item) => item.id === bBucket);

        if (aOrder !== bOrder) {
          return (aOrder === -1 ? Number.MAX_SAFE_INTEGER : aOrder) -
            (bOrder === -1 ? Number.MAX_SAFE_INTEGER : bOrder);
        }

        return a.name.localeCompare(b.name);
      });
  }, [menu, searchQuery, selectedCategory]);

  const groupedProducts = useMemo(() => {
    const groups = new Map<string, Product[]>();

    for (const product of products) {
      const bucket = getCategoryBucket(product.category?.name || "");
      if (bucket === "other") continue;
      const current = groups.get(bucket) ?? [];
      current.push(product);
      groups.set(bucket, current);
    }

    return categorySequence
      .map((category) => ({
        category,
        items: (groups.get(category.id) ?? []).sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      }))
      .filter(({ items }) => items.length > 0);
  }, [products]);

  const mainCategoryCards = categorySequence.map((category) => ({
    ...category,
    itemCount: (menu?.products ?? []).filter(
      (product) => getCategoryBucket(product.category?.name || "") === category.id,
    ).length,
  }));

  const pizzaGroups = useMemo(() => {
    const grouped: Record<"special" | "stuffer" | "regular" | "square" | "other", Product[]> = {
      special: [],
      stuffer: [],
      regular: [],
      square: [],
      other: [],
    };

    const seen = new Set<string>();

    for (const product of menu?.products ?? []) {
      if (!product.isPizza) continue;
      if (seen.has(product.id)) continue;
      seen.add(product.id);

      const group = getPizzaGroupKey(product.category?.name || "");
      grouped[group].push(product);
    }

    for (const group of Object.keys(grouped) as Array<keyof typeof grouped>) {
      grouped[group].sort((a, b) => a.name.localeCompare(b.name));
    }

    return grouped;
  }, [menu]);

  const drinksByGroup = useMemo(() => {
    const grouped = new Map<string, Product[]>();

    for (const product of menu?.products ?? []) {
      if (product.isPizza) continue;

      const bucket = getCategoryBucket(product.category?.name || "");
      const categoryText = `${product.name} ${product.category?.name || ""}`.toLowerCase();
      const isBeverage =
        bucket === "beverages" ||
        /(drink|beverage|water|coke|sprite|mint|diet|cola)/.test(categoryText);

      if (!isBeverage) continue;

      const key = inferDrinkKey(product);
      if (key === "other") continue;

      const current = grouped.get(key) ?? [];
      current.push(product);
      grouped.set(key, current);
    }

    return drinkSequence.map((key) => ({
      key,
      label: getDrinkLabel(key),
      products: (grouped.get(key) ?? []).sort((a, b) => a.name.localeCompare(b.name)),
    }));
  }, [menu]);

  const selectedDrinkProducts = useMemo(() => {
    if (!selectedDrinkKey) return [];
    const group = drinksByGroup.find((item) => item.key === selectedDrinkKey);
    return group ? [...group.products] : [];
  }, [drinksByGroup, selectedDrinkKey]);

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const deliveryFee =
    orderType === "DELIVERY"
      ? Number(menu?.settings.defaultDeliveryFee || 0)
      : 0;
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  function addDrinkToCart(product: Product, quantity: number) {
    const sizeLabel = selectedDrinkKey
      ? getDrinkSizeLabel(product.name, selectedDrinkKey)
      : product.name;
    const itemName = selectedDrinkKey
      ? `${getDrinkLabel(selectedDrinkKey)}${sizeLabel ? ` - ${sizeLabel}` : ""}`
      : product.name;

    setCart((currentCart) => {
      const key = `${product.id}`;
      const existingItem = currentCart.find((item) => item.key === key);

      return existingItem
        ? currentCart.map((item) =>
            item.key === key
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          )
        : [
            ...currentCart,
            {
              key,
              productId: product.id,
              name: itemName,
              price: product.basePrice,
              quantity,
              toppingIds: [],
            },
          ];
    });

    setSelectedDrinkKey(null);
    setDrinkSelectedProduct(null);
    setDrinkQuantity(1);
  }

  function requestAddToCart(
    product: Product,
    configuration: PizzaConfiguration = {
      flavorId: "",
      sizeId: "",
      crustId: "",
      toppingIds: [],
    },
  ) {
    setPendingCartItem({ product, configuration });
    setPizza(undefined);
  }

  function addProduct(product: Product, configuration: PizzaConfiguration) {
    if (!menu) return;
    const flavor = menu.flavors.find(
      (item) => item.id === configuration.flavorId,
    );
    const flavorPrice = flavor?.flavorPrices.find(
      (item) => item.sizeId === configuration.sizeId,
    )?.price;
    const crustPrice =
      menu.crusts.find((item) => item.id === configuration.crustId)
        ?.additionalPrice || 0;
    const toppingsPrice = configuration.toppingIds.reduce(
      (total, toppingId) =>
        total +
        (menu.toppings.find((item) => item.id === toppingId)?.additionalPrice ||
          0),
      0,
    );
    const price = product.isPizza
      ? (flavorPrice || product.basePrice) + crustPrice + toppingsPrice
      : product.basePrice;
    const key = `${product.id}-${configuration.flavorId}-${configuration.sizeId}-${configuration.crustId}-${configuration.toppingIds.join(",")}`;

    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.key === key);
      return existingItem
        ? currentCart.map((item) =>
            item.key === key ? { ...item, quantity: item.quantity + 1 } : item,
          )
        : [
            ...currentCart,
            {
              key,
              productId: product.id,
              name: product.name,
              price,
              quantity: 1,
              ...configuration,
            },
          ];
    });
    setPendingCartItem(undefined);
  }

  function openPizzaCustomization(product: Product) {
    if (!menu) return;
    const matchedFlavor =
      menu.flavors.find(
        (flavor) => flavor.name.toLowerCase() === product.name.toLowerCase(),
      ) ??
      sortPizzaFlavors(menu.flavors)[0];

    setPizza(product);
    setPizzaConfiguration({
      flavorId: matchedFlavor?.id || "",
      sizeId: menu.sizes[0]?.id || "",
      crustId: "",
      toppingIds: [],
    });
  }

  async function placeOrder() {
    setMessage("");
    if (customer.name.trim().length < 2)
      return setMessage("Please enter your name.");
    if (customer.phone.trim().length < 5)
      return setMessage("Please enter a valid contact number.");
    if (orderType === "DELIVERY" && customer.address.trim().length < 5)
      return setMessage("Please enter your complete delivery address.");

    setPlacing(true);
    try {
      const response = await fetch("/api/public/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          orderType,
          paymentMethod,
          items: cart,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          data.error || `Order could not be placed (error ${response.status}).`,
        );
      setSuccessOrder(data.order);
      window.localStorage.setItem("urban-spice-customer", JSON.stringify(customer));
      setCart([]);
      setIsCheckoutOpen(false);
      setIsCartOpen(false);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to place order. Please try again.",
      );
    } finally {
      setPlacing(false);
    }
  }

  if (!menu)
    return (
      <main className="grid min-h-screen place-items-center bg-[#fff9f0] p-6 text-center text-orange-600">
        {message || "Loading Urban Spice…"}
      </main>
    );

  return (
    <main className="min-h-screen bg-[#fff9f0] text-[#32170e]">
      <LandingHeader
        storeLogo={menu.settings.storeLogo}
        storeName={menu.settings.storeName}
        itemCount={itemCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenMenu={() => setIsCustomerMenuOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
      />
      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10">
        <MenuHero />
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600">Pick your favourites</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight">Explore the menu</h2>
          </div>
          <p className="hidden text-sm text-stone-500 sm:block">Made fresh after you order</p>
        </div>
        <CategoryFilter
          categories={mainCategoryCards.map(({ id, name }) => ({ id, name }))}
          selectedCategory={selectedCategory}
          onSelect={setSelectedCategory}
        />
        {selectedCategory === "all" ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {mainCategoryCards.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id === "pizza" ? "pizza" : category.id)}
                className="group overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-900/10"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                  <img
                    src={
                      (menu?.products ?? []).find(
                        (product) => getCategoryBucket(product.category?.name || "") === category.id,
                      )?.image || "/logo.png"
                    }
                    alt={category.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#78001b] shadow-md">
                    {category.name}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-black tracking-tight text-[#4a0a18]">{category.name}</h3>
                    <span className="rounded-full bg-[#fff1e6] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#a4854f]">
                      {category.itemCount} items
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-stone-600">
                    {category.id === "pizza"
                      ? "Freshly prepared pizzas"
                      : category.id === "pasta"
                        ? "Handcrafted pasta favourites"
                        : category.id === "burgers"
                          ? "Loaded burgers and bites"
                          : category.id === "sandwiches"
                            ? "Fresh sandwiches and wraps"
                            : category.id === "fries"
                              ? "Sides and loaded fries"
                              : category.id === "spin-rolls"
                                ? "Crispy spin rolls"
                                : category.id === "wings"
                                  ? "Oven baked and hot wings"
                                  : category.id === "nuggets"
                                    ? "Crispy chicken nuggets"
                                    : category.id === "dips"
                                      ? "Sauces and dips"
                                      : "Cold drinks and beverages"}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3">
                    <strong className="text-base text-[#4a0a18]">
                      View {category.name}
                    </strong>
                    <span className="rounded-full bg-[#c4002c] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-white">
                      Open
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : selectedCategory === "beverages" ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-2xl font-black tracking-tight text-[#4a0a18]">Drinks</h3>
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-[#4a0a18]"
              >
                Back to menu
              </button>
            </div>

            {!selectedDrinkKey ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {drinksByGroup.map((group) => (
                  <button
                    key={group.key}
                    type="button"
                    onClick={() => {
                      setSelectedDrinkKey(group.key);
                      setDrinkSelectedProduct(null);
                      setDrinkQuantity(1);
                    }}
                    className="rounded-[1.5rem] border border-stone-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="mb-3 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-[#fff1e6] text-lg font-black text-[#4a0a18]">
                      {group.products[0]?.image ? (
                        <img
                          src={getDrinkImage(group.products[0])}
                          alt={group.label}
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.src = "/logo.png";
                          }}
                        />
                      ) : (
                        <span>{group.label.charAt(0)}</span>
                      )}
                    </div>
                    <p className="text-lg font-black text-[#4a0a18]">{group.label}</p>
                    <p className="mt-2 text-xs text-stone-500">{group.products.length} available</p>
                  </button>
                ))}
              </div>
            ) : !drinkSelectedProduct ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-xl font-black text-[#4a0a18]">{getDrinkLabel(selectedDrinkKey)}</h4>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDrinkKey(null);
                      setDrinkSelectedProduct(null);
                    }}
                    className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-[#4a0a18]"
                  >
                    Back
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {selectedDrinkProducts.length > 0 ? (
                    selectedDrinkProducts.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => setDrinkSelectedProduct(product)}
                        className="rounded-[1.5rem] border border-stone-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#a4854f]">Size</p>
                            <h3 className="mt-1 text-lg font-black text-[#4a0a18]">
                              {getDrinkSizeLabel(product.name, selectedDrinkKey)}
                            </h3>
                          </div>
                          <span className="rounded-full bg-[#fff1e6] px-2.5 py-1 text-sm font-black text-[#4a0a18]">
                            {formatMoney(product.basePrice)}
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-stone-600 sm:col-span-2 xl:col-span-3">
                      No drink sizes are configured for {getDrinkLabel(selectedDrinkKey)} yet in the database.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a4854f]">Selected drink</p>
                    <h4 className="mt-1 text-2xl font-black text-[#4a0a18]">
                      {getDrinkLabel(selectedDrinkKey)}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDrinkSelectedProduct(null)}
                    className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-[#4a0a18]"
                  >
                    Change size
                  </button>
                </div>

                <div className="mt-5 rounded-2xl bg-[#fff8ee] p-4 ring-1 ring-orange-100">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-16 w-16 overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
                        <img
                          src={getDrinkImage(drinkSelectedProduct)}
                          alt={drinkSelectedProduct.name}
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.src = "/logo.png";
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#a4854f]">Size</p>
                        <p className="mt-1 text-xl font-black text-[#32170e]">
                          {getDrinkSizeLabel(drinkSelectedProduct.name, selectedDrinkKey)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#a4854f]">Unit price</p>
                      <p className="mt-1 text-xl font-black text-[#32170e]">{formatMoney(drinkSelectedProduct.basePrice)}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-3">
                    <span className="text-sm font-black uppercase tracking-[0.14em] text-[#4a0a18]">Quantity</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setDrinkQuantity((current) => Math.max(1, current - 1))}
                        className="h-8 w-8 rounded-full border border-stone-200 bg-white text-lg font-black text-[#4a0a18]"
                      >
                        −
                      </button>
                      <span className="min-w-8 text-center text-lg font-black text-[#32170e]">{drinkQuantity}</span>
                      <button
                        type="button"
                        onClick={() => setDrinkQuantity((current) => current + 1)}
                        className="h-8 w-8 rounded-full border border-stone-200 bg-white text-lg font-black text-[#4a0a18]"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-stone-200 bg-white p-4">
                    <div className="flex items-center justify-between text-sm text-stone-600">
                      <span>Unit price</span>
                      <span>{formatMoney(drinkSelectedProduct.basePrice)}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm text-stone-600">
                      <span>Quantity</span>
                      <span>{drinkQuantity}</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3">
                      <span className="text-base font-black uppercase tracking-[0.14em] text-[#4a0a18]">Total</span>
                      <span className="text-2xl font-black text-[#32170e]">
                        {formatMoney(drinkSelectedProduct.basePrice * drinkQuantity)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  size="lg"
                  className="mt-5 w-full bg-[#32170e] text-white hover:bg-[#572314]"
                  onClick={() => addDrinkToCart(drinkSelectedProduct, drinkQuantity)}
                >
                  Add to cart
                </Button>
              </div>
            )}
          </div>
        ) : selectedCategory === "pizza" ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-2xl font-black tracking-tight text-[#4a0a18]">Pizza Flavours</h3>
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-[#4a0a18]"
              >
                Back to menu
              </button>
            </div>

            {(["special", "stuffer", "regular", "square"] as const).map((group) => {
              const items = pizzaGroups[group];
              if (items.length === 0) return null;

              return (
                <section key={group} className="rounded-[1.5rem] border border-stone-200 bg-white p-4 shadow-sm">
                  <h4 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-[#a4854f]">
                    {getPizzaGroupTitle(group)}
                  </h4>
                  <ProductGrid
                    products={items}
                    onAdd={requestAddToCart}
                    onCustomize={openPizzaCustomization}
                  />
                </section>
              );
            })}

            {pizzaGroups.other.length > 0 && (
              <section className="rounded-[1.5rem] border border-dashed border-amber-300 bg-amber-50 p-4 shadow-sm">
                <h4 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-[#a4854f]">
                  {getPizzaGroupTitle("other")}
                </h4>
                <p className="mb-4 text-xs font-semibold text-amber-800">
                  These pizzas need a category mapping in the database.
                </p>
                <ProductGrid
                  products={pizzaGroups.other}
                  onAdd={requestAddToCart}
                  onCustomize={openPizzaCustomization}
                />
              </section>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-black tracking-tight text-[#4a0a18]">
                {categorySequence.find((category) => category.id === selectedCategory)?.name || "Menu"}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-[#4a0a18]"
              >
                Back to menu
              </button>
            </div>
            <ProductGrid
              products={products}
              onAdd={requestAddToCart}
              onCustomize={openPizzaCustomization}
            />
          </div>
        )}
      </section>
      <LandingFooter storeName={menu.settings.storeName} />
      {isCustomerMenuOpen && <CustomerMenuDrawer onClose={() => setIsCustomerMenuOpen(false)} onHome={() => window.scrollTo({ top: 0, behavior: "smooth" })} onCart={() => setIsCartOpen(true)} onMyOrders={() => setOrdersScope("active")} onOrderHistory={() => setOrdersScope("history")} />}
      {ordersScope && <CustomerOrdersDialog scope={ordersScope} customerName={customer.name} phone={customer.phone} onClose={() => setOrdersScope(undefined)} />}
      {pizza && (
        <ProductDetailDialog
          product={pizza}
          menu={menu}
          {...pizzaConfiguration}
          onFlavorChange={(flavorId) =>
            setPizzaConfiguration((current) => ({ ...current, flavorId }))
          }
          onSizeChange={(sizeId) =>
            setPizzaConfiguration((current) => ({ ...current, sizeId }))
          }
          onCrustChange={(crustId) =>
            setPizzaConfiguration((current) => ({ ...current, crustId }))
          }
          onToggleTopping={(toppingId) =>
            setPizzaConfiguration((current) => ({
              ...current,
              toppingIds: current.toppingIds.includes(toppingId)
                ? current.toppingIds.filter((id) => id !== toppingId)
                : [...current.toppingIds, toppingId],
            }))
          }
          onAdd={() => requestAddToCart(pizza, pizzaConfiguration)}
          onClose={() => setPizza(undefined)}
        />
      )}
      {pendingCartItem && (
        <AddToCartDialog
          product={pendingCartItem.product}
          onConfirm={() =>
            addProduct(pendingCartItem.product, pendingCartItem.configuration)
          }
          onCancel={() => setPendingCartItem(undefined)}
        />
      )}
      {isCartOpen && (
        <CartDrawer
          cart={cart}
          checkout={isCheckoutOpen}
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          customer={customer}
          orderType={orderType}
          paymentMethod={paymentMethod}
          message={message}
          placing={placing}
          onClose={() => {
            setIsCartOpen(false);
            setIsCheckoutOpen(false);
          }}
          onCheckout={() => setIsCheckoutOpen(true)}
          onChangeQuantity={(key, change) =>
            setCart((current) =>
              current.flatMap((item) =>
                item.key !== key
                  ? [item]
                  : item.quantity + change > 0
                    ? [{ ...item, quantity: item.quantity + change }]
                    : [],
              ),
            )
          }
          onRemove={(key) =>
            setCart((current) => current.filter((item) => item.key !== key))
          }
          onCustomerChange={setCustomer}
          onOrderTypeChange={setOrderType}
          onPaymentMethodChange={setPaymentMethod}
          onPlaceOrder={placeOrder}
        />
      )}
      {successOrder && (
        <OrderSuccessDialog
          invoiceNo={successOrder.invoiceNo}
          onClose={() => setSuccessOrder(undefined)}
        />
      )}
    </main>
  );
}
