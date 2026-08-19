'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { DeleteConfirmModal } from '@/components/ui/delete-confirm-modal';
import { Truck, Plus, Search, Edit2, RefreshCw, X, ShieldAlert, AlertCircle } from 'lucide-react';
import { RiderItem } from '@/lib/types';
import { mergeRiderOverrides, saveRiderOverride } from '@/lib/rider-overrides';

import { getRiderColumns } from '@/columns';

const addRiderSchema = z.object({
  name: z.string().min(1, 'Rider name is required'),
  phone: z.string().min(1, 'Phone number is required').min(7, 'Please enter a valid phone number'),
  vehicleNo: z.string().optional(),
});

type AddRiderFormValues = z.infer<typeof addRiderSchema>;

const editRiderSchema = z.object({
  name: z.string().min(1, 'Rider name is required'),
  phone: z.string().min(1, 'Phone number is required').min(7, 'Please enter a valid phone number'),
  vehicleNo: z.string().optional(),
  active: z.boolean(),
});

type EditRiderFormValues = z.infer<typeof editRiderSchema>;

export default function RidersPage() {
  const [currentUser, setCurrentUser] = useState<any>({ name: 'Admin', role: 'ADMIN' });
  const [riders, setRiders] = useState<RiderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Add Rider Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Edit Rider Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingRider, setEditingRider] = useState<RiderItem | null>(null);

  // Delete Rider Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deletingRider, setDeletingRider] = useState<RiderItem | null>(null);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch(console.error);

    fetchRiders();
  }, []);

  const fetchRiders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/riders?all=true', { cache: 'no-store' });
      const data = await res.json();
      if (data.riders) {
        setRiders(mergeRiderOverrides(data.riders));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (r: RiderItem) => {
    setEditingRider(r);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (r: RiderItem) => {
    setDeletingRider(r);
    setDeleteErrorMsg('');
    setIsDeleteModalOpen(true);
  };

  const handleDeleteRider = async () => {
    if (!deletingRider) return;
    setIsDeleting(true);
    setDeleteErrorMsg('');

    try {
      const res = await fetch(`/api/riders?id=${encodeURIComponent(deletingRider.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        setDeleteErrorMsg(data.error || 'Failed to delete rider');
        setIsDeleting(false);
        return;
      }
      setIsDeleteModalOpen(false);
      setRiders((currentRiders) => currentRiders.filter((r) => r.id !== deletingRider.id));
      saveRiderOverride(deletingRider.id, { ...deletingRider, active: false });
    } catch (e) {
      setDeleteErrorMsg('Network error deleting rider');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredRiders = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return riders.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        (r.vehicleNo && r.vehicleNo.toLowerCase().includes(q))
    );
  }, [riders, searchQuery]);

  const activeRidersCount = riders.filter((r) => r.active).length;

  const columns = useMemo(
    () =>
      getRiderColumns({
        onEdit: openEditModal,
        onDelete: openDeleteModal,
      }),
    []
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar userRole={currentUser?.role} userName={currentUser?.name} userEmail={currentUser?.email} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar title="Delivery Riders Fleet Management" />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header Action Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">Delivery Fleet & Riders</h2>
                <p className="text-xs text-slate-400">
                  {riders.length} Registered Riders ({activeRidersCount} Active On-Duty)
                </p>
              </div>
            </div>

            <Button
              variant="default"
              onClick={() => setIsAddModalOpen(true)}
              className="space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Rider</span>
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rider by name, phone, or bike #..."
                className="pl-10"
              />
            </div>

            <Button
              variant="outline"
              onClick={fetchRiders}
              className="space-x-2"
              title="Refresh Fleet"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>

          {/* Riders List DataTable */}
          <DataTable
            columns={columns}
            data={filteredRiders}
            isLoading={isLoading}
            loadingMessage="Loading delivery fleet..."
            emptyMessage="No delivery riders found matching search."
          />
        </main>
      </div>

      {/* Add Rider Modal */}
      {isAddModalOpen && (
        <AddRiderModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={(newRider) => {
            setIsAddModalOpen(false);
            saveRiderOverride(newRider.id, newRider);
            setRiders((currentRiders) =>
              [...currentRiders, newRider].sort((first, second) => first.name.localeCompare(second.name))
            );
          }}
        />
      )}

      {/* Edit Rider Modal */}
      {isEditModalOpen && editingRider && (
        <EditRiderModal
          rider={editingRider}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={(updatedRider) => {
            setIsEditModalOpen(false);
            saveRiderOverride(updatedRider.id, updatedRider);
            setRiders((currentRiders) =>
              currentRiders.map((item) => (item.id === updatedRider.id ? updatedRider : item))
            );
          }}
        />
      )}

      {/* Delete Rider Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen && !!deletingRider}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteRider}
        isLoading={isDeleting}
        errorMsg={deleteErrorMsg}
        title="Delete Delivery Rider?"
        description={
          deletingRider ? (
            <>
              Are you sure you want to delete rider <strong className="text-slate-200">{deletingRider.name}</strong> ({deletingRider.phone})?
            </>
          ) : undefined
        }
        confirmText="Delete Rider"
      />
    </div>
  );
}

function AddRiderModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (rider: RiderItem) => void;
}) {
  const [addErrorMsg, setAddErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddRiderFormValues>({
    resolver: zodResolver(addRiderSchema),
    defaultValues: {
      name: '',
      phone: '',
      vehicleNo: '',
    },
  });

  const onCreate = async (values: AddRiderFormValues) => {
    setAddErrorMsg('');
    try {
      const res = await fetch('/api/riders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddErrorMsg(data.error || 'Failed to create rider');
        return;
      }
      onSuccess(data.rider);
    } catch (e) {
      setAddErrorMsg('Network error creating rider');
    }
  };

  const onInvalid = () => {
    setAddErrorMsg('Please fill in all required fields (Name and valid Phone number)');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Truck className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-slate-100">Add New Delivery Rider</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {addErrorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl font-medium flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{addErrorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onCreate, onInvalid)} className="space-y-3.5" noValidate>
          <div>
            <label className="block text-xs text-slate-300 font-semibold mb-1">Rider Name *</label>
            <Input
              type="text"
              {...register('name')}
              placeholder="e.g. Ali Raza"
              error={!!errors.name}
            />
            {errors.name && (
              <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs text-slate-300 font-semibold mb-1">Phone / Contact Number *</label>
            <Input
              type="text"
              {...register('phone')}
              placeholder="e.g. 03001234567"
              className="font-mono"
              error={!!errors.phone}
            />
            {errors.phone && (
              <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs text-slate-300 font-semibold mb-1">Vehicle / Bike Number (Optional)</label>
            <Input
              type="text"
              {...register('vehicleNo')}
              placeholder="e.g. FSD-1234"
              className="font-mono"
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
              {isSubmitting ? 'Saving...' : 'Save Rider'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditRiderModal({
  rider,
  onClose,
  onSuccess,
}: {
  rider: RiderItem;
  onClose: () => void;
  onSuccess: (rider: RiderItem) => void;
}) {
  const [editErrorMsg, setEditErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EditRiderFormValues>({
    resolver: zodResolver(editRiderSchema),
    defaultValues: {
      name: rider.name,
      phone: rider.phone,
      vehicleNo: rider.vehicleNo || '',
      active: rider.active ?? true,
    },
  });

  const active = watch('active');

  const onUpdate = async (values: EditRiderFormValues) => {
    setEditErrorMsg('');
    try {
      const res = await fetch('/api/riders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: rider.id,
          ...values,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditErrorMsg(data.error || 'Failed to update rider');
        return;
      }
      onSuccess(data.rider);
    } catch (e) {
      setEditErrorMsg('Network error updating rider');
    }
  };

  const onInvalid = () => {
    setEditErrorMsg('Please fill in all required fields correctly');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Edit2 className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-slate-100">Edit Delivery Rider Profile</h3>
          </div>
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

        <form onSubmit={handleSubmit(onUpdate, onInvalid)} className="space-y-3.5" noValidate>
          <div>
            <label className="block text-xs text-slate-300 font-semibold mb-1">Rider Name *</label>
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
            <label className="block text-xs text-slate-300 font-semibold mb-1">Phone / Contact Number *</label>
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
            <label className="block text-xs text-slate-300 font-semibold mb-1">Vehicle / Bike Number</label>
            <Input
              type="text"
              {...register('vehicleNo')}
              className="font-mono"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <div>
              <div className="text-xs font-bold text-slate-200">Active Status</div>
              <div className="text-[10px] text-slate-400">Allow assigning this rider to delivery orders</div>
            </div>
            <button
              type="button"
              onClick={() => setValue('active', !active)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                active
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-red-500/20 text-red-400 border-red-500/40'
              }`}
            >
              {active ? 'Active' : 'Inactive'}
            </button>
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
