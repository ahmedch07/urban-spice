'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { DeleteConfirmModal } from '@/components/ui/delete-confirm-modal';
import { getRiderColumns } from '@/columns';
import { toast } from '@/components/ui/sonner';
import { Truck, Plus, Search, RefreshCw, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { RiderItem } from '@/lib/types';

export default function RidersPage() {
  const { currentUser, isGlobalLoading } = useApp();
  const [riders, setRiders] = useState<RiderItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRider, setEditingRider] = useState<RiderItem | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Delete State
  const [deletingRider, setDeletingRider] = useState<RiderItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRiders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/riders?all=true');
      const data = await res.json();
      if (data.riders) setRiders(data.riders);
    } catch {
      toast.error('Failed to load delivery riders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRiders();
  }, []);

  const filteredRiders = useMemo(() => {
    return riders.filter(
      (r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.phone.includes(searchQuery) ||
        (r.vehicleNo && r.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [riders, searchQuery]);

  const handleOpenAddModal = () => {
    setEditingRider(null);
    setName('');
    setPhone('');
    setVehicleNo('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rider: RiderItem) => {
    setEditingRider(rider);
    setName(rider.name);
    setPhone(rider.phone);
    setVehicleNo(rider.vehicleNo || '');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSaveRider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setErrorMsg('Name and phone number are required');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');

    try {
      const url = '/api/riders';
      const method = editingRider ? 'PUT' : 'POST';
      const body = editingRider
        ? { id: editingRider.id, name, phone, vehicleNo }
        : { name, phone, vehicleNo };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save rider');
      }

      toast.success(editingRider ? 'Rider updated successfully!' : 'Rider registered successfully!');
      setIsModalOpen(false);
      fetchRiders();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save rider');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (rider: RiderItem) => {
    try {
      const res = await fetch('/api/riders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rider.id, active: !rider.active }),
      });

      if (!res.ok) {
        toast.error('Failed to update rider status');
        return;
      }

      toast.success(`${rider.name} marked as ${!rider.active ? 'Available' : 'Offline'}`);
      fetchRiders();
    } catch {
      toast.error('Network error updating rider');
    }
  };

  const handleDeleteRider = async () => {
    if (!deletingRider) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/riders?id=${deletingRider.id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete rider');
      }

      toast.success('Rider deleted successfully');
      setDeletingRider(null);
      fetchRiders();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete rider');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = useMemo(
    () =>
      getRiderColumns({
        onEdit: handleOpenEditModal,
        onDelete: (r) => setDeletingRider(r),
        onToggleActive: handleToggleActive,
        canManage: currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER',
      }),
    [currentUser?.role]
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar userRole={currentUser?.role} userName={currentUser?.name} userEmail={currentUser?.email} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar title="Delivery Fleet & Riders Management" />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Bar */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                <Truck className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-100">Delivery Fleet</h2>
                <p className="text-xs text-slate-400">
                  {riders.filter((r) => r.active).length} Active • {riders.length} Total Registered Riders
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
                <Input
                  type="text"
                  placeholder="Search name, phone, vehicle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-slate-950 border-slate-800 text-xs rounded-xl"
                />
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={fetchRiders}
                disabled={isLoading}
                className="rounded-xl border-slate-800 bg-slate-950 hover:bg-slate-800"
                title="Refresh Fleet"
              >
                <RefreshCw className={`w-4 h-4 text-amber-400 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>

              <Button
                onClick={handleOpenAddModal}
                className="rounded-xl font-extrabold text-xs shadow-md space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Rider</span>
              </Button>
            </div>
          </div>

          {/* Riders DataTable */}
          <DataTable
            columns={columns}
            data={filteredRiders}
            isLoading={isLoading}
            loadingMessage="Loading delivery fleet..."
            emptyMessage="No delivery riders registered yet."
          />
        </main>
      </div>

      {/* Add/Edit Rider Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-100">
                {editingRider ? 'Edit Delivery Rider' : 'Register New Rider'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-100 rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRider} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Rider Full Name *</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Muhammad Ali"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number *</label>
                <Input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0300-1234567"
                  className="font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Vehicle Registration #</label>
                <Input
                  type="text"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                  placeholder="e.g. FSD-9821 / Honda 125"
                  className="font-mono"
                />
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : editingRider ? 'Save Changes' : 'Register Rider'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Rider Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingRider}
        onClose={() => setDeletingRider(null)}
        onConfirm={handleDeleteRider}
        isLoading={isDeleting}
        title="Delete Delivery Rider?"
        description={
          deletingRider
            ? `Are you sure you want to remove ${deletingRider.name} from the active delivery fleet?`
            : undefined
        }
        confirmText="Delete Rider"
      />
    </div>
  );
}
