'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  CategoryItem,
  CustomerItem,
  PizzaConfig,
  ProductItem,
  RiderItem,
} from '@/lib/types';
import { mergeRiderOverrides } from '@/lib/rider-overrides';

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
  invoicePrefix: string;
  invoiceFooter: string;
  openingTime: string;
  closingTime: string;
  defaultDeliveryFee: string;
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
  invoicePrefix: 'INV',
  invoiceFooter: 'Thank you for ordering from Urban Spice! Ultimate Taste In Every Bite!',
  openingTime: '11:00 AM',
  closingTime: '02:00 AM',
  defaultDeliveryFee: '100',
  socialMedia: '@urbanspicefaisalabad',
  receiptSize: '80mm',
};

interface AppContextType {
  currentUser: UserSession | null;
  storeSettings: StoreSettings;
  categories: CategoryItem[];
  products: ProductItem[];
  pizzaConfig: PizzaConfig | null;
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
  refreshRiders: () => Promise<void>;
  refreshCustomers: () => Promise<void>;
  refreshEmployees: () => Promise<void>;
  refreshInventory: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshAll: () => Promise<void>;
  setOrders: React.Dispatch<React.SetStateAction<any[]>>;
  setProducts: React.Dispatch<React.SetStateAction<ProductItem[]>>;
  setRiders: React.Dispatch<React.SetStateAction<RiderItem[]>>;
  setCustomers: React.Dispatch<React.SetStateAction<CustomerItem[]>>;
  setEmployees: React.Dispatch<React.SetStateAction<any[]>>;
  setInventoryItems: React.Dispatch<React.SetStateAction<any[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
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
  const [riders, setRiders] = useState<RiderItem[]>([]);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isGlobalLoading, setIsGlobalLoading] = useState<boolean>(true);

  // 1. Fetch User Session
  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user) setCurrentUser(data.user);
    } catch {}
  }, []);

  // 2. Fetch Store Settings
  const refreshSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.settings && Object.keys(data.settings).length > 0) {
        const updated = { ...defaultSettings, ...data.settings };
        setStoreSettings(updated);
        try {
          localStorage.setItem('urban_spice_store_settings', JSON.stringify(updated));
        } catch {}
      }
    } catch {}
  }, []);

  // 3. Fetch Categories
  const refreshCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch {}
  }, []);

  // 4. Fetch Products
  const refreshProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products');
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

  // 6. Fetch Riders
  const refreshRiders = useCallback(async () => {
    try {
      const res = await fetch('/api/riders?all=true', { cache: 'no-store' });
      const data = await res.json();
      if (data.riders) setRiders(mergeRiderOverrides(data.riders));
    } catch {}
  }, []);

  // 7. Fetch Customers
  const refreshCustomers = useCallback(async () => {
    try {
      const res = await fetch('/api/pos/customers');
      const data = await res.json();
      if (data.customers) setCustomers(data.customers);
    } catch {}
  }, []);

  // 8. Fetch Employees
  const refreshEmployees = useCallback(async () => {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      if (data.employees) setEmployees(data.employees);
    } catch {}
  }, []);

  // 9. Fetch Inventory
  const refreshInventory = useCallback(async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      if (data.items) setInventoryItems(data.items);
    } catch {}
  }, []);

  // 10. Fetch Orders
  const refreshOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders?range=today&limit=50');
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch {}
  }, []);

  // Preload all critical APIs once on site load / reload
  const refreshAll = useCallback(async () => {
    setIsGlobalLoading(true);
    await Promise.allSettled([
      refreshUser(),
      refreshSettings(),
      refreshCategories(),
      refreshProducts(),
      refreshPizzaConfig(),
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
    refreshRiders,
    refreshCustomers,
    refreshEmployees,
    refreshInventory,
    refreshOrders,
  ]);

  useEffect(() => {
    refreshAll();

    const handleSettingsUpdated = (e: any) => {
      if (e?.detail) setStoreSettings((prev) => ({ ...prev, ...e.detail }));
    };
    const handleRidersUpdated = () => refreshRiders();

    window.addEventListener('store-settings-updated', handleSettingsUpdated);
    window.addEventListener('riders-updated', handleRidersUpdated);

    return () => {
      window.removeEventListener('store-settings-updated', handleSettingsUpdated);
      window.removeEventListener('riders-updated', handleRidersUpdated);
    };
  }, [refreshAll, refreshRiders]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        storeSettings,
        categories,
        products,
        pizzaConfig,
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
        refreshRiders,
        refreshCustomers,
        refreshEmployees,
        refreshInventory,
        refreshOrders,
        refreshAll,
        setOrders,
        setProducts,
        setRiders,
        setCustomers,
        setEmployees,
        setInventoryItems,
      }}
    >
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
