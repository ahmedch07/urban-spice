'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { toast } from '@/components/ui/sonner';
import type {
  CategoryItem,
  ProductItem,
  PizzaConfig,
  RestaurantTableItem,
  RiderItem,
  CustomerItem,
} from '@/lib/types';

function isStaffRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  if (pathname === '/') return false;
  const staffRoutes = [
    '/pos',
    '/orders',
    '/kitchen',
    '/dashboard',
    '/admin',
    '/cashier',
    '/reports',
    '/products',
    '/inventory',
    '/riders',
    '/customers',
    '/pizza-management',
    '/settings',
  ];
  return staffRoutes.some((route) => pathname.startsWith(route));
}

export interface UserSession {
  id?: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'CASHIER' | 'MANAGER' | string;
  phone?: string;
  active?: boolean;
}

export interface StoreSettings {
  storeName: string;
  storeLogo: string;
  storeAddress: string;
  storePhone: string;
  whatsappNumber: string;
  storeEmail: string;
  currency: string;
  taxRate: string;
  taxEnabled: string;
  defaultDeliveryFee: string;
  invoicePrefix: string;
  invoiceFooter: string;
  openingTime: string;
  closingTime: string;
  socialMedia: string;
  receiptSize: string;
  [key: string]: string;
}

const defaultSettings: StoreSettings = {
  storeName: 'Urban Spice',
  storeLogo: '/logo.png',
  storeAddress: '180 F, Near Klash Park, Millat Town, Faisalabad',
  storePhone: '0300-5225898',
  whatsappNumber: '0300-5225898',
  storeEmail: 'orders@urbanspice.com',
  currency: 'Rs.',
  taxRate: '0',
  taxEnabled: 'false',
  defaultDeliveryFee: '100',
  invoicePrefix: 'INV',
  invoiceFooter: 'Thank you for ordering from Urban Spice! Ultimate Taste In Every Bite!',
  openingTime: '11:00 AM',
  closingTime: '02:00 AM',
  socialMedia: '@urbanspicefaisalabad',
  receiptSize: '80mm',
};

interface AppContextType {
  currentUser: UserSession | null;
  storeSettings: StoreSettings;
  categories: CategoryItem[];
  products: ProductItem[];
  pizzaConfig: PizzaConfig | null;
  tables: RestaurantTableItem[];
  riders: RiderItem[];
  customers: CustomerItem[];
  employees: any[];
  inventoryItems: any[];
  orders: any[];
  isGlobalLoading: boolean;
  refreshUser: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshProducts: () => Promise<void>;
  refreshPizzaConfig: () => Promise<void>;
  refreshTables: () => Promise<void>;
  refreshRiders: () => Promise<void>;
  refreshCustomers: () => Promise<void>;
  refreshEmployees: () => Promise<void>;
  refreshInventory: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshAll: () => Promise<void>;
  setOrders: React.Dispatch<React.SetStateAction<any[]>>;
  setProducts: React.Dispatch<React.SetStateAction<ProductItem[]>>;
  setTables: React.Dispatch<React.SetStateAction<RestaurantTableItem[]>>;
  setRiders: React.Dispatch<React.SetStateAction<RiderItem[]>>;
  setCustomers: React.Dispatch<React.SetStateAction<CustomerItem[]>>;
  setEmployees: React.Dispatch<React.SetStateAction<any[]>>;
  setInventoryItems: React.Dispatch<React.SetStateAction<any[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('urban_spice_cached_user');
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return null;
  });
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('urban_spice_store_settings');
        if (cached) return { ...defaultSettings, ...JSON.parse(cached) };
      } catch {}
    }
    return defaultSettings;
  });
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [pizzaConfig, setPizzaConfig] = useState<PizzaConfig | null>(null);
  const [tables, setTables] = useState<RestaurantTableItem[]>([]);
  const [riders, setRiders] = useState<RiderItem[]>([]);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isGlobalLoading, setIsGlobalLoading] = useState<boolean>(true);

  // 1. Fetch User Session
  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
        try {
          localStorage.setItem('urban_spice_cached_user', JSON.stringify(data.user));
        } catch {}
      } else {
        setCurrentUser(null);
        try {
          localStorage.removeItem('urban_spice_cached_user');
        } catch {}
      }
    } catch {}
  }, []);

  // 2. Fetch Store Settings
  const refreshSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings', { cache: 'no-store' });
      const data = await res.json();
      if (data.settings) {
        setStoreSettings((prev) => {
          const updated = { ...prev, ...data.settings };
          try {
            localStorage.setItem('urban_spice_store_settings', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
    } catch {}
  }, []);

  // 3. Fetch Categories
  const refreshCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/pos/categories');
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch {}
  }, []);

  // 4. Fetch Products
  const refreshProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/pos/products');
      const data = await res.json();
      if (data.products) setProducts(data.products);
    } catch {}
  }, []);

  // 5. Fetch Pizza Configuration
  const refreshPizzaConfig = useCallback(async () => {
    try {
      const [fRes, sRes, cRes, tRes] = await Promise.all([
        fetch('/api/pizza-management/flavors'),
        fetch('/api/pizza-management/sizes'),
        fetch('/api/pizza-management/crusts'),
        fetch('/api/pizza-management/toppings'),
      ]);
      const [fData, sData, cData, tData] = await Promise.all([
        fRes.json(),
        sRes.json(),
        cRes.json(),
        tRes.json(),
      ]);
      setPizzaConfig({
        flavors: fData.flavors || [],
        sizes: sData.sizes || [],
        crusts: cData.crusts || [],
        toppings: tData.toppings || [],
      });
    } catch {}
  }, []);

  // 6. Fetch Restaurant Tables
  const refreshTables = useCallback(async () => {
    try {
      const res = await fetch('/api/tables', { cache: 'no-store' });
      const data = await res.json();
      if (data.tables) setTables(data.tables);
    } catch {}
  }, []);

  // 7. Fetch Delivery Riders
  const refreshRiders = useCallback(async () => {
    try {
      const res = await fetch('/api/riders', { cache: 'no-store' });
      const data = await res.json();
      if (data.riders) setRiders(data.riders);
    } catch {}
  }, []);

  // 8. Fetch Customers
  const refreshCustomers = useCallback(async () => {
    try {
      const res = await fetch('/api/pos/customers');
      const data = await res.json();
      if (data.customers) setCustomers(data.customers);
    } catch {}
  }, []);

  // 9. Fetch Employees
  const refreshEmployees = useCallback(async () => {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      if (data.employees) setEmployees(data.employees);
    } catch {}
  }, []);

  const knownOrderIdsRef = React.useRef<Set<string>>(new Set());
  const isInitialLoadRef = React.useRef<boolean>(true);
  const [newOrderAlert, setNewOrderAlert] = useState<any | null>(null);

  // Sound Chime Generator using Web Audio API
  const playOrderNotificationChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.4, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      // Pleasant 3-note notification chime (C5 - E5 - G5)
      playTone(523.25, 0.0, 0.25);
      playTone(659.25, 0.2, 0.25);
      playTone(783.99, 0.4, 0.45);
    } catch {}
  }, []);

  // Unlock AudioContext on first user interaction
  useEffect(() => {
    const unlockAudio = () => {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          if (ctx.state === 'suspended') ctx.resume();
        }
      } catch {}
    };
    window.addEventListener('click', unlockAudio, { once: true });
    window.addEventListener('pointerdown', unlockAudio, { once: true });
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('pointerdown', unlockAudio);
    };
  }, []);

  // 10. Fetch Inventory
  const refreshInventory = useCallback(async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      if (data.items) setInventoryItems(data.items);
    } catch {}
  }, []);

  // 11. Fetch Orders & Alert on New Orders
  const refreshOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders?range=today&limit=50', { cache: 'no-store' });
      const data = await res.json();
      if (data.orders && Array.isArray(data.orders)) {
        const fetchedOrders: any[] = data.orders;

        if (isInitialLoadRef.current) {
          fetchedOrders.forEach((o) => knownOrderIdsRef.current.add(o.id));
          isInitialLoadRef.current = false;
        } else {
          const newOrders = fetchedOrders.filter((o) => !knownOrderIdsRef.current.has(o.id));

          if (newOrders.length > 0) {
            newOrders.forEach((o) => knownOrderIdsRef.current.add(o.id));

            // Only trigger notifications if current page is POS / Staff view
            const isStaffPage = isStaffRoute(pathname);

            if (isStaffPage) {
              playOrderNotificationChime();

              const newest = newOrders[0];
              setNewOrderAlert(newest);

              newOrders.forEach((newOrder) => {
                const itemsSummary = Array.isArray(newOrder.items) && newOrder.items.length > 0
                  ? newOrder.items.map((i: any) => `${i.quantity}× ${i.productName}`).join(', ')
                  : 'Items ordered';

                const customerName = newOrder.customer?.name || newOrder.customerName || 'Online Customer';
                const customerPhone = newOrder.customer?.phone || newOrder.customerPhone || '';
                const orderTypeLabel = newOrder.orderType === 'DELIVERY' ? '🚚 DELIVERY' : newOrder.orderType === 'DINE_IN' ? '🍽️ DINE IN' : '🛍️ TAKEAWAY';
                const isOnline = newOrder.source === 'ONLINE';

                toast.custom(
                  () => (
                    <div className={`w-full max-w-md bg-slate-900 border-2 ${isOnline ? 'border-amber-500 shadow-amber-500/20' : 'border-blue-500'} rounded-2xl p-4 shadow-2xl text-slate-100 flex flex-col space-y-2 animate-in slide-in-from-top-3`}>
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded-full font-black text-[11px] uppercase tracking-wider ${isOnline ? 'bg-amber-500 text-slate-950' : 'bg-blue-500 text-white'}`}>
                          {isOnline ? '🌐 NEW ONLINE ORDER' : '🔔 NEW ORDER RECEIVED'}
                        </span>
                        <span className="font-mono text-xs font-black text-amber-400">
                          #{newOrder.invoiceNo}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm font-extrabold text-white truncate">
                          👤 {customerName}
                        </div>
                        {customerPhone && (
                          <span className="text-xs font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                            📞 {customerPhone}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-amber-300 font-semibold bg-slate-950 p-2.5 rounded-xl border border-slate-800 leading-snug line-clamp-2">
                        📦 {itemsSummary}
                      </div>

                      <div className="flex items-center justify-between text-xs font-black pt-1 border-t border-slate-800">
                        <span className="text-slate-300">
                          Type: <span className="text-amber-400">{orderTypeLabel}</span>
                        </span>
                        <span className="text-emerald-400 font-mono text-sm">
                          Total: Rs. {newOrder.grandTotal}
                        </span>
                      </div>
                    </div>
                  ),
                  { duration: 12000 }
                );
              });
            }
          }
        }

        setOrders(fetchedOrders);
      }
    } catch {}
  }, [playOrderNotificationChime]);

  // Automatic Fast Order Polling (every 3s) & Event Listener for instant notifications
  useEffect(() => {
    const interval = setInterval(() => {
      refreshOrders();
    }, 3000);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'urban_spice_new_online_order') {
        refreshOrders();
      }
    };

    const handleCustomEvent = () => {
      refreshOrders();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('urban_spice_new_online_order', handleCustomEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('urban_spice_new_online_order', handleCustomEvent);
    };
  }, [refreshOrders]);

  // Preload all critical APIs
  const refreshAll = useCallback(async () => {
    setIsGlobalLoading(true);
    await refreshUser();
    await Promise.allSettled([
      refreshSettings(),
      refreshCategories(),
      refreshProducts(),
      refreshPizzaConfig(),
      refreshTables(),
      refreshRiders(),
      refreshCustomers(),
      refreshEmployees(),
      refreshInventory(),
      refreshOrders(),
    ]);
    setIsGlobalLoading(false);
  }, [
    refreshUser,
    refreshSettings,
    refreshCategories,
    refreshProducts,
    refreshPizzaConfig,
    refreshTables,
    refreshRiders,
    refreshCustomers,
    refreshEmployees,
    refreshInventory,
    refreshOrders,
  ]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        storeSettings,
        categories,
        products,
        pizzaConfig,
        tables,
        riders,
        customers,
        employees,
        inventoryItems,
        orders,
        isGlobalLoading,
        refreshUser,
        refreshSettings,
        refreshCategories,
        refreshProducts,
        refreshPizzaConfig,
        refreshTables,
        refreshRiders,
        refreshCustomers,
        refreshEmployees,
        refreshInventory,
        refreshOrders,
        refreshAll,
        setOrders,
        setProducts,
        setTables,
        setRiders,
        setCustomers,
        setEmployees,
        setInventoryItems,
      }}
    >
      {/* Global Floating Top Alert Banner for New Orders (Staff/POS routes only) */}
      {newOrderAlert && isStaffRoute(pathname) && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-xl bg-slate-900 border-2 border-amber-500 text-slate-100 p-3.5 rounded-2xl shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-top-4">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 text-xl shadow-lg">
              🔔
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-extrabold text-[10px] uppercase tracking-wider border border-amber-500/30">
                  {newOrderAlert.source === 'ONLINE' ? '🌐 NEW ONLINE ORDER' : 'NEW ORDER RECEIVED'}
                </span>
                <span className="font-mono font-extrabold text-xs text-amber-400">
                  #{newOrderAlert.invoiceNo}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-100 truncate mt-0.5">
                {newOrderAlert.customer?.name || newOrderAlert.customerName || 'Online Customer'} ({newOrderAlert.customer?.phone || newOrderAlert.customerPhone || 'N/A'})
              </p>
              <p className="text-[11px] text-amber-300 font-medium truncate">
                Rs. {newOrderAlert.grandTotal} • {newOrderAlert.orderType}
              </p>
            </div>
          </div>

          <button
            onClick={() => setNewOrderAlert(null)}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow transition-all shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
