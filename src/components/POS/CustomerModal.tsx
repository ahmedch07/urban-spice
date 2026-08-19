'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus, Phone, Mail, MapPin, Check, User } from 'lucide-react';
import { CustomerItem } from '@/lib/types';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: CustomerItem) => void;
}

export default function CustomerModal({
  isOpen,
  onClose,
  onSelectCustomer,
}: CustomerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // New Customer Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Lahore');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  const fetchCustomers = async (q: string = '') => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/pos/customers?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.customers) {
        setCustomers(data.customers);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCustomers(searchQuery);
    }
  }, [isOpen, searchQuery]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!name || !phone) {
      setFormError('Customer name and phone number are required');
      return;
    }

    try {
      const res = await fetch('/api/pos/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, whatsapp, email, address, city, notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to create customer');
        return;
      }
      onSelectCustomer(data.customer);
      onClose();
    } catch (error) {
      setFormError('Network error creating customer');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-slate-100">
              {showCreateForm ? 'Create New Customer' : 'Select Customer'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!showCreateForm ? (
          <div className="flex-1 flex flex-col overflow-hidden p-4 space-y-4">
            {/* Search + Add New Button */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, phone, or email..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                onClick={() => setShowCreateForm(true)}
                className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center space-x-1 shrink-0 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>New</span>
              </button>
            </div>

            {/* Customers list */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {isLoading ? (
                <div className="py-8 text-center text-xs text-slate-500">Loading customers...</div>
              ) : customers.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">No customers found</div>
              ) : (
                customers.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      onSelectCustomer(c);
                      onClose();
                    }}
                    className="p-3 bg-slate-950 border border-slate-800/80 hover:border-amber-500/50 rounded-xl cursor-pointer flex items-center justify-between group transition-all"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-100 group-hover:text-amber-400">
                        {c.name}
                      </h4>
                      <div className="flex items-center space-x-3 text-xs text-slate-400 mt-0.5">
                        <span className="flex items-center space-x-1 font-mono">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{c.phone}</span>
                        </span>
                        {c.address && (
                          <span className="flex items-center space-x-1 truncate max-w-[200px]">
                            <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                            <span className="truncate">{c.address}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <button className="px-3 py-1 bg-amber-500/10 text-amber-400 font-bold text-xs rounded-lg group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                      Select
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Create Customer Form */
          <form onSubmit={handleCreateCustomer} className="flex-1 overflow-y-auto p-5 space-y-4">
            {formError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl font-medium">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Usama Khan"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Number *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 03001234567"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Delivery Address</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full street address, house #, block..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                Back to Search
              </button>

              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors"
              >
                Save & Select
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
