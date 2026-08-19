'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { Truck, Plus, Search, Edit2, Trash2, Phone, CheckCircle, XCircle, RefreshCw, X, ShieldAlert } from 'lucide-react';
import { RiderItem } from '@/lib/types';

const RIDER_OVERRIDES_KEY = 'urban-spice-rider-overrides';

export default function RidersPage() {
  const [currentUser, setCurrentUser] = useState<any>({ name: 'Admin', role: 'ADMIN' });
  const [riders, setRiders] = useState<RiderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Add Rider Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [vehicleNo, setVehicleNo] = useState<string>('');
  const [addErrorMsg, setAddErrorMsg] = useState<string>('');

  // Edit Rider Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingRider, setEditingRider] = useState<RiderItem | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editVehicleNo, setEditVehicleNo] = useState<string>('');
  const [editActive, setEditActive] = useState<boolean>(true);
  const [editErrorMsg, setEditErrorMsg] = useState<string>('');

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
        const savedOverrides = JSON.parse(localStorage.getItem(RIDER_OVERRIDES_KEY) || '{}') as Record<string, RiderItem | null>;
        const serverRiders = data.riders.filter((rider: RiderItem) => !(rider.id in savedOverrides));
        const overriddenRiders = Object.values(savedOverrides).filter((rider): rider is RiderItem => rider !== null);
        setRiders(
          [...serverRiders, ...overriddenRiders].sort((first, second) => first.name.localeCompare(second.name))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveRiderOverride = (id: string, rider: RiderItem | null) => {
    const savedOverrides = JSON.parse(localStorage.getItem(RIDER_OVERRIDES_KEY) || '{}') as Record<string, RiderItem | null>;
    savedOverrides[id] = rider;
    localStorage.setItem(RIDER_OVERRIDES_KEY, JSON.stringify(savedOverrides));
  };

  const handleCreateRider = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddErrorMsg('');
    if (!name || !phone) {
      setAddErrorMsg('Rider name and contact phone number are required');
      return;
    }

    try {
      const res = await fetch('/api/riders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, vehicleNo }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddErrorMsg(data.error || 'Failed to create rider');
        return;
      }
      setIsAddModalOpen(false);
      setName('');
      setPhone('');
      setVehicleNo('');
      saveRiderOverride(data.rider.id, data.rider);
      setRiders((currentRiders) =>
        [...currentRiders, data.rider].sort((first, second) => first.name.localeCompare(second.name))
      );
    } catch (e) {
      setAddErrorMsg('Network error creating rider');
    }
  };

  const openEditModal = (r: RiderItem) => {
    setEditingRider(r);
    setEditName(r.name);
    setEditPhone(r.phone);
    setEditVehicleNo(r.vehicleNo || '');
    setEditActive(r.active ?? true);
    setEditErrorMsg('');
    setIsEditModalOpen(true);
  };

  const handleUpdateRider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRider) return;
    setEditErrorMsg('');

    try {
      const res = await fetch('/api/riders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingRider.id,
          name: editName,
          phone: editPhone,
          vehicleNo: editVehicleNo,
          active: editActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditErrorMsg(data.error || 'Failed to update rider');
        return;
      }
      setIsEditModalOpen(false);
      saveRiderOverride(data.rider.id, data.rider);
      setRiders((currentRiders) =>
        currentRiders
          .map((rider) => (rider.id === data.rider.id ? data.rider : rider))
          .sort((first, second) => first.name.localeCompare(second.name))
      );
    } catch (e) {
      setEditErrorMsg('Network error updating rider');
    }
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
      const res = await fetch(`/api/riders?id=${deletingRider.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        setDeleteErrorMsg(data.error || 'Failed to delete rider');
        setIsDeleting(false);
        return;
      }
      setIsDeleteModalOpen(false);
      setIsDeleting(false);
      saveRiderOverride(deletingRider.id, null);
      setRiders((currentRiders) => currentRiders.filter((rider) => rider.id !== deletingRider.id));
    } catch (e) {
      setDeleteErrorMsg('Network error deleting rider');
      setIsDeleting(false);
    }
  };

  const filteredRiders = riders.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phone.includes(searchQuery) ||
      (r.vehicleNo && r.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar userRole={currentUser?.role} userName={currentUser?.name} userEmail={currentUser?.email} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar title="Delivery Rider Management" />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header Controls Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap gap-3 items-center justify-between shadow-lg">
            <div className="flex items-center space-x-3 flex-1 min-w-[280px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by rider name, phone, or vehicle number..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                onClick={fetchRiders}
                className="p-2 bg-slate-950 border border-slate-800 hover:border-amber-500 text-slate-300 rounded-xl transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {(currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER') && (
              <button
                onClick={() => {
                  setName('');
                  setPhone('');
                  setVehicleNo('');
                  setAddErrorMsg('');
                  setIsAddModalOpen(true);
                }}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Delivery Rider</span>
              </button>
            )}
          </div>

          {/* Riders Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-4">Rider Details</th>
                    <th className="p-4">Contact Phone</th>
                    <th className="p-4">Vehicle Number</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500">
                        Loading delivery riders...
                      </td>
                    </tr>
                  ) : filteredRiders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500">
                        No delivery riders found
                      </td>
                    </tr>
                  ) : (
                    filteredRiders.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold shrink-0">
                              <Truck className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-100 text-sm">{r.name}</div>
                              <div className="text-[10px] text-slate-500">Delivery Staff</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-slate-300 font-semibold">
                          <div className="flex items-center space-x-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            <span>{r.phone}</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-slate-300 font-semibold">
                          {r.vehicleNo ? (
                            <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded font-bold text-slate-200">
                              {r.vehicleNo}
                            </span>
                          ) : (
                            <span className="text-slate-500 italic">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase inline-flex items-center space-x-1 ${
                              r.active
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {r.active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            <span>{r.active ? 'Active' : 'Inactive'}</span>
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => openEditModal(r)}
                            title="Edit Rider Details"
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {currentUser?.role === 'ADMIN' && (
                            <button
                              onClick={() => openDeleteModal(r)}
                              title="Delete Rider"
                              className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
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

      {/* Add Rider Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-slate-100">Add New Delivery Rider</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            {addErrorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl font-medium">
                {addErrorMsg}
              </div>
            )}

            <form onSubmit={handleCreateRider} className="space-y-3.5">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Rider Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ali Raza"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Phone / Contact Number *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 03001234567"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Vehicle / Bike Number (Optional)</label>
                <input
                  type="text"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                  placeholder="e.g. FSD-1234"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition"
                >
                  Save Rider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Rider Modal */}
      {isEditModalOpen && editingRider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Edit2 className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-slate-100">Edit Delivery Rider Profile</h3>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            {editErrorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl font-medium">
                {editErrorMsg}
              </div>
            )}

            <form onSubmit={handleUpdateRider} className="space-y-3.5">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Rider Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Phone / Contact Number *</label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Vehicle / Bike Number</label>
                <input
                  type="text"
                  value={editVehicleNo}
                  onChange={(e) => setEditVehicleNo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <div>
                  <div className="text-xs font-bold text-slate-200">Active Status</div>
                  <div className="text-[10px] text-slate-400">Allow assigning this rider to delivery orders</div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditActive(!editActive)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                    editActive
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-red-500/20 text-red-400 border-red-500/40'
                  }`}
                >
                  {editActive ? 'Active' : 'Inactive'}
                </button>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Rider Confirmation Modal */}
      {isDeleteModalOpen && deletingRider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Delete Delivery Rider?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to delete rider <strong className="text-slate-200">{deletingRider.name}</strong> ({deletingRider.phone})?
            </p>

            {deleteErrorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl">
                {deleteErrorMsg}
              </div>
            )}

            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteRider}
                className="px-5 py-2 bg-red-500 hover:bg-red-400 text-white font-bold text-xs rounded-xl transition disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Rider'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
