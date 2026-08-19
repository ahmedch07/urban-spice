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
import { Textarea } from '@/components/ui/textarea';
import { DataTable } from '@/components/ui/data-table';
import { DeleteConfirmModal } from '@/components/ui/delete-confirm-modal';
import {
  getFlavorColumns,
  getSizeColumns,
  getCrustColumns,
  getToppingColumns,
} from '@/columns';
import { Pizza, Plus, X, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useApp } from '@/context/AppContext';

const flavorSchema = z.object({
  name: z.string().min(1, 'Flavor name is required'),
  description: z.string().optional(),
  image: z.string().optional(),
  sortOrder: z.coerce.number().default(0),
});

type FlavorFormValues = z.infer<typeof flavorSchema>;

const sizeSchema = z.object({
  name: z.string().min(1, 'Size name is required'),
  code: z.string().min(1, 'Code is required'),
  sortOrder: z.coerce.number().default(0),
});

type SizeFormValues = z.infer<typeof sizeSchema>;

const genericItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  additionalPrice: z.coerce.number().min(0, 'Price must be non-negative'),
  stock: z.coerce.number().optional().default(100),
  active: z.boolean().default(true),
});

type GenericItemFormValues = z.infer<typeof genericItemSchema>;

import { useRouter } from 'next/navigation';

export default function PizzaManagementPage() {
  const router = useRouter();
  const { currentUser, pizzaConfig, refreshPizzaConfig, isGlobalLoading } = useApp();
  const [activeTab, setActiveTab] = useState<'flavors' | 'sizes' | 'crusts' | 'toppings'>('flavors');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isGlobalLoading && currentUser && currentUser.role === 'CASHIER') {
      toast.error('Access Denied: Cashier accounts cannot access Pizza Management');
      router.replace('/pos');
    }
  }, [currentUser, isGlobalLoading, router]);

  const [flavors, setFlavors] = useState<any[]>(() => pizzaConfig?.flavors || []);
  const [sizes, setSizes] = useState<any[]>(() => pizzaConfig?.sizes || []);
  const [crusts, setCrusts] = useState<any[]>(() => pizzaConfig?.crusts || []);
  const [toppings, setToppings] = useState<any[]>(() => pizzaConfig?.toppings || []);

  useEffect(() => {
    if (pizzaConfig) {
      setFlavors(pizzaConfig.flavors || []);
      setSizes(pizzaConfig.sizes || []);
      setCrusts(pizzaConfig.crusts || []);
      setToppings(pizzaConfig.toppings || []);
    }
  }, [pizzaConfig]);

  // Modal States
  const [isFlavorModalOpen, setIsFlavorModalOpen] = useState(false);
  const [editFlavor, setEditFlavor] = useState<any>(null);

  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [editSizeItem, setEditSizeItem] = useState<any>(null);

  const [isGenericModalOpen, setIsGenericModalOpen] = useState(false);
  const [genericType, setGenericType] = useState<'crust' | 'topping'>('crust');
  const [genericItem, setGenericItem] = useState<any>(null);

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'flavor' | 'size' | 'crust' | 'topping';
    id: string;
    name?: string;
  } | null>(null);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    refreshPizzaConfig();
  }, [refreshPizzaConfig]);

  const fetchAllData = async () => {
    await refreshPizzaConfig();
  };

  // Flavor Handlers
  const handleOpenFlavorModal = (flavor: any = null) => {
    setEditFlavor(flavor);
    setIsFlavorModalOpen(true);
  };

  const handleOpenDeleteFlavor = (id: string) => {
    const f = flavors.find((item) => item.id === id);
    setDeleteErrorMsg('');
    setDeleteTarget({ type: 'flavor', id, name: f?.name });
  };

  // Size Handlers
  const handleOpenSizeModal = (size: any = null) => {
    setEditSizeItem(size);
    setIsSizeModalOpen(true);
  };

  const handleOpenDeleteSize = (id: string) => {
    const s = sizes.find((item) => item.id === id);
    setDeleteErrorMsg('');
    setDeleteTarget({ type: 'size', id, name: s?.name });
  };

  // Generic Crust/Topping Handlers
  const handleOpenGenericModal = (type: 'crust' | 'topping', item: any = null) => {
    setGenericType(type);
    setGenericItem(item);
    setIsGenericModalOpen(true);
  };

  const handleOpenDeleteGeneric = (type: 'crust' | 'topping', id: string) => {
    const item = (type === 'crust' ? crusts : toppings).find((it) => it.id === id);
    setDeleteErrorMsg('');
    setDeleteTarget({ type, id, name: item?.name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteErrorMsg('');
    try {
      let endpoint = '';
      if (deleteTarget.type === 'flavor') endpoint = `/api/pizza-management/flavors?id=${deleteTarget.id}`;
      else if (deleteTarget.type === 'size') endpoint = `/api/pizza-management/sizes?id=${deleteTarget.id}`;
      else if (deleteTarget.type === 'crust') endpoint = `/api/pizza-management/crusts?id=${deleteTarget.id}`;
      else if (deleteTarget.type === 'topping') endpoint = `/api/pizza-management/toppings?id=${deleteTarget.id}`;

      const res = await fetch(endpoint, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        setDeleteErrorMsg(data.error || `Failed to delete ${deleteTarget.type}`);
        setIsDeleting(false);
        return;
      }
      setDeleteTarget(null);
      fetchAllData();
    } catch (e) {
      setDeleteErrorMsg('Network error deleting item');
    } finally {
      setIsDeleting(false);
    }
  };

  const flavorColumns = useMemo(
    () =>
      getFlavorColumns({
        sizes,
        onEdit: handleOpenFlavorModal,
        onDelete: handleOpenDeleteFlavor,
      }),
    [sizes, flavors]
  );

  const sizeColumns = useMemo(
    () =>
      getSizeColumns({
        onEdit: handleOpenSizeModal,
        onDelete: handleOpenDeleteSize,
      }),
    [sizes]
  );

  const crustColumns = useMemo(
    () =>
      getCrustColumns({
        onEdit: (c) => handleOpenGenericModal('crust', c),
        onDelete: (id) => handleOpenDeleteGeneric('crust', id),
      }),
    [crusts]
  );

  const toppingColumns = useMemo(
    () =>
      getToppingColumns({
        onEdit: (t) => handleOpenGenericModal('topping', t),
        onDelete: (id) => handleOpenDeleteGeneric('topping', id),
      }),
    [toppings]
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar userRole={currentUser?.role} userName={currentUser?.name} userEmail={currentUser?.email} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar title="Pizza Flavors, Multi-Sizes, Crusts & Toppings Config" />

        <main className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
          {/* Top Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0">
                <Pizza className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-slate-100">Pizza Engine Configuration</h2>
                <p className="text-[11px] sm:text-xs text-slate-400">
                  Configure size-wise pricing matrix, flavors, gourmet crusts, and extra toppings.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              {activeTab === 'flavors' && (
                <Button
                  variant="default"
                  onClick={() => handleOpenFlavorModal()}
                  className="space-x-1.5 w-full sm:w-auto justify-center"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Pizza Flavor</span>
                </Button>
              )}
              {activeTab === 'sizes' && (
                <Button
                  variant="default"
                  onClick={() => handleOpenSizeModal()}
                  className="space-x-1.5 w-full sm:w-auto justify-center"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Pizza Size</span>
                </Button>
              )}
              {activeTab === 'crusts' && (
                <Button
                  variant="default"
                  onClick={() => handleOpenGenericModal('crust')}
                  className="space-x-1.5 w-full sm:w-auto justify-center"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Crust Type</span>
                </Button>
              )}
              {activeTab === 'toppings' && (
                <Button
                  variant="default"
                  onClick={() => handleOpenGenericModal('topping')}
                  className="space-x-1.5 w-full sm:w-auto justify-center"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Topping</span>
                </Button>
              )}
            </div>
          </div>

          {/* Navigation Tabs (Responsive) */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none">
            {[
              { key: 'flavors', fullLabel: 'Pizza Flavors & Size Matrix', shortLabel: 'Flavors & Sizes', count: flavors.length },
              { key: 'sizes', fullLabel: 'Pizza Sizes', shortLabel: 'Sizes', count: sizes.length },
              { key: 'crusts', fullLabel: 'Crust Types', shortLabel: 'Crusts', count: crusts.length },
              { key: 'toppings', fullLabel: 'Extra Toppings', shortLabel: 'Toppings', count: toppings.length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 sm:space-x-2 shrink-0 whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                }`}
              >
                <span className="hidden sm:inline">{tab.fullLabel}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                    activeTab === tab.key ? 'bg-slate-950 text-amber-400 font-bold' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* TAB 1: FLAVORS */}
          {activeTab === 'flavors' && (
            <DataTable
              columns={flavorColumns}
              data={flavors}
              isLoading={isLoading}
              loadingMessage="Loading flavors..."
              emptyMessage="No pizza flavors found."
            />
          )}

          {/* TAB 2: SIZES */}
          {activeTab === 'sizes' && (
            <DataTable
              columns={sizeColumns}
              data={sizes}
              isLoading={isLoading}
              loadingMessage="Loading pizza sizes..."
              emptyMessage="No pizza sizes configured."
            />
          )}

          {/* TAB 3: CRUSTS */}
          {activeTab === 'crusts' && (
            <DataTable
              columns={crustColumns}
              data={crusts}
              isLoading={isLoading}
              loadingMessage="Loading crusts..."
              emptyMessage="No crust types found."
            />
          )}

          {/* TAB 4: TOPPINGS */}
          {activeTab === 'toppings' && (
            <DataTable
              columns={toppingColumns}
              data={toppings}
              isLoading={isLoading}
              loadingMessage="Loading toppings..."
              emptyMessage="No toppings found."
            />
          )}
        </main>
      </div>

      {/* Add/Edit Flavor Modal */}
      {isFlavorModalOpen && (
        <FlavorModal
          flavor={editFlavor}
          sizes={sizes}
          onClose={() => setIsFlavorModalOpen(false)}
          onSuccess={() => {
            setIsFlavorModalOpen(false);
            fetchAllData();
          }}
        />
      )}

      {/* Add/Edit Size Modal */}
      {isSizeModalOpen && (
        <SizeModal
          sizeItem={editSizeItem}
          onClose={() => setIsSizeModalOpen(false)}
          onSuccess={() => {
            setIsSizeModalOpen(false);
            fetchAllData();
          }}
        />
      )}

      {/* Generic Crust/Topping Modal */}
      {isGenericModalOpen && (
        <GenericCrustToppingModal
          type={genericType}
          item={genericItem}
          onClose={() => setIsGenericModalOpen(false)}
          onSuccess={() => {
            setIsGenericModalOpen(false);
            fetchAllData();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        errorMsg={deleteErrorMsg}
        title={`Delete Pizza ${deleteTarget?.type ? deleteTarget.type.charAt(0).toUpperCase() + deleteTarget.type.slice(1) : ''}?`}
        description={
          deleteTarget ? (
            <>
              Are you sure you want to delete this {deleteTarget.type}
              {deleteTarget.name ? <> (<strong className="text-slate-200">{deleteTarget.name}</strong>)</> : ''}? This action cannot be undone.
            </>
          ) : undefined
        }
        confirmText="Delete"
      />
    </div>
  );
}

function FlavorModal({
  flavor,
  sizes,
  onClose,
  onSuccess,
}: {
  flavor: any;
  sizes: any[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [flavorError, setFlavorError] = useState('');

  const defaultPrices: Record<string, number> = {};
  sizes.forEach((s, idx) => {
    const existing = flavor?.flavorPrices?.find((fp: any) => fp.sizeId === s.id);
    defaultPrices[s.id] = existing ? existing.price : 700 + idx * 300;
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: zodResolver(flavorSchema),
    defaultValues: {
      name: flavor?.name || '',
      description: flavor?.description || '',
      image: flavor?.image || '',
    },
  });

  const onSave = async (values: any) => {
    setFlavorError('');
    const pricesArray = Object.entries(values.prices).map(([sizeId, price]) => ({
      sizeId,
      price: Number(price) || 0,
    }));

    try {
      let res;
      if (flavor) {
        res = await fetch('/api/pizza-management/flavors', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: flavor.id,
            name: values.name,
            description: values.description,
            image: values.image,
            prices: pricesArray,
          }),
        });
      } else {
        res = await fetch('/api/pizza-management/flavors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: values.name,
            description: values.description,
            image: values.image,
            prices: pricesArray,
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setFlavorError(data.error || 'Failed to save pizza flavor');
        return;
      }
      onSuccess();
    } catch (e) {
      setFlavorError('Network error saving flavor');
    }
  };

  const onInvalid = () => {
    setFlavorError('Please enter a valid flavor name and prices');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-base font-bold text-slate-100">
            {flavor ? 'Edit Pizza Flavor & Size Prices' : 'Add New Pizza Flavor'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {flavorError && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{flavorError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSave, onInvalid)} className="space-y-4" noValidate>
          <div>
            <label className="block text-xs text-slate-300 font-semibold mb-1">Pizza Flavor Name *</label>
            <Input
              type="text"
              {...register('name')}
              placeholder="e.g. Chicken Tikka Special"
              error={!!errors.name}
            />
            {errors.name?.message && (
              <p className="text-[11px] text-red-400 mt-1 font-medium">{String(errors.name.message)}</p>
            )}
          </div>

          <div>
            <label className="block text-xs text-slate-300 font-semibold mb-1">Flavor Description</label>
            <Textarea
              rows={2}
              {...register('description')}
              placeholder="Ingredients, toppings, spicy level..."
            />
          </div>

          <div>
            <Controller
              name="image"
              control={control}
              render={({ field }) => (
                <ImageUploadInput
                  label="Pizza Flavor Image"
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="https://images.unsplash.com/..."
                  helpText="Upload a flavor photo from device or paste an image URL."
                />
              )}
            />
          </div>

          {/* Set Size Prices */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="block text-xs text-amber-400 font-bold uppercase">Configure Price per Size (Rs.)</label>
              <span className="text-[11px] text-slate-500">Edit values below</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {sizes.map((s) => (
                <div key={s.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-bold block mb-1">
                    {s.name} ({s.code})
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`prices.${s.id}` as any)}
                    className="font-mono"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
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
              {isSubmitting ? 'Saving...' : 'Save Flavor'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SizeModal({
  sizeItem,
  onClose,
  onSuccess,
}: {
  sizeItem: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [sizeError, setSizeError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: zodResolver(sizeSchema),
    defaultValues: {
      name: sizeItem?.name || '',
      code: sizeItem?.code || '',
      sortOrder: sizeItem?.sortOrder ?? 0,
    },
  });

  const onSave = async (values: any) => {
    setSizeError('');
    try {
      let res;
      if (sizeItem) {
        res = await fetch('/api/pizza-management/sizes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: sizeItem.id,
            name: values.name,
            code: values.code.toUpperCase(),
            sortOrder: values.sortOrder,
          }),
        });
      } else {
        res = await fetch('/api/pizza-management/sizes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: values.name,
            code: values.code.toUpperCase(),
            sortOrder: values.sortOrder,
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setSizeError(data.error || 'Failed to save size');
        return;
      }
      onSuccess();
    } catch (e) {
      setSizeError('Network error saving size');
    }
  };

  const onInvalid = () => {
    setSizeError('Please enter size name and abbreviation code');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-base font-bold text-slate-100">
            {sizeItem ? 'Edit Pizza Size' : 'Add New Pizza Size'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {sizeError && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{sizeError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSave, onInvalid)} className="space-y-4" noValidate>
          <div>
            <label className="block text-xs text-slate-300 font-semibold mb-1">Size Name *</label>
            <Input
              type="text"
              {...register('name')}
              placeholder="e.g. Small, Medium, Large, Jumbo, Party"
              error={!!errors.name}
            />
            {errors.name?.message && (
              <p className="text-[11px] text-red-400 mt-1 font-medium">{String(errors.name.message)}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">Code / Abbr *</label>
              <Input
                type="text"
                {...register('code')}
                placeholder="e.g. S, M, L, XL, XXL"
                className="font-mono uppercase"
                error={!!errors.code}
              />
              {errors.code?.message && (
                <p className="text-[11px] text-red-400 mt-1 font-medium">{String(errors.code.message)}</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">Sort Order</label>
              <Input
                type="number"
                {...register('sortOrder')}
                className="font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
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
              {isSubmitting ? 'Saving...' : 'Save Size'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GenericCrustToppingModal({
  type,
  item,
  onClose,
  onSuccess,
}: {
  type: 'crust' | 'topping';
  item: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [genericError, setGenericError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: zodResolver(genericItemSchema),
    defaultValues: {
      name: item?.name || '',
      additionalPrice: item?.additionalPrice ?? 0,
      stock: item?.stock ?? 500,
    },
  });

  const onSave = async (values: any) => {
    setGenericError('');
    try {
      const endpoint = type === 'crust' ? '/api/pizza-management/crusts' : '/api/pizza-management/toppings';
      const payload = {
        name: values.name,
        additionalPrice: values.additionalPrice,
        ...(type === 'topping' ? { stock: values.stock } : {}),
      };

      let res;
      if (item) {
        res = await fetch(endpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.id, ...payload }),
        });
      } else {
        res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setGenericError(data.error || `Failed to save ${type}`);
        return;
      }
      onSuccess();
    } catch (e) {
      setGenericError(`Network error saving ${type}`);
    }
  };

  const onInvalid = () => {
    setGenericError(`Please enter a valid ${type} name and price`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-base font-bold text-slate-100 capitalize">
            {item ? 'Edit' : 'Add'} {type}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {genericError && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{genericError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSave, onInvalid)} className="space-y-3" noValidate>
          <div>
            <label className="block text-xs text-slate-300 font-semibold mb-1">Name *</label>
            <Input
              type="text"
              {...register('name')}
              error={!!errors.name}
            />
            {errors.name?.message && (
              <p className="text-[11px] text-red-400 mt-1 font-medium">{String(errors.name.message)}</p>
            )}
          </div>

          <div>
            <label className="block text-xs text-slate-300 font-semibold mb-1">Additional Price (Rs.)</label>
            <Input
              type="number"
              step="0.01"
              {...register('additionalPrice')}
              className="font-mono"
            />
          </div>

          {type === 'topping' && (
            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">Stock Quantity</label>
              <Input
                type="number"
                {...register('stock')}
                className="font-mono"
              />
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
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
              {isSubmitting ? 'Saving...' : 'Save Item'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
