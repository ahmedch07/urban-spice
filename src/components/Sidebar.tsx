'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
  Receipt,
  UtensilsCrossed,
  Users,
  Package,
  Pizza,
  Boxes,
  BarChart3,
  UserCheck,
  Truck,
  Settings,
  LogOut,
  ChevronRight,
  X,
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { DeleteConfirmModal } from '@/components/ui/delete-confirm-modal';
import { useApp } from '@/context/AppContext';

interface SidebarProps {
  userRole?: string;
  userName?: string;
  userEmail?: string;
}

export default function Sidebar({ userRole: propRole, userName: propName, userEmail: propEmail }: SidebarProps) {
  const pathname = usePathname();
  const { currentUser, isGlobalLoading } = useApp();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Authoritative role: ONLY from server-confirmed currentUser, never guess
  const currentRole = currentUser?.role?.toUpperCase() || '';
  const currentName = currentUser?.name || propName || 'Staff User';

  useEffect(() => {
    const handleToggle = () => setIsMobileOpen((prev) => !prev);
    window.addEventListener('toggle-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-sidebar', handleToggle);
  }, []);

  // Close mobile drawer on navigation
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      localStorage.removeItem('urban_spice_cached_user');
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      toast.error('Failed to log out cleanly');
    } finally {
      window.location.href = '/login';
    }
  };

  const navItems = [
    { name: 'POS / New Order', href: '/pos', icon: ShoppingBag, roles: ['ADMIN', 'CASHIER', 'MANAGER'] },
    { name: 'Orders & Sales', href: '/orders', icon: Receipt, roles: ['ADMIN', 'CASHIER', 'MANAGER'] },
    { name: 'Kitchen Display', href: '/kitchen', icon: UtensilsCrossed, roles: ['ADMIN', 'CASHIER', 'MANAGER'] },
    { name: 'Delivery Riders', href: '/riders', icon: Truck, roles: ['ADMIN', 'CASHIER', 'MANAGER'] },
    { name: 'Customers', href: '/customers', icon: Users, roles: ['ADMIN', 'CASHIER', 'MANAGER'] },
    { name: 'Products Catalog', href: '/products', icon: Package, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Pizza Config', href: '/pizza-management', icon: Pizza, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Inventory Stock', href: '/inventory', icon: Boxes, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Sales Reports', href: '/reports', icon: BarChart3, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Employees', href: '/employees', icon: UserCheck, roles: ['ADMIN'] },
    { name: 'Store Settings', href: '/settings', icon: Settings, roles: ['ADMIN'] },
  ];

  // Only filter once role is confirmed; show nothing until then
  const filteredNav = currentRole ? navItems.filter((item) => item.roles.includes(currentRole)) : [];

  const sidebarContent = (
    <div className="flex flex-col w-full h-full bg-slate-900 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-500/40 bg-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/10">
            <img src="/logo.png" alt="Urban Spice Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="font-extrabold text-base text-slate-100 tracking-tight leading-none">
              Urban Spice
            </h1>
            <p className="text-xs text-amber-500 font-medium mt-1">Pizza & Restaurant POS</p>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          title="Close Navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-5 h-5 transition-transform duration-150 ${isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'}`} />
                <span>{item.name}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-slate-950" />}
            </Link>
          );
        })}
      </div>

      {/* Footer User Profile & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-bold text-sm shrink-0">
              {currentName.substring(0, 2).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-slate-200 truncate">{currentName}</p>
              <span className={`inline-block px-1.5 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                currentRole === 'ADMIN' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {currentRole}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsLogoutModalOpen(true)}
            title="Logout"
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Static Sidebar */}
      <aside className="hidden lg:flex w-64 h-screen sticky top-0 shrink-0 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-out Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in-0"
          />

          {/* Drawer Panel */}
          <aside className="relative w-72 h-full z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        isLoading={isLoggingOut}
        title="Sign Out of Urban Spice?"
        description="Are you sure you want to log out of your session? You will need to sign in again to access the POS and administration."
        confirmText="Log Out"
        variant="destructive"
      />
    </>
  );
}
