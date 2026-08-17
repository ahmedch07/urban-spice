'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { BarChart3, Download, Calendar, DollarSign, TrendingUp, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function ReportsPage() {
  const [currentUser, setCurrentUser] = useState<any>({ name: 'Admin', role: 'ADMIN' });
  const [period, setPeriod] = useState<string>('month');
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch(console.error);

    fetchReports();
  }, [period]);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reports?period=${period}`);
      const data = await res.json();
      setReportData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
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
      <Sidebar userRole={currentUser.role} userName={currentUser.name} userEmail={currentUser.email} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar title="Sales Analytics & Financial Reports" />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-2">
              {['today', 'week', 'month', 'year'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                    period === p
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>

          {reportData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <span className="text-xs text-slate-400 uppercase font-semibold">Total Revenue</span>
                <div className="text-3xl font-extrabold text-amber-400 font-mono">
                  {formatCurrency(reportData.metrics?.totalSales || 0)}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <span className="text-xs text-slate-400 uppercase font-semibold">Total Orders</span>
                <div className="text-3xl font-extrabold text-slate-100 font-mono">
                  {reportData.metrics?.totalOrders || 0}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                <span className="text-xs text-slate-400 uppercase font-semibold">Estimated Net Profit</span>
                <div className="text-3xl font-extrabold text-emerald-400 font-mono">
                  {formatCurrency(reportData.metrics?.estimatedProfit || 0)}
                </div>
              </div>
            </div>
          )}

          {/* Top Products breakdown table */}
          {reportData?.topProducts && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <h3 className="font-bold text-base text-slate-100">Product Sales Summary</h3>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase">
                  <tr>
                    <th className="p-3">Product</th>
                    <th className="p-3">Units Sold</th>
                    <th className="p-3">Total Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {reportData.topProducts.map((item: any, i: number) => (
                    <tr key={i}>
                      <td className="p-3 font-bold text-slate-100">{item.name}</td>
                      <td className="p-3 font-mono font-bold text-amber-400">{item.quantity}</td>
                      <td className="p-3 font-mono font-bold text-emerald-400">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
