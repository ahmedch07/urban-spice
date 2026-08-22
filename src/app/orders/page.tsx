'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import ThermalReceiptModal from '@/components/POS/ThermalReceiptModal';
import OrderEditModal from '@/components/OrderEditModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { DeleteConfirmModal } from '@/components/ui/delete-confirm-modal';
import { getOrderColumns } from '@/columns';
import { toast } from '@/components/ui/sonner';
import { Receipt, Search, Filter, RefreshCw } from 'lucide-react';
import { mergeRiderOverrides } from '@/lib/rider-overrides';

import { useApp } from '@/context/AppContext';

export default function OrdersPage() {
  const { currentUser, orders: globalOrders, riders, products, refreshOrders } = useApp();
  const [orders, setOrders] = useState<any[]>(() => globalOrders || []);
  const [dateRange, setDateRange] = useState<string>('today');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Selected Order for Receipt Modal
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [deletingOrder, setDeletingOrder] = useState<any>(null);
  const [orderActionError, setOrderActionError] = useState('');
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  // Sync with global preloaded orders when available
  useEffect(() => {
    if (globalOrders && globalOrders.length > 0 && orders.length === 0) {
      setOrders(globalOrders);
    }
  }, [globalOrders, orders.length]);

  const fetchOrders = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const url = `/api/orders?range=${dateRange}&status=${statusFilter}&search=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const hasMemoryData = orders.length > 0 || (globalOrders && globalOrders.length > 0);
    const isFiltered = dateRange !== 'today' || statusFilter !== 'ALL' || searchQuery !== '';
    fetchOrders(!hasMemoryData || isFiltered);
  }, [dateRange, statusFilter, searchQuery]);

  const [statusConfirm, setStatusConfirm] = useState<{ orderId: string; newStatus: string } | null>(null);
  const [statusErrorMsg, setStatusErrorMsg] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    if (newStatus === 'CANCELLED' || newStatus === 'REFUNDED') {
      setStatusErrorMsg('');
      setStatusConfirm({ orderId, newStatus });
      return;
    }
    executeStatusUpdate(orderId, newStatus);
  };

  const executeStatusUpdate = async (orderId: string, newStatus: string) => {
    setIsUpdatingStatus(true);
    setStatusErrorMsg('');
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatusErrorMsg(data.error || 'Failed to update order status');
        toast.error(data.error || 'Failed to update order status');
        setIsUpdatingStatus(false);
        return;
      }
      toast.success(`Order status updated to ${newStatus}`);
      setStatusConfirm(null);
      fetchOrders();
      refreshOrders();
    } catch {
      toast.error('Network error updating status');
      setStatusErrorMsg('Network error updating status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleUpdateRider = async (orderId: string, riderId: string) => {
    const selectedR = riders.find((r) => r.id === riderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riderId: selectedR ? selectedR.id : null,
          riderName: selectedR ? selectedR.name : null,
          riderPhone: selectedR ? selectedR.phone : null,
        }),
      });
      if (res.ok) {
        toast.success('Rider assigned successfully');
        fetchOrders();
      } else {
        toast.error('Failed to assign rider');
      }
    } catch {
      toast.error('Network error assigning rider');
    }
  };

  const openReceipt = (order: any) => {
    setSelectedOrder(order);
    setIsReceiptOpen(true);
  };

  const handleSaveOrder = async (updates: Record<string, unknown>) => {
    if (!editingOrder) return;
    setIsSavingOrder(true);
    setOrderActionError('');
    try {
      const res = await fetch(`/api/orders/${editingOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update order');
      toast.success('Order updated successfully');
      setEditingOrder(null);
      fetchOrders();
      refreshOrders();
    } catch (error: any) {
      setOrderActionError(error.message || 'Failed to update order');
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!deletingOrder) return;
    setIsSavingOrder(true);
    setOrderActionError('');
    try {
      const res = await fetch(`/api/orders/${deletingOrder.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete order');
      toast.success('Order deleted successfully');
      setDeletingOrder(null);
      fetchOrders();
      refreshOrders();
    } catch (error: any) {
      setOrderActionError(error.message || 'Failed to delete order');
    } finally {
      setIsSavingOrder(false);
    }
  };

  const columns = useMemo(
    () =>
      getOrderColumns({
        riders,
        onUpdateRider: handleUpdateRider,
        onUpdateStatus: handleUpdateStatus,
        onOpenReceipt: openReceipt,
        onEdit: (order) => {
          setOrderActionError('');
          setEditingOrder(order);
        },
        onDelete: (order) => {
          setOrderActionError('');
          setDeletingOrder(order);
        },
        canManage: currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER',
      }),
    [riders, currentUser?.role]
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar userRole={currentUser?.role} userName={currentUser?.name} userEmail={currentUser?.email} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar title="Order History, Receipts & Status Tracking" />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
            <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <Input
                  type="text"
                  placeholder="Search invoice, customer, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
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
              <div className="w-44">
                <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="PREPARING">Preparing</SelectItem>
                    <SelectItem value="READY">Ready</SelectItem>
                    <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => fetchOrders(true)}
                title="Refresh Orders"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Orders DataTable */}
          <DataTable
            columns={columns}
            data={orders}
            isLoading={isLoading}
            loadingMessage="Loading order history..."
            emptyMessage="No orders found."
          />
        </main>
      </div>

      {/* Thermal Receipt Preview Modal */}
      {isReceiptOpen && selectedOrder && (
        <ThermalReceiptModal
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          order={selectedOrder}
        />
      )}

      <OrderEditModal
        order={editingOrder}
        riders={riders}
        products={products}
        isSaving={isSavingOrder}
        errorMsg={orderActionError}
        onClose={() => setEditingOrder(null)}
        onSave={handleSaveOrder}
      />

      {/* Order Status Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!statusConfirm}
        onClose={() => setStatusConfirm(null)}
        onConfirm={() => {
          if (statusConfirm) {
            executeStatusUpdate(statusConfirm.orderId, statusConfirm.newStatus);
          }
        }}
        isLoading={isUpdatingStatus}
        errorMsg={statusErrorMsg}
        title="Confirm Status Change?"
        description={
          statusConfirm ? (
            <>
              Are you sure you want to mark this order as <strong className="text-amber-400 font-bold">{statusConfirm.newStatus}</strong>?
            </>
          ) : undefined
        }
        confirmText={`Mark as ${statusConfirm?.newStatus || 'Updated'}`}
        variant="destructive"
      />

      <DeleteConfirmModal
        isOpen={!!deletingOrder}
        onClose={() => setDeletingOrder(null)}
        onConfirm={handleDeleteOrder}
        isLoading={isSavingOrder}
        errorMsg={orderActionError}
        title="Delete Order?"
        description={deletingOrder ? `Delete ${deletingOrder.invoiceNo}? This will remove it from sales reports as well.` : undefined}
        confirmText="Delete Order"
      />
    </div>
  );
}
