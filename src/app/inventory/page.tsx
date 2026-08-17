'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { Boxes, Plus, AlertTriangle, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function InventoryPage() {
  const [currentUser, setCurrentUser] = useState<any>({ name: 'Admin', role: 'ADMIN' });
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Stock Adjustment Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [transType, setTransType] = useState<string>('ADD'); // ADD, REMOVE, WASTE, ADJUSTMENT
  const [quantity, setQuantity] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // New Raw Material Modal
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemSKU, setNewItemSKU] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('kg');
  const [newItemStock, setNewItemStock] = useState('50');
  const [newItemMinStock, setNewItemMinStock] = useState('10');
  const [newItemCost, setNewItemCost] = useState('100');
  const [newItemSupplier, setNewItemSupplier] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch(console.error);

    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      if (data.items) setInventoryItems(data.items);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdjustment = (item: any) => {
    setSelectedItem(item);
    setTransType('ADD');
    setQuantity('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !quantity) return;

    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'STOCK_TRANSACTION',
          inventoryItemId: selectedItem.id,
          type: transType,
          quantity: parseFloat(quantity),
          notes,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchInventory();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateNewItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'CREATE_ITEM',
          name: newItemName,
          SKU: newItemSKU,
          unit: newItemUnit,
          quantity: parseFloat(newItemStock),
          minStock: parseFloat(newItemMinStock),
          costPerUnit: parseFloat(newItemCost),
          supplier: newItemSupplier,
        }),
      });

      if (res.ok) {
        setIsNewItemModalOpen(false);
        fetchInventory();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar userRole={currentUser.role} userName={currentUser.name} userEmail={currentUser.email} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar title="Inventory & Ingredients Stock" />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Action Header */}
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
            <div className="flex items-center space-x-2">
              <Boxes className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-slate-100 text-base">Raw Ingredients & Supplies</h3>
            </div>

            <button
              onClick={() => {
                setNewItemSKU(`INV-RAW-${Math.floor(10 + Math.random() * 90)}`);
                setIsNewItemModalOpen(true);
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Raw Ingredient</span>
            </button>
          </div>

          {/* Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-4">Ingredient Name</th>
                    <th className="p-4">SKU</th>
                    <th className="p-4">Unit</th>
                    <th className="p-4">Current Stock</th>
                    <th className="p-4">Min Threshold</th>
                    <th className="p-4">Cost / Unit</th>
                    <th className="p-4">Supplier</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        Loading inventory data...
                      </td>
                    </tr>
                  ) : inventoryItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        No raw inventory items registered
                      </td>
                    </tr>
                  ) : (
                    inventoryItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 font-bold text-slate-200">{item.name}</td>
                        <td className="p-4 font-mono text-slate-400">{item.SKU}</td>
                        <td className="p-4 font-semibold text-amber-400">{item.unit}</td>
                        <td className="p-4 font-mono">
                          <span
                            className={`font-bold text-sm ${
                              item.currentStock <= item.minStock ? 'text-red-400' : 'text-slate-100'
                            }`}
                          >
                            {item.currentStock}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-slate-400">{item.minStock}</td>
                        <td className="p-4 font-mono text-slate-300">{formatCurrency(item.costPerUnit)}</td>
                        <td className="p-4 text-slate-400">{item.supplier || '-'}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleOpenAdjustment(item)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded-lg transition-colors"
                          >
                            Stock Adjust
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

      {/* Stock Adjustment Modal */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100">
              Adjust Stock: <span className="text-amber-400">{selectedItem.name}</span>
            </h3>

            <form onSubmit={handleSaveTransaction} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Transaction Type</label>
                <select
                  value={transType}
                  onChange={(e) => setTransType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-bold"
                >
                  <option value="ADD">ADD (+) Purchase / Restock</option>
                  <option value="REMOVE">REMOVE (-) Usage</option>
                  <option value="WASTE">WASTE (-) Spoilage / Expired</option>
                  <option value="ADJUSTMENT">ADJUSTMENT (=) Set Exact Stock</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  Quantity ({selectedItem.unit}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Notes / Reason</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Weekly Restock Invoice #884"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl">
                  Save Stock Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Ingredient Modal */}
      {isNewItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100">Add Raw Ingredient</h3>

            <form onSubmit={handleCreateNewItem} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Ingredient Name *</label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Cheddar Cheese Blocks"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    value={newItemSKU}
                    onChange={(e) => setNewItemSKU(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">Unit (kg, l, pcs) *</label>
                  <input
                    type="text"
                    required
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={newItemStock}
                    onChange={(e) => setNewItemStock(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">Min Threshold</label>
                  <input
                    type="number"
                    value={newItemMinStock}
                    onChange={(e) => setNewItemMinStock(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">Cost Per Unit (Rs.)</label>
                  <input
                    type="number"
                    value={newItemCost}
                    onChange={(e) => setNewItemCost(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">Supplier Name</label>
                  <input
                    type="text"
                    value={newItemSupplier}
                    onChange={(e) => setNewItemSupplier(e.target.value)}
                    placeholder="e.g. Metro Wholesale"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsNewItemModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl">
                  Create Ingredient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
