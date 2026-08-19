'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Store, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import ImageUploadInput from '@/components/ImageUploadInput';

const storeSettingsSchema = z.object({
  storeName: z.string().min(1, 'Shop name is required'),
  storeLogo: z.string().optional(),
  storeAddress: z.string().min(1, 'Shop address is required'),
  storePhone: z.string().min(1, 'Phone number is required'),
  whatsappNumber: z.string().optional(),
  storeEmail: z.string().optional(),
  currency: z.string().min(1, 'Currency symbol is required'),
  taxRate: z.string().min(1, 'Tax rate is required'),
  invoicePrefix: z.string().optional(),
  invoiceFooter: z.string().optional(),
  openingTime: z.string().optional(),
  closingTime: z.string().optional(),
  defaultDeliveryFee: z.string().optional(),
  socialMedia: z.string().optional(),
});

type StoreSettingsFormValues = z.infer<typeof storeSettingsSchema>;

const defaultValues: StoreSettingsFormValues = {
  storeName: 'Urban Spice',
  storeLogo: '/logo.png',
  storeAddress: '180 F, Near Klash Park, Millat Town, Faisalabad',
  storePhone: '0300-5225898',
  whatsappNumber: '0300-5225898',
  storeEmail: 'orders@urbanspice.com',
  currency: 'Rs.',
  taxRate: '0',
  invoicePrefix: 'INV-2026',
  invoiceFooter: 'Thank you for ordering from Urban Spice! Ultimate Taste In Every Bite!',
  openingTime: '11:00 AM',
  closingTime: '02:00 AM',
  defaultDeliveryFee: '150',
  socialMedia: '@urbanspicefaisalabad',
};

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [savedMsg, setSavedMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StoreSettingsFormValues>({
    resolver: zodResolver(storeSettingsSchema),
    defaultValues,
  });

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch(console.error);

    // Fetch latest settings from Server API and merge with LocalStorage
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        let merged = { ...defaultValues, ...(data.settings || {}) };
        try {
          const cached = localStorage.getItem('urban_spice_store_settings');
          if (cached) {
            merged = { ...merged, ...JSON.parse(cached) };
          }
        } catch (e) {}

        reset(merged);
      })
      .catch(() => {
        try {
          const cached = localStorage.getItem('urban_spice_store_settings');
          if (cached) reset({ ...defaultValues, ...JSON.parse(cached) });
        } catch (e) {}
      });
  }, [reset]);

  const onSave = async (values: StoreSettingsFormValues) => {
    setSavedMsg(false);
    setErrorMsg('');

    // Always save to LocalStorage immediately so changes never get lost
    try {
      localStorage.setItem('urban_spice_store_settings', JSON.stringify(values));
      window.dispatchEvent(new CustomEvent('store-settings-updated', { detail: values }));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to save settings to server (saved to local device storage).');
        return;
      }

      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 4000);
    } catch (e) {
      setSavedMsg(true); // Still saved to local storage
      setTimeout(() => setSavedMsg(false), 4000);
    }
  };

  const onInvalid = () => {
    setErrorMsg('Please check the form for errors and required fields');
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar userRole={currentUser?.role} userName={currentUser?.name} userEmail={currentUser?.email} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar title="Dynamic Shop Settings & Invoice Configuration" />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <form onSubmit={handleSubmit(onSave, onInvalid)} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl" noValidate>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-bold text-base text-slate-100 flex items-center space-x-2">
                <Store className="w-5 h-5 text-amber-400" />
                <span>Shop Branding, Contact & Operational Parameters</span>
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
                {errors.storeName && (
                  <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.storeName.message}</p>
                )}
              </div>

              {/* Shop Logo */}
              <div className="sm:col-span-2 lg:col-span-3">
                <Controller
                  name="storeLogo"
                  control={control}
                  render={({ field }) => (
                    <ImageUploadInput
                      label="Shop Logo Image"
                      value={field.value || '/logo.png'}
                      onChange={field.onChange}
                      placeholder="https://images.unsplash.com/..."
                      helpText="Upload your official restaurant logo or paste a direct image URL. This logo will automatically appear on invoices and thermal receipts."
                    />
                  )}
                />
              </div>

              {/* Currency */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Currency Symbol *</label>
                <Input
                  type="text"
                  {...register('currency')}
                  placeholder="Rs. or PKR or $"
                  className="font-mono"
                  error={!!errors.currency}
                />
                {errors.currency && (
                  <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.currency.message}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number *</label>
                <Input
                  type="text"
                  {...register('storePhone')}
                  className="font-mono"
                  error={!!errors.storePhone}
                />
                {errors.storePhone && (
                  <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.storePhone.message}</p>
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
                {errors.storeAddress && (
                  <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.storeAddress.message}</p>
                )}
              </div>

              {/* Tax % */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tax / VAT (%) *</label>
                <Input
                  type="number"
                  step="0.1"
                  {...register('taxRate')}
                  className="font-mono"
                  error={!!errors.taxRate}
                />
                {errors.taxRate && (
                  <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.taxRate.message}</p>
                )}
              </div>

              {/* Default Delivery Fee */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Default Delivery Fee (Rs.)</label>
                <Input
                  type="number"
                  {...register('defaultDeliveryFee')}
                  className="font-mono"
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

              {/* Invoice Footer text */}
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Invoice Footer Message</label>
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
                <span>{isSubmitting ? 'Saving Settings...' : 'Save All Shop Settings'}</span>
              </Button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
