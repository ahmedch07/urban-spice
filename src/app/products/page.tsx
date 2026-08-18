'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import ImageUploadInput from '@/components/ImageUploadInput';
import { Package, Plus, Search, Edit2, Trash2, CheckCircle, XCircle, FolderPlus, Layers } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function ProductsPage() {
  const [currentUser, setCurrentUser] = useState<any>({ name: 'Admin', role: 'ADMIN' });
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Add/Edit Product Modal
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

  // Add/Edit Category Modal
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<any>(null);
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catImage, setCatImage] = useState('');
  const [catError, setCatError] = useState('');

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
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
        if (data.categories.length > 0 && !categoryId) setCategoryId(data.categories[0].id);
      }
    } catch (e) {
      console.error('Failed to fetch categories:', e);
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
      if (categories.length > 0) setCategoryId(categories[0].id);
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

  // Category Modal Handlers
  const handleOpenCatModal = (cat: any = null) => {
    setCatError('');
    if (cat) {
      setEditCategory(cat);
      setCatName(cat.name);
      setCatDescription(cat.description || '');
      setCatImage(cat.image || '');
    } else {
      setEditCategory(null);
      setCatName('');
      setCatDescription('');
      setCatImage('');
    }
    setIsCatModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatError('');

    const url = '/api/categories';
    const method = editCategory ? 'PUT' : 'POST';
    const payload = {
      id: editCategory?.id,
      name: catName,
      description: catDescription,
      image: catImage,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setCatError(data.error || 'Failed to save category');
        return;
      }
      setIsCatModalOpen(false);
      fetchCategories();
    } catch (err) {
      setCatError('Network error while saving category');
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
        <Navbar title="Product & Category Management" />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name or SKU..."
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => handleOpenCatModal()}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl flex items-center space-x-1.5 transition-colors shadow"
              >
                <FolderPlus className="w-4 h-4 text-amber-400" />
                <span>Categories</span>
              </button>

              <button
                onClick={() => handleOpenModal()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* Categories Overview bar */}
          {categories.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                  <Layers className="w-4 h-4" />
                  <span>Product Categories ({categories.length})</span>
                </h4>
                <button
                  onClick={() => handleOpenCatModal()}
                  className="text-[11px] text-amber-400 hover:underline font-semibold"
                >
                  + Add New Category
                </button>
              </div>

              <div className="flex items-center space-x-3 overflow-x-auto pb-1">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => handleOpenCatModal(cat)}
                    className="group cursor-pointer bg-slate-950 border border-slate-800 hover:border-amber-500/50 p-2.5 rounded-xl flex items-center space-x-2.5 shrink-0 transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                      ) : (
                        <Layers className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
                        {cat.name}
                      </div>
                      <div className="text-[10px] text-slate-500">Click to Edit Category Image</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-mono">
                                Pizza Item
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-slate-400 font-mono">{p.SKU}</td>
                        <td className="p-4 text-slate-300 font-medium">{p.category?.name}</td>
                        <td className="p-4 font-mono font-bold text-emerald-400">
                          {formatCurrency(p.basePrice)}
                        </td>
                        <td className="p-4 font-mono text-slate-400">{formatCurrency(p.costPrice)}</td>
                        <td className="p-4 font-mono">
                          <span
                            className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                              p.stock <= p.minStock
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {p.stock} units
                          </span>
                        </td>
                        <td className="p-4">
                          {p.active ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-500" />
                          )}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenModal(p)}
                            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
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

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 my-8">
            <h3 className="text-base font-bold text-slate-100 pb-2 border-b border-slate-800">
              {editProduct ? 'Edit Product Catalog Item' : 'Add New Product Item'}
            </h3>

            {formError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Chicken Fajita Pizza"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <label className="block text-xs text-slate-300 font-semibold mb-1">Base Price (Rs.) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">Cost Price (Rs.)</label>
                  <input
                    type="number"
                    step="0.01"
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

              {/* Product Image Upload Component */}
              <div>
                <ImageUploadInput
                  label="Product Image"
                  value={image}
                  onChange={setImage}
                  placeholder="https://images.unsplash.com/..."
                  helpText="Upload a product photo from device or enter an image URL."
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

      {/* Add/Edit Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4 my-8">
            <h3 className="text-base font-bold text-slate-100 pb-2 border-b border-slate-800">
              {editCategory ? 'Edit Category Details & Image' : 'Create New Category'}
            </h3>

            {catError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-xl">
                {catError}
              </div>
            )}

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Gourmet Pizzas, Beverages, Side Orders"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={catDescription}
                  onChange={(e) => setCatDescription(e.target.value)}
                  placeholder="Category description..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:border-amber-500"
                />
              </div>

              {/* Category Image Upload Component */}
              <div>
                <ImageUploadInput
                  label="Category Image"
                  value={catImage}
                  onChange={setCatImage}
                  placeholder="https://images.unsplash.com/..."
                  helpText="Upload a category icon/image or paste an image URL."
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
