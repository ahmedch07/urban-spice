'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import ImageUploadInput from '@/components/ImageUploadInput';
import { Pizza, Plus, Edit2, Trash2, Layers, CheckCircle, Search, SlidersHorizontal, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function PizzaManagementPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'flavors' | 'sizes' | 'crusts' | 'toppings'>('flavors');

  const [flavors, setFlavors] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [crusts, setCrusts] = useState<any[]>([]);
  const [toppings, setToppings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State for Flavor
  const [isFlavorModalOpen, setIsFlavorModalOpen] = useState(false);
  const [editFlavor, setEditFlavor] = useState<any>(null);
  const [flavorName, setFlavorName] = useState('');
  const [flavorDesc, setFlavorDesc] = useState('');
  const [flavorImg, setFlavorImg] = useState('');
  const [sizePricesMap, setSizePricesMap] = useState<Record<string, string>>({});
  const [flavorError, setFlavorError] = useState('');

  // Modal State for Size
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [editSizeItem, setEditSizeItem] = useState<any>(null);
  const [sizeName, setSizeName] = useState('');
  const [sizeCode, setSizeCode] = useState('');
  const [sizeSortOrder, setSizeSortOrder] = useState('0');
  const [sizeError, setSizeError] = useState('');

  // Modal state for Crust/Topping
  const [isGenericModalOpen, setIsGenericModalOpen] = useState(false);
  const [genericType, setGenericType] = useState<'crust' | 'topping'>('crust');
  const [genericItem, setGenericItem] = useState<any>(null);
  const [genericName, setGenericName] = useState('');
  const [genericPrice, setGenericPrice] = useState('');
  const [genericStock, setGenericStock] = useState('500');
  const [genericError, setGenericError] = useState('');

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

  // Flavor Handlers
  const handleOpenFlavorModal = (flavor: any = null) => {
    setFlavorError('');
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
      const defaultMap: Record<string, string> = {};
      sizes.forEach((s, idx) => {
        defaultMap[s.id] = String(700 + idx * 300);
      });
      setSizePricesMap(defaultMap);
    }
    setIsFlavorModalOpen(true);
  };

  const handleSaveFlavor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFlavorError('');

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

      const data = await res.json();
      if (!res.ok) {
        setFlavorError(data.error || 'Failed to save flavor');
        return;
      }

      setIsFlavorModalOpen(false);
      fetchAllData();
    } catch (e) {
      setFlavorError('Network error');
    }
  };

  const handleDeleteFlavor = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this pizza flavor?')) return;
    await fetch(`/api/pizza-management/flavors?id=${id}`, { method: 'DELETE' });
    fetchAllData();
  };

  // Size Handlers
  const handleOpenSizeModal = (sizeItem: any = null) => {
    setSizeError('');
    if (sizeItem) {
      setEditSizeItem(sizeItem);
      setSizeName(sizeItem.name);
      setSizeCode(sizeItem.code);
      setSizeSortOrder(String(sizeItem.sortOrder || 0));
    } else {
      setEditSizeItem(null);
      setSizeName('');
      setSizeCode('');
      setSizeSortOrder(String(sizes.length + 1));
    }
    setIsSizeModalOpen(true);
  };

  const handleSaveSize = async (e: React.FormEvent) => {
    e.preventDefault();
    setSizeError('');

    const url = '/api/pizza-management/sizes';
    const method = editSizeItem ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editSizeItem?.id,
          name: sizeName,
          code: sizeCode,
          sortOrder: sizeSortOrder,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSizeError(data.error || 'Failed to save size');
        return;
      }

      setIsSizeModalOpen(false);
      fetchAllData();
    } catch (e) {
      setSizeError('Network error');
    }
  };

  const handleDeleteSize = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this size option?')) return;
    try {
      const res = await fetch(`/api/pizza-management/sizes?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchAllData();
    } catch (e) {
      console.error(e);
    }
  };

  // Crust / Topping Handlers
  const handleOpenGenericModal = (type: 'crust' | 'topping', item: any = null) => {
    setGenericError('');
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
    setGenericError('');
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
      const data = await res.json();
      if (!res.ok) {
        setGenericError(data.error || `Failed to save ${genericType}`);
        return;
      }
      setIsGenericModalOpen(false);
      fetchAllData();
    } catch (e) {
      setGenericError('Network error');
    }
  };

  const filteredFlavors = flavors.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar userRole={currentUser.role} userName={currentUser.name} userEmail={currentUser.email} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar title="Dedicated Pizza Configurator & Pricing Engine" />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Bar with Search & Configurator Tabs */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
            <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 p-1.5 rounded-xl w-full md:w-auto">
              {[
                { id: 'flavors', label: 'Pizza Flavors' },
                { id: 'sizes', label: 'Sizes & Codes' },
                { id: 'crusts', label: 'Crust Options' },
                { id: 'toppings', label: 'Toppings' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
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
              <div className="relative flex-1 max-w-xs w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pizza flavors..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
              {activeTab === 'flavors' && (
                <button
                  onClick={() => handleOpenFlavorModal()}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Pizza Flavor</span>
                </button>
              )}

              {activeTab === 'sizes' && (
                <button
                  onClick={() => handleOpenSizeModal()}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Pizza Size</span>
                </button>
              )}

              {(activeTab === 'crusts' || activeTab === 'toppings') && (
                <button
                  onClick={() => handleOpenGenericModal(activeTab === 'crusts' ? 'crust' : 'topping')}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add {activeTab === 'crusts' ? 'Crust' : 'Topping'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Tab 1: Flavors */}
          {activeTab === 'flavors' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                <div className="col-span-full py-12 text-center text-slate-500">
                  Loading pizza flavors configuration...
                </div>
              ) : filteredFlavors.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-500">
                  No pizza flavors found. Click "Add Pizza Flavor" to create one.
                </div>
              ) : (
                filteredFlavors.map((f) => (
                  <div key={f.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
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
                          <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{f.description || 'No description'}</p>
                        </div>
                      </div>

                      {/* Size prices list */}
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 space-y-1.5 text-xs">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800 pb-1">
                          Configured Prices per Size
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {sizes.map((s) => {
                            const priceObj = f.flavorPrices?.find((fp: any) => fp.sizeId === s.id);
                            return (
                              <div key={s.id} className="flex justify-between items-center bg-slate-900/60 px-2 py-1 rounded-lg border border-slate-800/40">
                                <span className="text-slate-400 font-semibold text-[11px]">{s.name}:</span>
                                <span className="font-mono font-bold text-amber-400 text-[11px]">
                                  {formatCurrency(priceObj?.price || 0)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                      <span className="text-[11px] text-slate-500">ID: {f.id.slice(0, 8)}...</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleOpenFlavorModal(f)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1 border border-slate-700"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteFlavor(f.id)}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold border border-rose-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 2: Sizes */}
          {activeTab === 'sizes' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-100">Pizza Size Options & Codes</h3>
                  <p className="text-xs text-slate-400">Configure size names, codes (S, M, L, XL), and sorting order for your pizza menu.</p>
                </div>
                <button
                  onClick={() => handleOpenSizeModal()}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center space-x-1 shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Size</span>
                </button>
              </div>

              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Size Name</th>
                    <th className="p-3">Code / Abbr</th>
                    <th className="p-3">Sort Order</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {sizes.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-bold text-slate-100">{s.name}</td>
                      <td className="p-3 font-mono font-bold text-amber-400">
                        <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded-md">
                          {s.code}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-300">{s.sortOrder}</td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => handleOpenSizeModal(s)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700"
                        >
                          Edit Size
                        </button>
                        <button
                          onClick={() => handleDeleteSize(s.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
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
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Additional Price (Rs.)</th>
                    {activeTab === 'toppings' && <th className="p-3">Stock Quantity</th>}
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(activeTab === 'crusts' ? crusts : toppings).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-bold text-slate-100">{item.name}</td>
                      <td className="p-3 font-mono font-bold text-amber-400">
                        +{formatCurrency(item.additionalPrice)}
                      </td>
                      {activeTab === 'toppings' && <td className="p-3 font-mono text-slate-300">{item.stock}</td>}
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleOpenGenericModal(activeTab === 'crusts' ? 'crust' : 'topping', item)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700"
                        >
                          Edit
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

      {/* Add/Edit Flavor Modal */}
      {isFlavorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl my-8">
            <h3 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-2">
              {editFlavor ? 'Edit Pizza Flavor & Size Prices' : 'Add New Pizza Flavor'}
            </h3>

            {flavorError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-xl">
                {flavorError}
              </div>
            )}

            <form onSubmit={handleSaveFlavor} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Pizza Flavor Name *</label>
                <input
                  type="text"
                  required
                  value={flavorName}
                  onChange={(e) => setFlavorName(e.target.value)}
                  placeholder="e.g. Chicken Tikka Special"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Flavor Description</label>
                <textarea
                  rows={2}
                  value={flavorDesc}
                  onChange={(e) => setFlavorDesc(e.target.value)}
                  placeholder="Ingredients, toppings, spicy level..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:border-amber-500"
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
                <div className="flex items-center justify-between">
                  <label className="block text-xs text-amber-400 font-bold uppercase">Configure Price per Size (Rs.)</label>
                  <span className="text-[11px] text-slate-500">Edit values below</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {sizes.map((s) => (
                    <div key={s.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[11px] text-slate-400 font-bold block mb-1">
                        {s.name} ({s.code})
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={sizePricesMap[s.id] || ''}
                        onChange={(e) => setSizePricesMap({ ...sizePricesMap, [s.id]: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 font-mono focus:border-amber-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFlavorModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow">
                  Save Flavor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Size Modal */}
      {isSizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-2">
              {editSizeItem ? 'Edit Pizza Size' : 'Add New Pizza Size'}
            </h3>

            {sizeError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-xl">
                {sizeError}
              </div>
            )}

            <form onSubmit={handleSaveSize} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Size Name *</label>
                <input
                  type="text"
                  required
                  value={sizeName}
                  onChange={(e) => setSizeName(e.target.value)}
                  placeholder="e.g. Small, Medium, Large, Jumbo, Party"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">Code / Abbr *</label>
                  <input
                    type="text"
                    required
                    value={sizeCode}
                    onChange={(e) => setSizeCode(e.target.value)}
                    placeholder="e.g. S, M, L, XL, XXL"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:border-amber-500 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={sizeSortOrder}
                    onChange={(e) => setSizeSortOrder(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSizeModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow">
                  Save Size
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
            <h3 className="text-base font-bold text-slate-100 capitalize border-b border-slate-800 pb-2">
              {genericItem ? 'Edit' : 'Add'} {genericType}
            </h3>

            {genericError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-xl">
                {genericError}
              </div>
            )}

            <form onSubmit={handleSaveGeneric} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={genericName}
                  onChange={(e) => setGenericName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Additional Price (Rs.)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={genericPrice}
                  onChange={(e) => setGenericPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:border-amber-500"
                />
              </div>

              {genericType === 'topping' && (
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={genericStock}
                    onChange={(e) => setGenericStock(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:border-amber-500"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsGenericModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow">
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
