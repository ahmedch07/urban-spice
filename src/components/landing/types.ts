export type CartItem = {
  key: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  flavorId?: string;
  sizeId?: string;
  crustId?: string;
  toppingIds: string[];
};

export type MenuData = {
  categories: Array<{ id: string; name: string }>;
  products: Product[];
  flavors: Flavor[];
  sizes: Array<{ id: string; name: string }>;
  crusts: Array<{ id: string; name: string; additionalPrice: number }>;
  toppings: Array<{ id: string; name: string; additionalPrice: number }>;
  settings: { storeLogo?: string; storeName?: string; defaultDeliveryFee?: number | string };
};

export type Product = { id: string; name: string; basePrice: number; description?: string | null; image?: string | null; isPizza: boolean; categoryId: string; category?: { name: string } | null };
export type Flavor = { id: string; name: string; flavorPrices: Array<{ sizeId: string; price: number }> };
export type Customer = { name: string; phone: string; address: string };
export type OrderType = "DELIVERY" | "TAKEAWAY";
export type PaymentMethod = "CASH" | "ONLINE" | "CARD";
