export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  sortOrder: number;
}

export interface ProductItem {
  id: string;
  name: string;
  SKU: string;
  description?: string | null;
  image?: string | null;
  categoryId: string;
  category?: { id: string; name: string; slug: string } | null;
  basePrice: number;
  costPrice: number;
  stock: number;
  minStock: number;
  isPizza: boolean;
  active: boolean;
}

export interface PizzaFlavorItem {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  active: boolean;
  sortOrder: number;
  flavorPrices?: {
    sizeId: string;
    price: number;
  }[];
}

export interface PizzaSizeItem {
  id: string;
  name: string;
  code: string;
  sortOrder: number;
}

export interface CrustItem {
  id: string;
  name: string;
  additionalPrice: number;
  active: boolean;
}

export interface ToppingItem {
  id: string;
  name: string;
  additionalPrice: number;
  stock: number;
  active: boolean;
}

export interface PizzaConfig {
  flavors: PizzaFlavorItem[];
  sizes: PizzaSizeItem[];
  crusts: CrustItem[];
  toppings: ToppingItem[];
}

export interface CartItemTopping {
  toppingId: string;
  name: string;
  price: number;
}

export interface CartItem {
  cartId: string; // client temporary ID
  productId: string;
  productName: string;
  isPizza: boolean;
  flavorId?: string;
  flavorName?: string;
  sizeId?: string;
  sizeName?: string;
  crustId?: string;
  crustName?: string;
  crustPrice?: number;
  toppings: CartItemTopping[];
  specialInstructions?: string;
  unitPrice: number;
  quantity: number;
  itemDiscount: number;
  totalPrice: number;
}

export interface CustomerItem {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  notes?: string | null;
  totalOrders?: number;
  totalSpent?: number;
}

export interface RiderItem {
  id: string;
  name: string;
  phone: string;
  vehicleNo?: string | null;
  active?: boolean;
}

export interface RestaurantTableItem {
  id: string;
  name: string;
  number: number;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
  active: boolean;
  activeOrder?: any | null;
}

export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
export type PaymentMethod = 'CASH' | 'CARD' | 'BANK' | 'ONLINE';
export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
export type PaymentStatus = 'UNPAID' | 'PAID' | 'PARTIAL';
