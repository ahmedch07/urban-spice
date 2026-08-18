'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { UtensilsCrossed, Clock, CheckCircle2, ChevronRight, RefreshCw, Flame } from 'lucide-react';
import { formatShortTime } from '@/lib/utils';

export default function KitchenPage() {
  const [currentUser, setCurrentUser] = useState<any>({ name: 'Kitchen Staff', role: 'CASHIER' });
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch(console.error);
  }, []);

  const fetchKitchenOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/orders?range=today&limit=50');
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
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
        fetchKitchenOrders();
      }
    } catch (e) {
      console.error(e);
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

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Flame className="w-6 h-6 text-amber-500" />
              <h2 className="text-lg font-extrabold text-slate-100">Live Kitchen Orders</h2>
              <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-400 font-bold text-xs rounded-full">
                {pendingOrders.length + preparingOrders.length} Active
              </span>
            </div>

            <button
              onClick={fetchKitchenOrders}
              className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-amber-500 text-slate-200 text-xs font-bold rounded-xl flex items-center space-x-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Orders</span>
            </button>
          </div>

          {/* Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
            {/* Column 1: Pending */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl flex flex-col h-full overflow-hidden">
              <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
                <h3 className="font-bold text-sm text-blue-400 flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Pending ({pendingOrders.length})</span>
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {pendingOrders.map((order) => (
                  <div key={order.id} className="bg-slate-950 border border-blue-500/30 rounded-2xl p-4 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                      <div>
                        <span className="text-base font-extrabold font-mono text-amber-400">{order.invoiceNo}</span>
                        <div className="text-xs text-slate-400">{order.orderType} {order.tableNo && `(${order.tableNo})`}</div>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-400">{formatShortTime(order.createdAt)}</span>
                    </div>

                    <div className="space-y-2">
                      {order.items?.map((item: any) => (
                        <div key={item.id} className="text-xs">
                          <div className="font-bold text-slate-100 flex justify-between">
                            <span>{item.quantity}× {item.productName}</span>
                          </div>
                          {item.toppings && item.toppings.length > 0 && (
                            <div className="text-[11px] text-amber-400/90 pl-3">
                              + {item.toppings.map((t: any) => t.toppingName).join(', ')}
                            </div>
                          )}
                          {item.specialInstructions && (
                            <div className="text-[11px] text-red-400 italic pl-3 font-semibold">
                              "{item.specialInstructions}"
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <span>Start Preparing</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Preparing */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl flex flex-col h-full overflow-hidden">
              <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
                <h3 className="font-bold text-sm text-amber-400 flex items-center space-x-2">
                  <Flame className="w-4 h-4" />
                  <span>Preparing ({preparingOrders.length})</span>
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {preparingOrders.map((order) => (
                  <div key={order.id} className="bg-slate-950 border border-amber-500/40 rounded-2xl p-4 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                      <div>
                        <span className="text-base font-extrabold font-mono text-amber-400">{order.invoiceNo}</span>
                        <div className="text-xs text-slate-400">{order.orderType} {order.tableNo && `(${order.tableNo})`}</div>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-400">{formatShortTime(order.createdAt)}</span>
                    </div>

                    <div className="space-y-2">
                      {order.items?.map((item: any) => (
                        <div key={item.id} className="text-xs">
                          <div className="font-bold text-slate-100 flex justify-between">
                            <span>{item.quantity}× {item.productName}</span>
                          </div>
                          {item.toppings && item.toppings.length > 0 && (
                            <div className="text-[11px] text-amber-400/90 pl-3">
                              + {item.toppings.map((t: any) => t.toppingName).join(', ')}
                            </div>
                          )}
                          {item.specialInstructions && (
                            <div className="text-[11px] text-red-400 italic pl-3 font-semibold">
                              "{item.specialInstructions}"
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handleUpdateStatus(order.id, 'READY')}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <span>Mark Ready for Pickup</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Ready */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl flex flex-col h-full overflow-hidden">
              <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
                <h3 className="font-bold text-sm text-emerald-400 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ready ({readyOrders.length})</span>
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {readyOrders.map((order) => (
                  <div key={order.id} className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-4 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                      <div>
                        <span className="text-base font-extrabold font-mono text-emerald-400">{order.invoiceNo}</span>
                        <div className="text-xs text-slate-400">{order.orderType}</div>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-400">{formatShortTime(order.createdAt)}</span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-300">
                      {order.items?.map((item: any) => (
                        <div key={item.id} className="font-semibold">
                          {item.quantity}× {item.productName}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <span>Complete Order</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
