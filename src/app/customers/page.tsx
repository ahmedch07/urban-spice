'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { Users, Search, Phone, Mail, MapPin, ShoppingBag, DollarSign, Clock, Eye, X, Pizza } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function CustomersPage() {
  const [currentUser, setCurrentUser] = useState<any>({ name: 'User', role: '' });
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Selected Customer Profile Modal
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<any[]>([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch(console.error);

    fetchCustomers();
  }, [searchQuery]);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/pos/customers?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.customers) setCustomers(data.customers);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenProfile = async (customer: any) => {
    setSelectedCustomer(customer);
    setIsProfileOpen(true);

    try {
      const res = await fetch(`/api/orders?search=${encodeURIComponent(customer.phone)}`);
      const data = await res.json();
      if (data.orders) {
        setCustomerOrders(data.orders);

        // Calculate favorite products
        const productCounts: Record<string, { name: string; count: number }> = {};
        for (const order of data.orders) {
          for (const item of order.items || []) {
            const name = item.productName;
            if (!productCounts[name]) productCounts[name] = { name, count: 0 };
            productCounts[name].count += item.quantity;
          }
        }
        const topFavs = Object.values(productCounts)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        setFavoriteProducts(topFavs);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar userRole={currentUser.role} userName={currentUser.name} userEmail={currentUser.email} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar title="Customer Database & Lifetime Spending Profiles" />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customers by name, phone or email..."
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">Phone & WhatsApp</th>
                    <th className="p-4">Delivery Address</th>
                    <th className="p-4">Total Orders</th>
                    <th className="p-4">Total Amount Spent</th>
                    <th className="p-4">Last Order Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        Loading customers...
                      </td>
                    </tr>
                  ) : customers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No customer records found
                      </td>
                    </tr>
                  ) : (
                    customers.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 font-bold text-slate-100">{c.name}</td>
                        <td className="p-4 font-mono text-slate-300">{c.phone}</td>
                        <td className="p-4 text-slate-400 max-w-xs truncate">{c.address || '-'}</td>
                        <td className="p-4 font-mono font-bold text-amber-400">{c.totalOrders || 0}</td>
                        <td className="p-4 font-mono font-bold text-emerald-400">{formatCurrency(c.totalSpent || 0)}</td>
                        <td className="p-4 font-mono text-slate-400">{c.lastOrder ? formatDate(c.lastOrder) : 'No orders'}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleOpenProfile(c)}
                            className="px-3 py-1.5 bg-amber-500/10 text-amber-400 font-bold rounded-lg hover:bg-amber-500 hover:text-slate-950 transition-colors flex items-center space-x-1 ml-auto"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Profile</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Customer Profile Drawer / Modal */}
      {isProfileOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-base">
                  {selectedCustomer.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-100">{selectedCustomer.name}</h2>
                  <p className="text-xs text-slate-400 font-mono">{selectedCustomer.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setIsProfileOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Lifetime Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Orders</span>
                  <div className="text-xl font-extrabold text-amber-400 font-mono mt-1">
                    {selectedCustomer.totalOrders || customerOrders.length}
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Lifetime Spent</span>
                  <div className="text-xl font-extrabold text-emerald-400 font-mono mt-1">
                    {formatCurrency(selectedCustomer.totalSpent || 0)}
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">City / Address</span>
                  <div className="text-xs font-bold text-slate-200 truncate mt-1">
                    {selectedCustomer.address || selectedCustomer.city || 'Walk-in'}
                  </div>
                </div>
              </div>

              {/* Favorite Products */}
              {favoriteProducts.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                    <Pizza className="w-4 h-4" />
                    <span>Favorite & Most Ordered Items</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {favoriteProducts.map((fav, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-950 border border-slate-800 text-xs font-medium text-slate-200 rounded-lg">
                        {fav.name} ({fav.count}x)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Previous Orders History List */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Previous Order Invoices
                </h4>

                <div className="space-y-2.5">
                  {customerOrders.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500">No previous order history</div>
                  ) : (
                    customerOrders.map((ord) => (
                      <div key={ord.id} className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <div className="font-mono font-bold text-amber-400">{ord.invoiceNo}</div>
                          <div className="text-slate-400 mt-0.5">{formatDate(ord.createdAt)} • {ord.orderType}</div>
                          <div className="text-slate-300 font-medium line-clamp-1 mt-1">
                            {ord.items?.map((i: any) => `${i.quantity}x ${i.productName}`).join(', ')}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-mono font-bold text-emerald-400 text-sm">{formatCurrency(ord.grandTotal)}</div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-1 inline-block ${
                            ord.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
