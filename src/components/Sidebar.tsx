'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Receipt,
  UtensilsCrossed,
  Users,
  Package,
  Pizza,
  Boxes,
  BarChart3,
  UserCheck,
  Settings,
  ShieldAlert,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

interface SidebarProps {
  userRole?: string;
  userName?: string;
  userEmail?: string;
}

export default function Sidebar({ userRole: propRole, userName: propName, userEmail: propEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [sessionUser, setSessionUser] = useState<any>(() => {
    if (propRole && propName) {
      return { role: propRole, name: propName, email: propEmail || '' };
    }
    return null;
  });

  useEffect(() => {
    if (propRole && propName) {
      setSessionUser({ role: propRole, name: propName, email: propEmail || '' });
    } else {
      fetch('/api/auth/me')
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setSessionUser(data.user);
          }
        })
        .catch(console.error);
    }
  }, [propRole, propName, propEmail]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      window.location.href = '/login';
    }
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER'] },
    { name: 'POS / New Order', href: '/pos', icon: ShoppingBag, roles: ['ADMIN', 'CASHIER', 'MANAGER'] },
    { name: 'Orders & Sales', href: '/orders', icon: Receipt, roles: ['ADMIN', 'CASHIER', 'MANAGER'] },
    { name: 'Kitchen Display', href: '/kitchen', icon: UtensilsCrossed, roles: ['ADMIN', 'CASHIER', 'MANAGER'] },
    { name: 'Customers', href: '/customers', icon: Users, roles: ['ADMIN', 'CASHIER', 'MANAGER'] },
    { name: 'Products Catalog', href: '/products', icon: Package, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Pizza Config', href: '/pizza-management', icon: Pizza, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Inventory Stock', href: '/inventory', icon: Boxes, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Sales Reports', href: '/reports', icon: BarChart3, roles: ['ADMIN', 'MANAGER'] },
    { name: 'Employees', href: '/employees', icon: UserCheck, roles: ['ADMIN'] },
    { name: 'Store Settings', href: '/settings', icon: Settings, roles: ['ADMIN'] },
    { name: 'Audit Logs', href: '/audit-logs', icon: ShieldAlert, roles: ['ADMIN'] },
  ];

  const currentRole = sessionUser?.role || propRole || 'ADMIN';
  const currentName = sessionUser?.name || propName || 'User';

  const filteredNav = navItems.filter((item) => item.roles.includes(currentRole));

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 select-none z-40">
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

      {/* Footer User Profile, Theme & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50 space-y-3">
        <ThemeToggle variant="sidebar" />

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
            onClick={handleLogout}
            title="Logout"
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
