'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { Settings, Save, CheckCircle2, Store, Clock, Phone, Mail, DollarSign, Image } from 'lucide-react';

import ImageUploadInput from '@/components/ImageUploadInput';

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [storeName, setStoreName] = useState('Urban Spice');
  const [storeLogo, setStoreLogo] = useState('https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&q=80');
  const [storeAddress, setStoreAddress] = useState('180 F, Near Klash Park, Millat Town, Faisalabad');
  const [storePhone, setStorePhone] = useState('0300-5225898');
  const [whatsappNumber, setWhatsappNumber] = useState('0300-5225898');
  const [storeEmail, setStoreEmail] = useState('orders@urbanspice.com');
  const [currency, setCurrency] = useState('Rs.');
  const [taxRate, setTaxRate] = useState('5');
  const [invoicePrefix, setInvoicePrefix] = useState('INV-2026');
  const [invoiceFooter, setInvoiceFooter] = useState('Thank you for ordering from Urban Spice! Ultimate Taste In Every Bite!');
  const [openingTime, setOpeningTime] = useState('11:00 AM');
  const [closingTime, setClosingTime] = useState('02:00 AM');
  const [defaultDeliveryFee, setDefaultDeliveryFee] = useState('150');
  const [socialMedia, setSocialMedia] = useState('@urbanspicefaisalabad');
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch(console.error);

    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          const s = data.settings;
          if (s.storeName) setStoreName(s.storeName);
          if (s.storeLogo) setStoreLogo(s.storeLogo);
          if (s.storeAddress) setStoreAddress(s.storeAddress);
          if (s.storePhone) setStorePhone(s.storePhone);
          if (s.whatsappNumber) setWhatsappNumber(s.whatsappNumber);
          if (s.storeEmail) setStoreEmail(s.storeEmail);
          if (s.currency) setCurrency(s.currency);
          if (s.taxRate) setTaxRate(s.taxRate);
          if (s.invoicePrefix) setInvoicePrefix(s.invoicePrefix);
          if (s.invoiceFooter) setInvoiceFooter(s.invoiceFooter);
          if (s.openingTime) setOpeningTime(s.openingTime);
          if (s.closingTime) setClosingTime(s.closingTime);
          if (s.defaultDeliveryFee) setDefaultDeliveryFee(s.defaultDeliveryFee);
          if (s.socialMedia) setSocialMedia(s.socialMedia);
        }
      })
      .catch(console.error);
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName,
          storeLogo,
          storeAddress,
          storePhone,
          whatsappNumber,
          storeEmail,
          currency,
          taxRate,
          invoicePrefix,
          invoiceFooter,
          openingTime,
          closingTime,
          defaultDeliveryFee,
          socialMedia,
        }),
      });

      if (res.ok) {
        setSavedMsg(true);
        setTimeout(() => setSavedMsg(false), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar userRole={currentUser?.role} userName={currentUser?.name} userEmail={currentUser?.email} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar title="Dynamic Shop Settings & Invoice Configuration" />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <form onSubmit={handleSaveSettings} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 max-w-4xl shadow-xl">
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
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-semibold focus:border-amber-500"
                />
              </div>

              {/* Shop Logo */}
              <div className="sm:col-span-2 lg:col-span-3">
                <ImageUploadInput
                  label="Shop Logo Image"
                  value={storeLogo}
                  onChange={setStoreLogo}
                  placeholder="https://images.unsplash.com/..."
                  helpText="Upload your official restaurant logo or paste a direct image URL. This logo will automatically appear on invoices and thermal receipts."
                />
              </div>

              {/* Currency */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Currency Symbol *</label>
                <input
                  type="text"
                  required
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  placeholder="Rs. or PKR or $"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:border-amber-500"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:border-amber-500"
                />
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp Number</label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:border-amber-500"
                />
              </div>

              {/* Store Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Shop Email</label>
                <input
                  type="email"
                  value={storeEmail}
                  onChange={(e) => setStoreEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:border-amber-500"
                />
              </div>

              {/* Address */}
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Shop Address *</label>
                <input
                  type="text"
                  required
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:border-amber-500"
                />
              </div>

              {/* Tax % */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tax / VAT (%) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:border-amber-500"
                />
              </div>

              {/* Default Delivery Fee */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Default Delivery Fee (Rs.)</label>
                <input
                  type="number"
                  value={defaultDeliveryFee}
                  onChange={(e) => setDefaultDeliveryFee(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:border-amber-500"
                />
              </div>

              {/* Invoice Prefix */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Invoice Prefix</label>
                <input
                  type="text"
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:border-amber-500"
                />
              </div>

              {/* Opening & Closing Times */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Opening Time</label>
                <input
                  type="text"
                  value={openingTime}
                  onChange={(e) => setOpeningTime(e.target.value)}
                  placeholder="11:00 AM"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Closing Time</label>
                <input
                  type="text"
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                  placeholder="02:00 AM"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:border-amber-500"
                />
              </div>

              {/* Social Media */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Social Media Handle</label>
                <input
                  type="text"
                  value={socialMedia}
                  onChange={(e) => setSocialMedia(e.target.value)}
                  placeholder="@sliceandspicepizza"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:border-amber-500"
                />
              </div>

              {/* Invoice Footer text */}
              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Invoice Footer Message</label>
                <textarea
                  rows={2}
                  value={invoiceFooter}
                  onChange={(e) => setInvoiceFooter(e.target.value)}
                  placeholder="Thank you for ordering from Slice & Spice Pizza!"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:border-amber-500 resize-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center space-x-2 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Save All Shop Settings</span>
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
