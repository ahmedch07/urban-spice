'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ImageUploadInput from '@/components/ImageUploadInput';
import { toast } from '@/components/ui/sonner';
import { useApp } from '@/context/AppContext';
import {
  Store,
  CheckCircle2,
  AlertCircle,
  Save,
  Armchair,
  Plus,
  Trash2,
} from 'lucide-react';

const storeSettingsSchema = z.object({
  storeName: z.string().min(1, 'Shop name is required'),
  storeLogo: z.string().optional().default(''),
  storeAddress: z.string().min(1, 'Address is required'),
  storePhone: z.string().min(1, 'Phone number is required'),
  whatsappNumber: z.string().optional().default(''),
  storeEmail: z.string().optional().default(''),
  currency: z.string().min(1, 'Currency symbol is required'),
  taxRate: z.string().default('0'),
  taxEnabled: z.string().default('false'),
  invoicePrefix: z.string().min(1, 'Invoice prefix is required'),
  invoiceFooter: z.string().min(1, 'Receipt footer text is required'),
  openingTime: z.string().default('11:00 AM'),
  closingTime: z.string().default('02:00 AM'),
  socialMedia: z.string().optional().default(''),
  receiptSize: z.string().default('80mm'),
});

type StoreSettingsFormValues = z.infer<typeof storeSettingsSchema>;

export default function SettingsPage() {
  const router = useRouter();
  const { currentUser, storeSettings, refreshSettings, tables, refreshTables, isGlobalLoading } = useApp();
  const [savedMsg, setSavedMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Table add form state
  const [newTableName, setNewTableName] = useState('');
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState('4');
  const [isAddingTable, setIsAddingTable] = useState(false);

  useEffect(() => {
    if (!isGlobalLoading && currentUser && currentUser.role !== 'ADMIN') {
      toast.error('Access Denied: Admin privileges required to access Store Settings');
      router.replace('/pos');
    }
  }, [currentUser, isGlobalLoading, router]);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<StoreSettingsFormValues>({
    resolver: zodResolver(storeSettingsSchema) as any,
    defaultValues: {
      storeName: storeSettings.storeName || 'Urban Spice',
      storeLogo: storeSettings.storeLogo || '/logo.png',
      storeAddress: storeSettings.storeAddress || '180 F, Near Klash Park, Millat Town, Faisalabad',
      storePhone: storeSettings.storePhone || '0300-5225898',
      whatsappNumber: storeSettings.whatsappNumber || '0300-5225898',
      storeEmail: storeSettings.storeEmail || 'orders@urbanspice.com',
      currency: storeSettings.currency || 'Rs.',
      taxRate: storeSettings.taxRate || '0',
      taxEnabled: (storeSettings.taxEnabled as 'true' | 'false') || 'false',
      invoicePrefix: storeSettings.invoicePrefix || 'INV',
      invoiceFooter: storeSettings.invoiceFooter || 'Thank you for ordering from Urban Spice!',
      openingTime: storeSettings.openingTime || '11:00 AM',
      closingTime: storeSettings.closingTime || '02:00 AM',
      socialMedia: storeSettings.socialMedia || '@urbanspicefaisalabad',
      receiptSize: (storeSettings.receiptSize as '80mm' | '58mm') || '80mm',
    },
  });

  useEffect(() => {
    if (storeSettings) {
      setValue('storeName', storeSettings.storeName || 'Urban Spice');
      setValue('storeLogo', storeSettings.storeLogo || '/logo.png');
      setValue('storeAddress', storeSettings.storeAddress || '');
      setValue('storePhone', storeSettings.storePhone || '');
      setValue('whatsappNumber', storeSettings.whatsappNumber || '');
      setValue('storeEmail', storeSettings.storeEmail || '');
      setValue('currency', storeSettings.currency || 'Rs.');
      setValue('taxRate', storeSettings.taxRate || '0');
      setValue('taxEnabled', (storeSettings.taxEnabled as 'true' | 'false') || 'false');
      setValue('invoicePrefix', storeSettings.invoicePrefix || 'INV');
      setValue('invoiceFooter', storeSettings.invoiceFooter || '');
      setValue('openingTime', storeSettings.openingTime || '11:00 AM');
      setValue('closingTime', storeSettings.closingTime || '02:00 AM');
      setValue('socialMedia', storeSettings.socialMedia || '');
      setValue('receiptSize', (storeSettings.receiptSize as '80mm' | '58mm') || '80mm');
    }
  }, [storeSettings, setValue]);

  const onSave = async (data: StoreSettingsFormValues) => {
    setErrorMsg('');
    try {
      localStorage.setItem('urban_spice_store_settings', JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('store-settings-updated', { detail: data }));

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: data }),
      });

      if (!res.ok) {
        const err = await res.json();
        setErrorMsg(err.error || 'Failed to save store settings to server.');
        toast.error(err.error || 'Failed to save store settings to server.');
        return;
      }

      setSavedMsg(true);
      await refreshSettings();
      toast.success('Store settings saved successfully!');
      setTimeout(() => setSavedMsg(false), 4000);
    } catch {
      setSavedMsg(true);
      toast.success('Store settings saved to local device!');
      setTimeout(() => setSavedMsg(false), 4000);
    }
  };

  const onInvalid = () => {
    toast.error('Please check the form for errors and required fields');
    setErrorMsg('Please check the form for errors and required fields');
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName || !newTableNumber) {
      toast.error('Table Name and Number are required');
      return;
    }
    setIsAddingTable(true);
    try {
      const res = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTableName,
          number: parseInt(newTableNumber, 10),
          capacity: parseInt(newTableCapacity, 10) || 4,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to add table');
        return;
      }
      toast.success(`Table ${newTableName} created!`);
      setNewTableName('');
      setNewTableNumber('');
      await refreshTables();
    } catch {
      toast.error('Network error adding table');
    } finally {
      setIsAddingTable(false);
    }
  };

  const handleDeleteTable = async (tableId: string, tableName: string) => {
    if (!confirm(`Are you sure you want to remove ${tableName}?`)) return;
    try {
      const res = await fetch(`/api/tables/${tableId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to delete table');
        return;
      }
      toast.success(`${tableName} deleted`);
      await refreshTables();
    } catch {
      toast.error('Failed to delete table');
    }
  };

  const handleTableStatusChange = async (tableId: string, status: 'AVAILABLE' | 'RESERVED') => {
    try {
      const res = await fetch(`/api/tables/${tableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to update table status');
        return;
      }
      toast.success(`Table marked ${status === 'RESERVED' ? 'Reserved' : 'Available'}`);
      await refreshTables();
    } catch {
      toast.error('Failed to update table status');
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar userRole={currentUser?.role} userName={currentUser?.name} userEmail={currentUser?.email} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar title="Shop Settings & Dine-In Table Management" />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Store Settings Form */}
          <form onSubmit={handleSubmit(onSave, onInvalid)} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl" noValidate>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-bold text-base text-slate-100 flex items-center space-x-2">
                <Store className="w-5 h-5 text-amber-400" />
                <span>Shop Branding, Contact & Parameters</span>
              </h3>

              {savedMsg && (
                <span className="text-xs text-emerald-400 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Settings Saved Successfully!</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Shop Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Shop Name *</label>
                <Input
                  type="text"
                  {...register('storeName')}
                  className="font-semibold"
                  error={!!errors.storeName}
                />
                {errors.storeName?.message && (
                  <p className="text-[11px] text-red-400 mt-1 font-medium">{String(errors.storeName.message)}</p>
                )}
              </div>

              {/* Shop Logo */}
              <div className="sm:col-span-2 lg:col-span-3">
                <Controller
                  name="storeLogo"
                  control={control}
                  render={({ field }) => (
                    <ImageUploadInput
                      label="Shop Logo"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Shop Contact Phone *</label>
                <Input
                  type="text"
                  {...register('storePhone')}
                  className="font-mono"
                  error={!!errors.storePhone}
                />
                {errors.storePhone?.message && (
                  <p className="text-[11px] text-red-400 mt-1 font-medium">{String(errors.storePhone.message)}</p>
                )}
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp Number</label>
                <Input
                  type="text"
                  {...register('whatsappNumber')}
                  className="font-mono"
                />
              </div>

              {/* Store Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Shop Email</label>
                <Input
                  type="email"
                  {...register('storeEmail')}
                />
              </div>

              {/* Address */}
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Shop Address *</label>
                <Input
                  type="text"
                  {...register('storeAddress')}
                  error={!!errors.storeAddress}
                />
                {errors.storeAddress?.message && (
                  <p className="text-[11px] text-red-400 mt-1 font-medium">{String(errors.storeAddress.message)}</p>
                )}
              </div>

              {/* Tax % */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">GST Tax Rate (%)</label>
                <Input
                  type="number"
                  step="0.1"
                  {...register('taxRate')}
                  className="font-mono"
                  error={!!errors.taxRate}
                />
              </div>

              {/* Invoice Prefix */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Invoice Prefix</label>
                <Input
                  type="text"
                  {...register('invoicePrefix')}
                  className="font-mono"
                />
              </div>

              {/* Currency */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Currency Symbol</label>
                <Input
                  type="text"
                  {...register('currency')}
                  className="font-mono"
                />
              </div>

              {/* Opening & Closing Times */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Opening Time</label>
                <Input
                  type="text"
                  {...register('openingTime')}
                  placeholder="11:00 AM"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Closing Time</label>
                <Input
                  type="text"
                  {...register('closingTime')}
                  placeholder="02:00 AM"
                />
              </div>

              {/* Social Media */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Social Media Handle</label>
                <Input
                  type="text"
                  {...register('socialMedia')}
                  placeholder="@urbanspicefaisalabad"
                />
              </div>

              {/* Invoice Footer */}
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Receipt Footer Message</label>
                <Textarea
                  rows={2}
                  {...register('invoiceFooter')}
                  placeholder="Thank you for ordering from Urban Spice!"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3.5 rounded-xl font-medium flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                className="space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving Settings...' : 'Save Shop Settings'}</span>
              </Button>
            </div>
          </form>

          {/* Restaurant Tables Management Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-bold text-base text-slate-100 flex items-center space-x-2">
                <Armchair className="w-5 h-5 text-amber-400" />
                <span>Restaurant Dine-In Tables Configuration</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {tables.length} Total Tables Configured
              </span>
            </div>

            {/* Add Table Form */}
            <form onSubmit={handleAddTable} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Table Name *</label>
                <Input
                  type="text"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  placeholder="e.g. Table 13 / Patio 1"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Table Number *</label>
                <Input
                  type="number"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  placeholder="e.g. 13"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Seating Capacity</label>
                <Input
                  type="number"
                  value={newTableCapacity}
                  onChange={(e) => setNewTableCapacity(e.target.value)}
                  placeholder="4"
                />
              </div>

              <Button type="submit" variant="primary" disabled={isAddingTable} className="w-full">
                <Plus className="w-4 h-4 mr-1" />
                <span>{isAddingTable ? 'Adding...' : 'Add Table'}</span>
              </Button>
            </form>

            {/* Tables List */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
              {tables.map((table) => (
                <div
                  key={table.id}
                  className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between group hover:border-slate-700 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="font-extrabold text-sm text-slate-100 font-mono">{table.name}</div>
                    <div className="text-[11px] text-slate-400">
                      {table.capacity} Seats • {table.status}
                    </div>
                    {table.status !== 'OCCUPIED' && (
                      <button
                        type="button"
                        onClick={() => handleTableStatusChange(table.id, table.status === 'RESERVED' ? 'AVAILABLE' : 'RESERVED')}
                        className={`mt-2 text-[10px] font-bold rounded-md px-2 py-1 border ${
                          table.status === 'RESERVED'
                            ? 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10'
                            : 'border-violet-500/40 text-violet-400 hover:bg-violet-500/10'
                        }`}
                      >
                        {table.status === 'RESERVED' ? 'Mark Available' : 'Reserve'}
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteTable(table.id, table.name)}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-900 transition-colors"
                    title={`Delete ${table.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
