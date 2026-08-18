'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { Pizza, Plus, Edit2, Trash2, Layers, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

import ImageUploadInput from '@/components/ImageUploadInput';

export default function PizzaManagementPage() {
  const [currentUser, setCurrentUser] = useState<any>({ name: 'Admin', role: 'ADMIN' });
  const [activeTab, setActiveTab] = useState<'flavors' | 'sizes' | 'crusts' | 'toppings'>('flavors');

  const [flavors, setFlavors] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [crusts, setCrusts] = useState<any[]>([]);
  const [toppings, setToppings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State for Flavor
  const [isFlavorModalOpen, setIsFlavorModalOpen] = useState(false);
  const [editFlavor, setEditFlavor] = useState<any>(null);
  const [flavorName, setFlavorName] = useState('');
  const [flavorDesc, setFlavorDesc] = useState('');
  const [flavorImg, setFlavorImg] = useState('');
  const [sizePricesMap, setSizePricesMap] = useState<Record<string, string>>({});

  // Modal state for Crust/Topping
  const [isGenericModalOpen, setIsGenericModalOpen] = useState(false);
  const [genericType, setGenericType] = useState<'crust' | 'topping'>('crust');
  const [genericItem, setGenericItem] = useState<any>(null);
  const [genericName, setGenericName] = useState('');
  const [genericPrice, setGenericPrice] = useState('');
  const [genericStock, setGenericStock] = useState('500');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch(console.error);

    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [fRes, sRes, cRes, tRes] = await Promise.all([
        fetch('/api/pizza-management/flavors'),
        fetch('/api/pizza-management/sizes'),
        fetch('/api/pizza-management/crusts'),
        fetch('/api/pizza-management/toppings'),
      ]);

      const fData = await fRes.json();
      const sData = await sRes.json();
      const cData = await cRes.json();
      const tData = await tRes.json();

      if (fData.flavors) setFlavors(fData.flavors);
      if (sData.sizes) setSizes(sData.sizes);
      if (cData.crusts) setCrusts(cData.crusts);
      if (tData.toppings) setToppings(tData.toppings);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenFlavorModal = (flavor: any = null) => {
    if (flavor) {
      setEditFlavor(flavor);
      setFlavorName(flavor.name);
      setFlavorDesc(flavor.description || '');
      setFlavorImg(flavor.image || '');

      const map: Record<string, string> = {};
      flavor.flavorPrices?.forEach((fp: any) => {
        map[fp.sizeId] = String(fp.price);
      });
      setSizePricesMap(map);
    } else {
      setEditFlavor(null);
      setFlavorName('');
      setFlavorDesc('');
      setFlavorImg('');
      setSizePricesMap({
        [sizes[0]?.id]: '700',
        [sizes[1]?.id]: '1000',
        [sizes[2]?.id]: '1400',
        [sizes[3]?.id]: '1800',
      });
    }
    setIsFlavorModalOpen(true);
  };

  const handleSaveFlavor = async (e: React.FormEvent) => {
    e.preventDefault();
    const pricesArray = Object.entries(sizePricesMap).map(([sizeId, price]) => ({
      sizeId,
      price: parseFloat(price) || 0,
    }));

    const url = '/api/pizza-management/flavors';
    const method = editFlavor ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editFlavor?.id,
          name: flavorName,
          description: flavorDesc,
          image: flavorImg,
          prices: pricesArray,
        }),
      });

      if (res.ok) {
        setIsFlavorModalOpen(false);
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteFlavor = async (id: string) => {
    if (!window.confirm('Delete pizza flavor?')) return;
    await fetch(`/api/pizza-management/flavors?id=${id}`, { method: 'DELETE' });
    fetchAllData();
  };

  const handleOpenGenericModal = (type: 'crust' | 'topping', item: any = null) => {
    setGenericType(type);
    setGenericItem(item);
    if (item) {
      setGenericName(item.name);
      setGenericPrice(String(item.additionalPrice));
      setGenericStock(String(item.stock || 500));
    } else {
      setGenericName('');
      setGenericPrice('150');
      setGenericStock('500');
    }
    setIsGenericModalOpen(true);
  };

  const handleSaveGeneric = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = genericType === 'crust' ? '/api/pizza-management/crusts' : '/api/pizza-management/toppings';
    const method = genericItem ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: genericItem?.id,
          name: genericName,
          additionalPrice: genericPrice,
          stock: genericStock,
        }),
      });
      if (res.ok) {
        setIsGenericModalOpen(false);
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar userRole={currentUser.role} userName={currentUser.name} userEmail={currentUser.email} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar title="Dedicated Pizza Configurator" />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
              {[
                { id: 'flavors', label: 'Pizza Flavors' },
                { id: 'sizes', label: 'Sizes & Multipliers' },
                { id: 'crusts', label: 'Crust Options' },
                { id: 'toppings', label: 'Toppings Inventory' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'flavors' && (
              <button
                onClick={() => handleOpenFlavorModal()}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Add Pizza Flavor</span>
              </button>
            )}

            {(activeTab === 'crusts' || activeTab === 'toppings') && (
              <button
                onClick={() => handleOpenGenericModal(activeTab === 'crusts' ? 'crust' : 'topping')}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Add {activeTab === 'crusts' ? 'Crust' : 'Topping'}</span>
              </button>
            )}
          </div>

          {/* Tab 1: Flavors */}
          {activeTab === 'flavors' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {flavors.map((f) => (
                <div key={f.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
                  <div className="flex items-start space-x-3">
                    <div className="w-14 h-14 rounded-xl bg-slate-950 overflow-hidden shrink-0 border border-slate-800">
                      {f.image ? (
                        <img src={f.image} alt={f.name} className="w-full h-full object-cover" />
                      ) : (
                        <Pizza className="w-full h-full p-3 text-amber-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-slate-100 truncate">{f.name}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{f.description}</p>
                    </div>
                  </div>

                  {/* Size prices list */}
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                    {sizes.map((s) => {
                      const priceObj = f.flavorPrices?.find((fp: any) => fp.sizeId === s.id);
                      return (
                        <div key={s.id} className="flex justify-between">
                          <span className="text-slate-400 font-semibold">{s.name}:</span>
                          <span className="font-mono font-bold text-amber-400">
                            {formatCurrency(priceObj?.price || 0)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end space-x-2 pt-1 border-t border-slate-800/60">
                    <button
                      onClick={() => handleOpenFlavorModal(f)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFlavor(f.id)}
                      className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-bold"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Sizes */}
          {activeTab === 'sizes' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Size Name</th>
                    <th className="p-3">Code</th>
                    <th className="p-3">Sort Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {sizes.map((s) => (
                    <tr key={s.id}>
                      <td className="p-3 font-bold text-slate-100">{s.name}</td>
                      <td className="p-3 font-mono font-bold text-amber-400">{s.code}</td>
                      <td className="p-3 font-mono">{s.sortOrder}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 3 & 4: Crusts & Toppings */}
          {(activeTab === 'crusts' || activeTab === 'toppings') && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Additional Price (Rs.)</th>
                    {activeTab === 'toppings' && <th className="p-3">Stock</th>}
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(activeTab === 'crusts' ? crusts : toppings).map((item) => (
                    <tr key={item.id}>
                      <td className="p-3 font-bold text-slate-100">{item.name}</td>
                      <td className="p-3 font-mono font-bold text-amber-400">
                        +{formatCurrency(item.additionalPrice)}
                      </td>
                      {activeTab === 'toppings' && <td className="p-3 font-mono text-slate-300">{item.stock}</td>}
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleOpenGenericModal(activeTab === 'crusts' ? 'crust' : 'topping', item)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Flavor Modal */}
      {isFlavorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100">
              {editFlavor ? 'Edit Pizza Flavor' : 'Add Pizza Flavor'}
            </h3>

            <form onSubmit={handleSaveFlavor} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Flavor Name *</label>
                <input
                  type="text"
                  required
                  value={flavorName}
                  onChange={(e) => setFlavorName(e.target.value)}
                  placeholder="e.g. Chicken Tikka"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={flavorDesc}
                  onChange={(e) => setFlavorDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100"
                />
              </div>

              <div>
                <ImageUploadInput
                  label="Pizza Flavor Image"
                  value={flavorImg}
                  onChange={setFlavorImg}
                  placeholder="https://images.unsplash.com/..."
                  helpText="Upload a flavor photo from device or paste an image URL."
                />
              </div>

              {/* Set Size Prices */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="block text-xs text-amber-400 font-bold uppercase">Prices per Size (Rs.)</label>
                <div className="grid grid-cols-2 gap-2">
                  {sizes.map((s) => (
                    <div key={s.id}>
                      <span className="text-[11px] text-slate-400 block mb-0.5">{s.name}</span>
                      <input
                        type="number"
                        required
                        value={sizePricesMap[s.id] || ''}
                        onChange={(e) => setSizePricesMap({ ...sizePricesMap, [s.id]: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsFlavorModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl">
                  Save Flavor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generic Crust/Topping Modal */}
      {isGenericModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 capitalize">
              {genericItem ? 'Edit' : 'Add'} {genericType}
            </h3>

            <form onSubmit={handleSaveGeneric} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={genericName}
                  onChange={(e) => setGenericName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Additional Price (Rs.)</label>
                <input
                  type="number"
                  required
                  value={genericPrice}
                  onChange={(e) => setGenericPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono"
                />
              </div>

              {genericType === 'topping' && (
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={genericStock}
                    onChange={(e) => setGenericStock(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsGenericModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl">
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
