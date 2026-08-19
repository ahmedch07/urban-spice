'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DataTable } from '@/components/ui/data-table';
import { DeleteConfirmModal } from '@/components/ui/delete-confirm-modal';
import { getCustomerColumns } from '@/columns';
import { Users, Search, X, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

const editCustomerSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  phone: z.string().min(1, 'Phone number is required').min(7, 'Please enter a valid phone number'),
  whatsapp: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().optional(),
});

type EditCustomerFormValues = z.infer<typeof editCustomerSchema>;

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

  // Edit Customer Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);

  // Delete Customer Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState<any>(null);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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

        const favMap: { [key: string]: { name: string; count: number } } = {};
        data.orders.forEach((o: any) => {
          o.items?.forEach((item: any) => {
            const name = item.productName;
            if (!favMap[name]) favMap[name] = { name, count: 0 };
            favMap[name].count += item.quantity;
          });
        });

        const favList = Object.values(favMap).sort((a, b) => b.count - a.count).slice(0, 5);
        setFavoriteProducts(favList);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openEditModal = (c: any) => {
    setEditingCustomer(c);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (c: any) => {
    setDeletingCustomer(c);
    setDeleteErrorMsg('');
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCustomer = async () => {
    if (!deletingCustomer) return;
    setIsDeleting(true);
    setDeleteErrorMsg('');
    try {
      const res = await fetch(`/api/pos/customers?id=${deletingCustomer.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        setDeleteErrorMsg(data.error || 'Failed to delete customer');
        setIsDeleting(false);
        return;
      }
      setIsDeleteModalOpen(false);
      fetchCustomers();
    } catch (e) {
      setDeleteErrorMsg('Network error deleting customer');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = useMemo(
    () =>
      getCustomerColumns({
        onOpenProfile: handleOpenProfile,
        onEdit: openEditModal,
        onDelete: openDeleteModal,
      }),
    []
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar userRole={currentUser?.role} userName={currentUser?.name} userEmail={currentUser?.email} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar title="Customer Relationship & Order Intelligence Management" />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-slate-100 text-base">Registered Store Customers</h3>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <Input
                type="text"
                placeholder="Search by name, phone or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <DataTable
            columns={columns}
            data={customers}
            isLoading={isLoading}
            loadingMessage="Loading customers..."
            emptyMessage="No customer records found"
          />
        </main>
      </div>

      {/* View Customer Profile Modal */}
      {isProfileOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center">
                  {selectedCustomer.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">{selectedCustomer.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">{selectedCustomer.phone}</p>
                </div>
              </div>
              <button onClick={() => setIsProfileOpen(false)} className="p-1 text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Quick Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Orders</span>
                  <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                    {selectedCustomer.totalOrders || 0}
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Spent</span>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                    {formatCurrency(selectedCustomer.totalSpent || 0)}
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Avg Order Value</span>
                  <div className="text-xl font-bold font-mono text-blue-400 mt-1">
                    {formatCurrency(
                      selectedCustomer.totalOrders > 0
                        ? (selectedCustomer.totalSpent || 0) / selectedCustomer.totalOrders
                        : 0
                    )}
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Address:</span>
                  <span className="text-slate-200 font-medium text-right">{selectedCustomer.address || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">WhatsApp:</span>
                  <span className="text-slate-200 font-mono">{selectedCustomer.whatsapp || selectedCustomer.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="text-slate-200">{selectedCustomer.email || 'None'}</span>
                </div>
              </div>

              {/* Favorite Items */}
              {favoriteProducts.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider mb-2">Most Ordered Items</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {favoriteProducts.map((fav, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800/80">
                        <span className="text-xs font-semibold text-slate-200">{fav.name}</span>
                        <span className="text-xs font-mono font-bold text-amber-400">{fav.count}x</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order History */}
              <div>
                <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider mb-2">Order History</h4>
                <div className="space-y-2">
                  {customerOrders.length === 0 ? (
                    <div className="text-xs text-slate-500 text-center py-4">No order history available</div>
                  ) : (
                    customerOrders.map((ord) => (
                      <div key={ord.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
                        <div>
                          <div className="font-mono font-bold text-xs text-amber-400">{ord.invoiceNo}</div>
                          <div className="text-[10px] text-slate-400">{formatDate(ord.createdAt)} • {ord.orderType}</div>
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

      {/* Edit Customer Modal */}
      {isEditModalOpen && editingCustomer && (
        <EditCustomerModal
          customer={editingCustomer}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            setIsEditModalOpen(false);
            fetchCustomers();
          }}
        />
      )}

      {/* Delete Customer Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen && !!deletingCustomer}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteCustomer}
        isLoading={isDeleting}
        errorMsg={deleteErrorMsg}
        title="Delete Customer Profile?"
        description={
          deletingCustomer ? (
            <>
              Are you sure you want to delete customer <strong className="text-slate-200">{deletingCustomer.name}</strong> ({deletingCustomer.phone})?
            </>
          ) : undefined
        }
        confirmText="Delete Profile"
      />
    </div>
  );
}

function EditCustomerModal({
  customer,
  onClose,
  onSuccess,
}: {
  customer: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [editErrorMsg, setEditErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditCustomerFormValues>({
    resolver: zodResolver(editCustomerSchema),
    defaultValues: {
      name: customer.name || '',
      phone: customer.phone || '',
      whatsapp: customer.whatsapp || '',
      email: customer.email || '',
      address: customer.address || '',
      city: customer.city || 'Lahore',
      notes: customer.notes || '',
    },
  });

  const onUpdate = async (values: EditCustomerFormValues) => {
    setEditErrorMsg('');
    try {
      const res = await fetch('/api/pos/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: customer.id,
          ...values,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditErrorMsg(data.error || 'Failed to update customer');
        return;
      }
      onSuccess();
    } catch (e) {
      setEditErrorMsg('Network error updating customer');
    }
  };

  const onInvalid = () => {
    setEditErrorMsg('Please fill in all required fields properly');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100">Edit Customer Profile</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {editErrorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl font-medium flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{editErrorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onUpdate, onInvalid)} className="space-y-3" noValidate>
          <div>
            <label className="block text-xs text-slate-300 font-semibold mb-1">Customer Name *</label>
            <Input
              type="text"
              {...register('name')}
              error={!!errors.name}
            />
            {errors.name && (
              <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs text-slate-300 font-semibold mb-1">Contact Number *</label>
            <Input
              type="text"
              {...register('phone')}
              className="font-mono"
              error={!!errors.phone}
            />
            {errors.phone && (
              <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs text-slate-300 font-semibold mb-1">Delivery Address</label>
            <Textarea
              rows={2}
              {...register('address')}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
