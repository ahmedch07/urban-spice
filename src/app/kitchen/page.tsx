'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { toast } from '@/components/ui/sonner';
import {
  Clock,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Flame,
  Layers,
} from 'lucide-react';
import { formatShortTime } from '@/lib/utils';

import { useApp } from '@/context/AppContext';

export default function KitchenPage() {
  const { currentUser, orders: globalOrders } = useApp();
  const [orders, setOrders] = useState<any[]>(() => globalOrders || []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'all' | 'pending' | 'preparing' | 'ready'>('all');

  useEffect(() => {
    if (globalOrders && globalOrders.length > 0 && orders.length === 0) {
      setOrders(globalOrders);
    }
  }, [globalOrders, orders.length]);

  const fetchKitchenOrders = async () => {
    try {
      const res = await fetch('/api/orders?range=today&limit=50');
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch {
      // silent background sync
    }
  };

  useEffect(() => {
    fetchKitchenOrders();
    const interval = setInterval(fetchKitchenOrders, 10000); // auto refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(`Order status updated to ${status}`);
        fetchKitchenOrders();
      } else {
        toast.error('Failed to update kitchen order status');
      }
    } catch {
      toast.error('Network error updating order status');
    }
  };

  const pendingOrders = orders.filter((o) => o.status === 'PENDING');
  const preparingOrders = orders.filter((o) => o.status === 'PREPARING');
  const readyOrders = orders.filter((o) => o.status === 'READY');

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar userRole={currentUser?.role} userName={currentUser?.name} userEmail={currentUser?.email} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar title="Kitchen Display System (KDS)" />

        <main className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
          {/* Top Bar Header */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-100">Live Kitchen Queue</h2>
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 font-extrabold text-[11px] rounded-full border border-amber-500/30">
                    {pendingOrders.length + preparingOrders.length} Active
                  </span>
                </div>
                <p className="text-xs text-slate-400">Real-time live order production line</p>
              </div>
            </div>

            <button
              onClick={fetchKitchenOrders}
              disabled={isLoading}
              className="px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition-all shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Refreshing...' : 'Refresh Orders'}</span>
            </button>
          </div>

          {/* Mobile / Tablet Tab Selector */}
          <div className="lg:hidden flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
            <button
              onClick={() => setMobileTab('all')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center space-x-1.5 ${
                mobileTab === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All ({orders.length})</span>
            </button>
            <button
              onClick={() => setMobileTab('pending')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center space-x-1.5 ${
                mobileTab === 'pending'
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Pending ({pendingOrders.length})</span>
            </button>
            <button
              onClick={() => setMobileTab('preparing')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center space-x-1.5 ${
                mobileTab === 'preparing'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Cooking ({preparingOrders.length})</span>
            </button>
            <button
              onClick={() => setMobileTab('ready')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center space-x-1.5 ${
                mobileTab === 'ready'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ready ({readyOrders.length})</span>
            </button>
          </div>

          {/* Kanban Production Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 min-h-[500px] lg:h-[calc(100vh-200px)]">
            {/* Column 1: Pending */}
            <div
              className={`bg-slate-900/70 border border-slate-800/80 rounded-2xl flex flex-col h-full overflow-hidden shadow-lg ${
                mobileTab !== 'all' && mobileTab !== 'pending' ? 'hidden lg:flex' : 'flex'
              }`}
            >
              <div className="p-3.5 sm:p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-sm text-blue-400 flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Pending New Orders</span>
                </h3>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full font-mono text-xs font-bold border border-blue-500/30">
                  {pendingOrders.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5">
                {pendingOrders.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-500">No pending orders in queue</div>
                ) : (
                  pendingOrders.map((order) => (
                    <div key={order.id} className="bg-slate-950 border border-blue-500/30 rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-md hover:border-blue-500/60 transition-all">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <div>
                          <span className="text-sm sm:text-base font-extrabold font-mono text-amber-400">{order.invoiceNo}</span>
                          <div className="text-xs text-slate-400 font-medium">{order.orderType} {order.tableNo && `• Table ${order.tableNo}`}</div>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                          {formatShortTime(order.createdAt)}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {order.items?.map((item: any) => (
                          <div key={item.id} className="text-xs bg-slate-900/50 p-2 rounded-xl border border-slate-800/60">
                            <div className="font-bold text-slate-100 flex justify-between">
                              <span>{item.quantity}× {item.productName}</span>
                            </div>
                            {item.toppings && item.toppings.length > 0 && (
                              <div className="text-[11px] text-amber-400/90 pl-2 mt-0.5">
                                + {item.toppings.map((t: any) => t.toppingName).join(', ')}
                              </div>
                            )}
                            {item.specialInstructions && (
                              <div className="text-[11px] text-red-400 italic pl-2 font-semibold mt-0.5">
                                &quot;{item.specialInstructions}&quot;
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center space-x-1.5 transition-all"
                      >
                        <span>Start Preparing</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column 2: Preparing */}
            <div
              className={`bg-slate-900/70 border border-slate-800/80 rounded-2xl flex flex-col h-full overflow-hidden shadow-lg ${
                mobileTab !== 'all' && mobileTab !== 'preparing' ? 'hidden lg:flex' : 'flex'
              }`}
            >
              <div className="p-3.5 sm:p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-sm text-amber-400 flex items-center space-x-2">
                  <Flame className="w-4 h-4" />
                  <span>Cooking / In Oven</span>
                </h3>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full font-mono text-xs font-bold border border-amber-500/30">
                  {preparingOrders.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5">
                {preparingOrders.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-500">No orders being prepared</div>
                ) : (
                  preparingOrders.map((order) => (
                    <div key={order.id} className="bg-slate-950 border border-amber-500/40 rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-md hover:border-amber-500/70 transition-all">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <div>
                          <span className="text-sm sm:text-base font-extrabold font-mono text-amber-400">{order.invoiceNo}</span>
                          <div className="text-xs text-slate-400 font-medium">{order.orderType} {order.tableNo && `• Table ${order.tableNo}`}</div>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                          {formatShortTime(order.createdAt)}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {order.items?.map((item: any) => (
                          <div key={item.id} className="text-xs bg-slate-900/50 p-2 rounded-xl border border-slate-800/60">
                            <div className="font-bold text-slate-100 flex justify-between">
                              <span>{item.quantity}× {item.productName}</span>
                            </div>
                            {item.toppings && item.toppings.length > 0 && (
                              <div className="text-[11px] text-amber-400/90 pl-2 mt-0.5">
                                + {item.toppings.map((t: any) => t.toppingName).join(', ')}
                              </div>
                            )}
                            {item.specialInstructions && (
                              <div className="text-[11px] text-red-400 italic pl-2 font-semibold mt-0.5">
                                &quot;{item.specialInstructions}&quot;
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => handleUpdateStatus(order.id, 'READY')}
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center space-x-1.5 transition-all"
                      >
                        <span>Mark Ready for Pickup</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column 3: Ready */}
            <div
              className={`bg-slate-900/70 border border-slate-800/80 rounded-2xl flex flex-col h-full overflow-hidden shadow-lg ${
                mobileTab !== 'all' && mobileTab !== 'ready' ? 'hidden lg:flex' : 'flex'
              }`}
            >
              <div className="p-3.5 sm:p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-sm text-emerald-400 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ready for Dispatch</span>
                </h3>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full font-mono text-xs font-bold border border-emerald-500/30">
                  {readyOrders.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5">
                {readyOrders.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-500">No ready orders</div>
                ) : (
                  readyOrders.map((order) => (
                    <div key={order.id} className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-md hover:border-emerald-500/70 transition-all">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <div>
                          <span className="text-sm sm:text-base font-extrabold font-mono text-emerald-400">{order.invoiceNo}</span>
                          <div className="text-xs text-slate-400 font-medium">{order.orderType}</div>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                          {formatShortTime(order.createdAt)}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-300">
                        {order.items?.map((item: any) => (
                          <div key={item.id} className="font-semibold bg-slate-900/50 p-2 rounded-xl border border-slate-800/60">
                            {item.quantity}× {item.productName}
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center space-x-1.5 transition-all"
                      >
                        <span>Complete & Dispatch</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
