'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import ImageUploadInput from '@/components/ImageUploadInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { DataTable } from '@/components/ui/data-table';
import { DeleteConfirmModal } from '@/components/ui/delete-confirm-modal';
import { getProductColumns } from '@/columns';
import { Package, Plus, Search, FolderPlus, Layers, X, AlertCircle } from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  SKU: z.string().min(1, 'SKU is required'),
  categoryId: z.string().min(1, 'Please select a category'),
  basePrice: z.coerce
    .number({ invalid_type_error: 'Base price is required' })
    .positive('Base price must be greater than 0'),
  costPrice: z.coerce.number().min(0, 'Cost price must be non-negative').optional(),
  stock: z.coerce.number().min(0, 'Stock must be non-negative').optional(),
  minStock: z.coerce.number().min(0, 'Min stock must be non-negative').optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  isPizza: z.boolean().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  image: z.string().optional(),
});

import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

type CategoryFormValues = z.infer<typeof categorySchema>;

export default function ProductsPage() {
  const router = useRouter();
  const {
    currentUser,
    products,
    categories,
    refreshProducts,
    refreshCategories,
    isGlobalLoading,
  } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isGlobalLoading && currentUser && currentUser.role === 'CASHIER') {
      toast.error('Access Denied: Cashier accounts cannot access Products Catalog');
      router.replace('/pos');
    }
  }, [currentUser, isGlobalLoading, router]);

  // Add/Edit Product Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);

  // Add/Edit Category Modal
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<any>(null);

  // Delete Product Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<any>(null);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Silent background refresh
    refreshCategories();
    refreshProducts();
  }, [refreshCategories, refreshProducts]);

  const handleOpenModal = (prod: any = null) => {
    setEditProduct(prod);
    setIsModalOpen(true);
  };

  const handleOpenCatModal = (cat: any = null) => {
    setEditCategory(cat);
    setIsCatModalOpen(true);
  };

  const handleOpenDeleteModal = (id: string) => {
    const prod = products.find((p) => p.id === id);
    setDeletingProduct(prod || { id, name: 'this product' });
    setDeleteErrorMsg('');
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteProduct = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    setDeleteErrorMsg('');
    try {
      const res = await fetch(`/api/products?id=${deletingProduct.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        setDeleteErrorMsg(data.error || 'Failed to delete product');
        setIsDeleting(false);
        return;
      }
      setIsDeleteModalOpen(false);
      refreshProducts();
    } catch {
      setDeleteErrorMsg('Network error deleting product');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.SKU.toLowerCase().includes(q) ||
        (p.category?.name && p.category.name.toLowerCase().includes(q))
    );
  }, [products, searchQuery]);

  const columns = useMemo(
    () =>
      getProductColumns({
        onEdit: handleOpenModal,
        onDelete: handleOpenDeleteModal,
      }),
    [products]
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar userRole={currentUser?.role} userName={currentUser?.name} userEmail={currentUser?.email} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar title="Menu & Products Catalog Management" />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header Action Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">Store Products & Menu Items</h2>
                <p className="text-xs text-slate-400">
                  {products.length} Products registered across {categories.length} Categories.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                onClick={() => handleOpenCatModal()}
                className="space-x-1.5"
              >
                <FolderPlus className="w-4 h-4 text-amber-400" />
                <span>Categories</span>
              </Button>
              <Button
                variant="default"
                onClick={() => handleOpenModal()}
                className="space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </Button>
            </div>
          </div>

          {/* Categories Grid Ribbon */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Active Menu Categories</span>
              </span>
            </div>
            <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleOpenCatModal(c)}
                  className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 p-3 rounded-xl flex items-center space-x-3 shrink-0 cursor-pointer group transition"
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                    {c.image ? (
                      <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition">
                      {c.name}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {(c as any)._count?.products || 0} items
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search Toolbar */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by title, SKU, or category..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Products List DataTable */}
          <DataTable
            columns={columns}
            data={filteredProducts}
            isLoading={isLoading}
            loadingMessage="Loading products catalog..."
            emptyMessage="No products found."
          />
        </main>
      </div>

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <ProductModal
          product={editProduct}
          categories={categories}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            refreshProducts();
          }}
        />
      )}

      {/* Add/Edit Category Modal */}
      {isCatModalOpen && (
        <CategoryModal
          category={editCategory}
          onClose={() => setIsCatModalOpen(false)}
          onSuccess={() => {
            setIsCatModalOpen(false);
            refreshCategories();
            refreshProducts();
          }}
        />
      )}

      {/* Delete Product Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen && !!deletingProduct}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDeleteProduct}
        isLoading={isDeleting}
        errorMsg={deleteErrorMsg}
        title="Delete Product Item?"
        description={
          deletingProduct ? (
            <>
              Are you sure you want to delete <span className="text-slate-200 font-bold">{deletingProduct.name}</span>? This action cannot be undone.
            </>
          ) : undefined
        }
        confirmText="Delete Product"
      />
    </div>
  );
}

function ProductModal({
  product,
  categories,
  onClose,
  onSuccess,
}: {
  product: any;
  categories: any[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      SKU: product?.SKU || '',
      categoryId: product?.categoryId || '',
      basePrice: product?.basePrice !== undefined ? product.basePrice : ('' as any),
      costPrice: product?.costPrice ?? 0,
      stock: product?.stock ?? 100,
      minStock: product?.minStock ?? 10,
      description: product?.description || '',
      image: product?.image || '',
      isPizza: product?.isPizza ?? false,
    },
  });

  const onSave = async (values: ProductFormValues) => {
    setFormError('');
    try {
      const payload = {
        name: values.name,
        SKU: values.SKU,
        categoryId: values.categoryId,
        basePrice: values.basePrice,
        costPrice: values.costPrice,
        stock: values.stock,
        minStock: values.minStock,
        description: values.description,
        image: values.image,
        isPizza: values.isPizza,
      };

      let res;
      if (product) {
        res = await fetch('/api/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: product.id, ...payload }),
        });
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to save product');
        return;
      }
      onSuccess();
    } catch (e) {
      setFormError('Network error saving product');
    }
  };

  const onInvalid = () => {
    setFormError('Please fill in all required product fields correctly');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 my-8">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="text-base font-bold text-slate-100">
            {product ? 'Edit Product Catalog Item' : 'Add New Product Item'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {formError && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSave, onInvalid)} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">Product Name *</label>
              <Input
                type="text"
                {...register('name')}
                placeholder="e.g. Chicken Fajita Pizza"
                error={!!errors.name}
              />
              {errors.name && (
                <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">SKU *</label>
              <Input
                type="text"
                {...register('SKU')}
                placeholder="e.g. PIZ-FAJ-01"
                className="font-mono"
                error={!!errors.SKU}
              />
              {errors.SKU && (
                <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.SKU.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">Category *</label>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger error={!!errors.categoryId}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoryId && (
                <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.categoryId.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">Base Price (Rs.) *</label>
              <Input
                type="number"
                step="0.01"
                {...register('basePrice')}
                className="font-mono"
                error={!!errors.basePrice}
              />
              {errors.basePrice && (
                <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.basePrice.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">Cost Price (Rs.)</label>
              <Input
                type="number"
                step="0.01"
                {...register('costPrice')}
                className="font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">Stock</label>
              <Input
                type="number"
                {...register('stock')}
                className="font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">Min Stock</label>
              <Input
                type="number"
                {...register('minStock')}
                className="font-mono"
              />
            </div>
          </div>

          {/* Product Image Upload Component */}
          <div>
            <Controller
              name="image"
              control={control}
              render={({ field }) => (
                <ImageUploadInput
                  label="Product Image"
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="https://images.unsplash.com/..."
                  helpText="Upload a product photo from device or enter an image URL."
                />
              )}
            />
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="isPizza"
              {...register('isPizza')}
              className="rounded border-slate-800 text-amber-500 focus:ring-amber-500"
            />
            <label htmlFor="isPizza" className="text-xs font-semibold text-slate-300 cursor-pointer">
              Is Pizza (triggers Pizza Customizer modal on POS click)
            </label>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CategoryModal({
  category,
  onClose,
  onSuccess,
}: {
  category: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [catError, setCatError] = useState('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
      image: category?.image || '',
    },
  });

  const onSave = async (values: CategoryFormValues) => {
    setCatError('');
    try {
      const slug = values.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const payload = {
        name: values.name,
        slug,
        description: values.description,
        image: values.image,
      };

      let res;
      if (category) {
        res = await fetch('/api/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: category.id, ...payload }),
        });
      } else {
        res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setCatError(data.error || 'Failed to save category');
        return;
      }
      onSuccess();
    } catch (e) {
      setCatError('Network error saving category');
    }
  };

  const onInvalid = () => {
    setCatError('Please enter a valid category name');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4 my-8">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="text-base font-bold text-slate-100">
            {category ? 'Edit Category Details & Image' : 'Create New Category'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {catError && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{catError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSave, onInvalid)} className="space-y-4" noValidate>
          <div>
            <label className="block text-xs text-slate-300 font-semibold mb-1">Category Name *</label>
            <Input
              type="text"
              {...register('name')}
              placeholder="e.g. Gourmet Pizzas, Beverages, Side Orders"
              error={!!errors.name}
            />
            {errors.name && (
              <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs text-slate-300 font-semibold mb-1">Description</label>
            <Textarea
              rows={2}
              {...register('description')}
              placeholder="Category description..."
            />
          </div>

          {/* Category Image Upload Component */}
          <div>
            <Controller
              name="image"
              control={control}
              render={({ field }) => (
                <ImageUploadInput
                  label="Category Image"
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="https://images.unsplash.com/..."
                  helpText="Upload a category icon/image or paste an image URL."
                />
              )}
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Category'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
