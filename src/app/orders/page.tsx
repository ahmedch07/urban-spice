'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import ThermalReceiptModal from '@/components/POS/ThermalReceiptModal';
import { Search, Filter, Printer, RefreshCw, XCircle, CheckCircle, Eye } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function OrdersPage() {
  const [currentUser, setCurrentUser] = useState<any>({ name: 'Loading...', role: '' });
  const [orders, setOrders] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<string>('today');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Selected Order for Receipt Modal
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch(console.error);
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const url = `/api/orders?range=${dateRange}&status=${statusFilter}&search=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [dateRange, statusFilter, searchQuery]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    if (
      (newStatus === 'CANCELLED' || newStatus === 'REFUNDED') &&
      !window.confirm(`Are you sure you want to mark order as ${newStatus}?`)
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchOrders();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update order status');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar userRole={currentUser?.role} userName={currentUser?.name} userEmail={currentUser?.email} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar title="Order Management & Sales Records" />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Controls Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap gap-3 items-center justify-between shadow-lg">
            <div className="flex items-center space-x-3 flex-1 min-w-[280px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search invoice #, customer name or phone..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Date Filters */}
              <div className="flex items-center space-x-1 bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
                {['today', 'yesterday', 'week', 'month'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`px-3 py-1 rounded-lg capitalize font-bold transition-all ${
                      dateRange === range
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PREPARING">Preparing</option>
                <option value="READY">Ready</option>
                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <button
                onClick={fetchOrders}
                className="p-2 bg-slate-950 border border-slate-800 hover:border-amber-500 text-slate-300 rounded-xl transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-4">Order / Invoice #</th>
                    <th className="p-4">Customer & Contact</th>
                    <th className="p-4">Type & Table</th>
                    <th className="p-4">Items Summary</th>
                    <th className="p-4">Grand Total</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Order Status</th>
                    <th className="p-4">Date / Time</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {isLoading ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500">
                        Loading order history...
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500">
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 font-mono font-bold text-amber-400">{o.invoiceNo}</td>
                        <td className="p-4">
                          <div className="font-bold text-slate-200">{o.customer?.name || 'Walk-in Customer'}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{o.customer?.phone || '-'}</div>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-slate-300">{o.orderType}</span>
                          {o.tableNo && <div className="text-[10px] text-amber-400/80 font-mono">Table: {o.tableNo}</div>}
                        </td>
                        <td className="p-4 max-w-xs">
                          <div className="text-slate-300 line-clamp-1 font-medium">
                            {o.items?.map((i: any) => `${i.quantity}x ${i.productName}`).join(', ')}
                          </div>
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-100">{formatCurrency(o.grandTotal)}</td>
                        <td className="p-4 font-semibold text-slate-300">{o.paymentMethod}</td>
                        <td className="p-4">
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                            className={`px-2 py-1 rounded text-[10px] font-extrabold uppercase border focus:outline-none bg-slate-950 ${
                              o.status === 'COMPLETED' ? 'text-emerald-400 border-emerald-500/30' :
                              o.status === 'PREPARING' ? 'text-amber-400 border-amber-500/30' :
                              o.status === 'OUT_FOR_DELIVERY' ? 'text-purple-400 border-purple-500/30' :
                              o.status === 'CANCELLED' ? 'text-red-400 border-red-500/30' :
                              'text-blue-400 border-blue-500/30'
                            }`}
                          >
                            <option value="PENDING">PENDING</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="PREPARING">PREPARING</option>
                            <option value="READY">READY</option>
                            <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                        <td className="p-4 text-slate-400 font-mono text-[11px]">{formatDate(o.createdAt)}</td>
                        <td className="p-4 text-right space-x-1.5">
                          <button
                            onClick={() => {
                              setSelectedOrder(o);
                              setIsReceiptOpen(true);
                            }}
                            title="Print Invoice"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition-colors"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {(currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER') && o.status !== 'CANCELLED' && (
                            <button
                              onClick={() => handleUpdateStatus(o.id, 'CANCELLED')}
                              title="Cancel Order"
                              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
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

      <ThermalReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        order={selectedOrder}
        onNewOrder={() => setIsReceiptOpen(false)}
      />
    </div>
  );
}
