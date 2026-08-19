'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { DeleteConfirmModal } from '@/components/ui/delete-confirm-modal';
import { toast } from '@/components/ui/sonner';
import { topProductColumns, salesOrderColumns } from '@/columns';
import { Download, RotateCcw } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

import { useApp } from '@/context/AppContext';

export default function ReportsPage() {
  const { currentUser } = useApp();
  const [period, setPeriod] = useState<any>('today');
  const [reportData, setReportData] = useState<any>({
    totalSales: 0,
    totalOrders: 0,
    totalDiscount: 0,
    totalTax: 0,
    cashSales: 0,
    cardSales: 0,
    pendingPayments: 0,
    averageOrderValue: 0,
    topProducts: [],
    recentOrders: [],
    paymentBreakdown: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  // Start New Day Modal
  const [isNewDayModalOpen, setIsNewDayModalOpen] = useState(false);
  const [newDayError, setNewDayError] = useState('');
  const [isStartingDay, setIsStartingDay] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [period]);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reports?period=${period}`);
      const data = await res.json();
      setReportData(data);
    } catch {
      toast.error('Failed to load financial reports');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmStartNewDay = async () => {
    setIsStartingDay(true);
    setNewDayError('');
    try {
      const res = await fetch('/api/reports', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start sales day');
      setIsNewDayModalOpen(false);
      setPeriod('today');
      await fetchReports();
    } catch (error: any) {
      setNewDayError(error.message || 'Failed to start sales day');
    } finally {
      setIsStartingDay(false);
    }
  };

  const handleExportCSV = () => {
    if (!reportData?.topProducts) return;
    const headers = 'Product Name,Quantity Sold,Total Revenue (PKR)\n';
    const rows = reportData.topProducts.map((p: any) => `"${p.name}",${p.quantity},${p.total}`).join('\n');
    const csvContent = 'data:text/csv;charset=utf-8,' + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pizza_sales_report_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar userRole={currentUser?.role} userName={currentUser?.name} userEmail={currentUser?.email} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar title="Sales Analytics & Financial Reports" />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center justify-between sm:justify-start gap-1 sm:gap-2 bg-slate-950/70 p-1 rounded-2xl border border-slate-800/80">
              {['today', 'week', 'month', 'year'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all text-center ${
                    period === p
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <Button
              variant="default"
              onClick={() => {
                setNewDayError('');
                setIsNewDayModalOpen(true);
              }}
              disabled={isStartingDay}
              className="space-x-1.5 w-full sm:w-auto justify-center"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start New Day (Reset Daily)</span>
            </Button>
          </div>

          {/* Metric Cards */}
          {reportData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <span className="text-xs text-slate-400 uppercase font-semibold">Total Revenue</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">
                  {formatCurrency(reportData.metrics?.totalRevenue || 0)}
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <span className="text-xs text-slate-400 uppercase font-semibold">Total Orders</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono">
                  {reportData.metrics?.totalOrders || 0}
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <span className="text-xs text-slate-400 uppercase font-semibold">Average Order Value</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-mono">
                  {formatCurrency(reportData.metrics?.averageOrderValue || 0)}
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <span className="text-xs text-slate-400 uppercase font-semibold">Estimated Net Profit</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                  {formatCurrency(reportData.metrics?.estimatedProfit || 0)}
                </div>
              </div>
            </div>
          )}

          {/* Top Products breakdown table */}
          {reportData?.topProducts && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-bold text-base text-slate-100">Product Sales Summary</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  className="space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </Button>
              </div>
              <DataTable
                columns={topProductColumns}
                data={reportData.topProducts}
                isLoading={isLoading}
                emptyMessage="No product sales records in this period."
              />
            </div>
          )}

          {/* All Orders in Period table */}
          {reportData?.salesOrders && (
            <div className="space-y-3">
              <h3 className="font-bold text-base text-slate-100 px-1">All Orders in Selected Period</h3>
              <DataTable
                columns={salesOrderColumns}
                data={reportData.salesOrders}
                isLoading={isLoading}
                emptyMessage="No orders in this period."
              />
            </div>
          )}
        </main>
      </div>

      {/* Start New Sales Day Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isNewDayModalOpen}
        onClose={() => setIsNewDayModalOpen(false)}
        onConfirm={handleConfirmStartNewDay}
        isLoading={isStartingDay}
        errorMsg={newDayError}
        title="Start New Sales Day?"
        description="Are you sure you want to initialize and start a fresh sales day? Today's transactions will be archived."
        confirmText="Start New Day"
        variant="warning"
      />
    </div>
  );
}
