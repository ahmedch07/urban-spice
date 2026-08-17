'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { Package, Plus, Search, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function ProductsPage() {
  const [currentUser, setCurrentUser] = useState<any>({ name: 'Admin', role: 'ADMIN' });
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [name, setName] = useState('');
  const [SKU, setSKU] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stock, setStock] = useState('100');
  const [minStock, setMinStock] = useState('10');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [isPizza, setIsPizza] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch(console.error);

    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    const res = await fetch('/api/pos/categories');
    const data = await res.json();
    if (data.categories) {
      setCategories(data.categories);
      if (data.categories.length > 0) setCategoryId(data.categories[0].id);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.products) setProducts(data.products);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (prod: any = null) => {
    setFormError('');
    if (prod) {
      setEditProduct(prod);
      setName(prod.name);
      setSKU(prod.SKU);
      setCategoryId(prod.categoryId);
      setBasePrice(String(prod.basePrice));
      setCostPrice(String(prod.costPrice));
      setStock(String(prod.stock));
      setMinStock(String(prod.minStock));
      setDescription(prod.description || '');
      setImage(prod.image || '');
      setIsPizza(prod.isPizza);
    } else {
      setEditProduct(null);
      setName('');
      setSKU(`PRD-${Math.floor(100 + Math.random() * 900)}`);
      setBasePrice('');
      setCostPrice('');
      setStock('100');
      setMinStock('10');
      setDescription('');
      setImage('');
      setIsPizza(false);
    }
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const url = '/api/products';
    const method = editProduct ? 'PUT' : 'POST';
    const payload = {
      id: editProduct?.id,
      name,
      SKU,
      categoryId,
      basePrice,
      costPrice,
      stock,
      minStock,
      description,
      image,
      isPizza,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to save product');
        return;
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      setFormError('Network error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchProducts();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.SKU.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar userRole={currentUser.role} userName={currentUser.name} userEmail={currentUser.email} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar title="Product Catalog Management" />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header Action Bar */}
          <div className="flex items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name or SKU..."
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          {/* Products Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-4">Item & Image</th>
                    <th className="p-4">SKU</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Selling Price</th>
                    <th className="p-4">Cost Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Active</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        Loading products catalog...
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        No products found
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-950 overflow-hidden border border-slate-800 shrink-0">
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-full h-full p-2 text-slate-700" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-200">{p.name}</div>
                            {p.isPizza && (
                              <span className="text-[10px] text-amber-400 font-extrabold uppercase">
                                Custom Pizza
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 font-mono text-slate-400">{p.SKU}</td>
                        <td className="p-4 text-slate-300 font-medium">{p.category?.name}</td>
                        <td className="p-4 font-mono font-bold text-amber-400">
                          {formatCurrency(p.basePrice)}
                        </td>
                        <td className="p-4 font-mono text-slate-400">
                          {formatCurrency(p.costPrice)}
                        </td>
                        <td className="p-4 font-mono">
                          <span
                            className={`font-bold ${
                              p.stock <= p.minStock ? 'text-red-400' : 'text-slate-200'
                            }`}
                          >
                            {p.stock}
                          </span>
                        </td>
                        <td className="p-4">
                          {p.active ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-600" />
                          )}
                        </td>
                        <td className="p-4 text-right space-x-1.5">
                          <button
                            onClick={() => handleOpenModal(p)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100">
              {editProduct ? 'Edit Product' : 'Add New Product'}
            </h3>

            {formError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    value={SKU}
                    onChange={(e) => setSKU(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:border-amber-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">Selling Base Price (Rs.) *</label>
                  <input
                    type="number"
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">Cost Price (Rs.)</label>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">Stock</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">Min Stock</label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Image URL</label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:border-amber-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isPizza"
                  checked={isPizza}
                  onChange={(e) => setIsPizza(e.target.checked)}
                  className="rounded border-slate-800 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="isPizza" className="text-xs font-semibold text-slate-300">
                  Is Pizza (triggers Pizza Customizer modal on POS click)
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
