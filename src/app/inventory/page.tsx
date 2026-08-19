'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { getInventoryColumns } from '@/columns';
import { toast } from '@/components/ui/sonner';
import { Boxes, Plus, AlertTriangle, RefreshCw, X, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const stockAdjustmentSchema = z.object({
  type: z.enum(['ADD', 'REMOVE', 'WASTE', 'ADJUSTMENT']),
  quantity: z.coerce.number().positive('Quantity must be greater than 0'),
  notes: z.string().optional(),
});

type StockAdjustmentFormValues = z.infer<typeof stockAdjustmentSchema>;

const newIngredientSchema = z.object({
  name: z.string().min(1, 'Ingredient name is required'),
  SKU: z.string().min(1, 'SKU is required'),
  unit: z.string().min(1, 'Unit is required'),
  currentStock: z.coerce.number().min(0, 'Current stock must be non-negative'),
  minStock: z.coerce.number().min(0, 'Min threshold must be non-negative'),
  costPerUnit: z.coerce.number().min(0, 'Cost per unit must be non-negative'),
  supplier: z.string().optional(),
});

type NewIngredientFormValues = z.infer<typeof newIngredientSchema>;

import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function InventoryPage() {
  const router = useRouter();
  const { currentUser, inventoryItems, refreshInventory, isGlobalLoading } = useApp();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isGlobalLoading && currentUser && currentUser.role === 'CASHIER') {
      toast.error('Access Denied: Cashier accounts cannot access Inventory Stock');
      router.replace('/pos');
    }
  }, [currentUser, isGlobalLoading, router]);

  // Stock Adjustment Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // New Raw Material Modal
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);

  useEffect(() => {
    refreshInventory();
  }, [refreshInventory]);

  const handleOpenAdjustment = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const columns = useMemo(
    () =>
      getInventoryColumns({
        onAdjust: handleOpenAdjustment,
      }),
    []
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar userRole={currentUser?.role} userName={currentUser?.name} userEmail={currentUser?.email} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar title="Real-Time Raw Inventory & Stock Management" />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header Action Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Boxes className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">Ingredient Stock & Recipe Inventory</h2>
                <p className="text-xs text-slate-400">
                  Stock levels auto-deduct when pizza or menu orders are prepared.
                </p>
              </div>
            </div>

            <Button
              variant="default"
              onClick={() => setIsNewItemModalOpen(true)}
              className="space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Raw Ingredient</span>
            </Button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between shadow">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase">Total Tracked Items</span>
                <div className="text-2xl font-black text-slate-100 font-mono mt-1">
                  {inventoryItems.length}
                </div>
              </div>
              <Boxes className="w-8 h-8 text-slate-600" />
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between shadow">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase">Low Stock Alerts</span>
                <div className="text-2xl font-black text-rose-400 font-mono mt-1">
                  {inventoryItems.filter((i) => i.currentStock <= i.minStock).length}
                </div>
              </div>
              <AlertTriangle className="w-8 h-8 text-rose-500/50" />
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between shadow">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase">Estimated Asset Value</span>
                <div className="text-2xl font-black text-amber-400 font-mono mt-1">
                  {formatCurrency(
                    inventoryItems.reduce((acc, curr) => acc + curr.currentStock * curr.costPerUnit, 0)
                  )}
                </div>
              </div>
              <span className="text-xs text-emerald-400 font-bold">In-Stock Value</span>
            </div>
          </div>

          {/* Inventory DataTable */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-bold text-sm text-slate-200">Stock Directory ({inventoryItems.length})</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refreshInventory()}
                className="space-x-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </Button>
            </div>

            <DataTable
              columns={columns}
              data={inventoryItems}
              isLoading={isLoading}
              loadingMessage="Loading inventory..."
              emptyMessage="No raw inventory items found. Add ingredients to track stock!"
            />
          </div>
        </main>
      </div>

      {/* Stock Adjustment Modal */}
      {isModalOpen && selectedItem && (
        <StockAdjustmentModal
          item={selectedItem}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            refreshInventory();
          }}
        />
      )}

      {/* New Ingredient Modal */}
      {isNewItemModalOpen && (
        <NewIngredientModal
          onClose={() => setIsNewItemModalOpen(false)}
          onSuccess={() => {
            setIsNewItemModalOpen(false);
            refreshInventory();
          }}
        />
      )}
    </div>
  );
}

function StockAdjustmentModal({
  item,
  onClose,
  onSuccess,
}: {
  item: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<StockAdjustmentFormValues>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      type: 'ADD',
      quantity: 1,
      notes: '',
    },
  });

  const onSave = async (values: StockAdjustmentFormValues) => {
    setErrorMsg('');
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'STOCK_TRANSACTION',
          inventoryItemId: item.id,
          type: values.type,
          quantity: values.quantity,
          notes: values.notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to adjust stock');
        return;
      }
      onSuccess();
    } catch (e) {
      setErrorMsg('Network error');
    }
  };

  const onInvalid = () => {
    setErrorMsg('Please enter a valid adjustment quantity');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100">
            Adjust Stock: <span className="text-amber-400">{item.name}</span>
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSave, onInvalid)} className="space-y-3" noValidate>
          <div>
            <label className="block text-xs text-slate-300 font-semibold mb-1">Transaction Type</label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select transaction type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADD">ADD (+) Purchase / Restock</SelectItem>
                    <SelectItem value="REMOVE">REMOVE (-) Usage</SelectItem>
                    <SelectItem value="WASTE">WASTE (-) Spoilage / Expired</SelectItem>
                    <SelectItem value="ADJUSTMENT">ADJUSTMENT (=) Set Exact Stock</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 font-semibold mb-1">
              Quantity ({item.unit}) *
            </label>
            <Input
              type="number"
              step="0.01"
              {...register('quantity')}
              className="font-mono font-bold"
              error={!!errors.quantity}
            />
            {errors.quantity && (
              <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.quantity.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs text-slate-300 font-semibold mb-1">Notes / Reason</label>
            <Input
              type="text"
              {...register('notes')}
              placeholder="e.g. Weekly Restock Invoice #884"
            />
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
              {isSubmitting ? 'Saving...' : 'Save Stock Change'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NewIngredientModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewIngredientFormValues>({
    resolver: zodResolver(newIngredientSchema),
    defaultValues: {
      name: '',
      SKU: '',
      unit: 'kg',
      currentStock: 50,
      minStock: 10,
      costPerUnit: 100,
      supplier: '',
    },
  });

  const onCreate = async (values: NewIngredientFormValues) => {
    setErrorMsg('');
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'CREATE_ITEM',
          name: values.name,
          SKU: values.SKU,
          unit: values.unit,
          currentStock: values.currentStock,
          minStock: values.minStock,
          costPerUnit: values.costPerUnit,
          supplier: values.supplier,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to create ingredient');
        return;
      }
      onSuccess();
    } catch (e) {
      setErrorMsg('Network error');
    }
  };

  const onInvalid = () => {
    setErrorMsg('Please fill in all ingredient fields correctly');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100">Add Raw Ingredient</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onCreate, onInvalid)} className="space-y-3" noValidate>
          <div>
            <label className="block text-xs text-slate-300 font-semibold mb-1">Ingredient Name *</label>
            <Input
              type="text"
              {...register('name')}
              placeholder="e.g. Cheddar Cheese Blocks"
              error={!!errors.name}
            />
            {errors.name && (
              <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">SKU *</label>
              <Input
                type="text"
                {...register('SKU')}
                className="font-mono"
                error={!!errors.SKU}
              />
              {errors.SKU && (
                <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.SKU.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">Unit (kg, l, pcs) *</label>
              <Input
                type="text"
                {...register('unit')}
                className="font-mono"
                error={!!errors.unit}
              />
              {errors.unit && (
                <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.unit.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">Initial Stock</label>
              <Input
                type="number"
                step="0.01"
                {...register('currentStock')}
                className="font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">Min Threshold</label>
              <Input
                type="number"
                step="0.01"
                {...register('minStock')}
                className="font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">Cost Per Unit (Rs.)</label>
              <Input
                type="number"
                step="0.01"
                {...register('costPerUnit')}
                className="font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">Supplier Name</label>
              <Input
                type="text"
                {...register('supplier')}
                placeholder="e.g. Metro Wholesale"
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
              {isSubmitting ? 'Saving...' : 'Add Ingredient'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
