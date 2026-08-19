import React from 'react';
import { ColumnDef } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface OrderColumnsProps {
  riders: any[];
  onUpdateRider: (orderId: string, riderId: string) => void;
  onUpdateStatus: (orderId: string, status: string) => void;
  onOpenReceipt: (order: any) => void;
}

export function getOrderColumns({
  riders,
  onUpdateRider,
  onUpdateStatus,
  onOpenReceipt,
}: OrderColumnsProps): ColumnDef<any>[] {
  return [
    {
      header: 'Invoice #',
      cell: (o) => (
        <span className="font-mono font-bold text-amber-400">{o.invoiceNo}</span>
      ),
    },
    {
      header: 'Customer',
      cell: (o) => (
        <div>
          <div className="font-bold text-slate-200">{o.customer?.name || 'Walk-in Customer'}</div>
          <div className="text-[10px] text-slate-500 font-mono">{o.customer?.phone || '-'}</div>
        </div>
      ),
    },
    {
      header: 'Type',
      cell: (o) => (
        <div>
          <span className="font-semibold text-slate-300">{o.orderType}</span>
          {o.tableNo && <div className="text-[10px] text-amber-400/80 font-mono">Table: {o.tableNo}</div>}
        </div>
      ),
    },
    {
      header: 'Assigned Rider',
      cell: (o) => {
        if (o.orderType !== 'DELIVERY') return <span className="text-slate-500 font-mono">-</span>;
        return (
          <div className="space-y-1 min-w-[140px]">
            {o.riderName ? (
              <div>
                <div className="font-bold text-emerald-400 text-xs">{o.riderName}</div>
                <div className="text-[10px] text-slate-400 font-mono">{o.riderPhone || '-'}</div>
              </div>
            ) : (
              <span className="text-amber-400 font-semibold italic text-[11px]">Unassigned</span>
            )}
            <select
              value={o.riderId || ''}
              onChange={(e) => onUpdateRider(o.id, e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-slate-300 focus:outline-none focus:border-amber-500 block w-full"
            >
              <option value="">Select Rider...</option>
              {riders.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.phone})
                </option>
              ))}
            </select>
          </div>
        );
      },
    },
    {
      header: 'Items',
      cell: (o) => (
        <div className="text-slate-300 line-clamp-1 max-w-[200px] font-medium">
          {o.items?.map((i: any) => `${i.quantity}x ${i.productName}`).join(', ')}
        </div>
      ),
    },
    {
      header: 'Grand Total',
      cell: (o) => (
        <span className="font-mono font-bold text-slate-100">{formatCurrency(o.grandTotal)}</span>
      ),
    },
    {
      header: 'Payment',
      accessorKey: 'paymentMethod',
      className: 'font-semibold text-slate-300',
    },
    {
      header: 'Status',
      cell: (o) => (
        <select
          value={o.status}
          onChange={(e) => onUpdateStatus(o.id, e.target.value)}
          className={`px-2 py-1 rounded text-[10px] font-extrabold uppercase border focus:outline-none bg-slate-950 ${
            o.status === 'COMPLETED'
              ? 'text-emerald-400 border-emerald-500/30'
              : o.status === 'CANCELLED' || o.status === 'REFUNDED'
              ? 'text-rose-400 border-rose-500/30'
              : 'text-amber-400 border-amber-500/30'
          }`}
        >
          <option value="PENDING">PENDING</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="PREPARING">PREPARING</option>
          <option value="READY">READY</option>
          <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
          <option value="REFUNDED">REFUNDED</option>
        </select>
      ),
    },
    {
      header: 'Date & Time',
      cell: (o) => (
        <span className="font-mono text-slate-400 text-[11px] whitespace-nowrap">
          {formatDate(o.createdAt)}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (o) => (
        <Button
          variant="secondary"
          size="icon"
          onClick={() => onOpenReceipt(o)}
          title="Print Receipt"
        >
          <Printer className="w-3.5 h-3.5 text-slate-300 hover:text-amber-400" />
        </Button>
      ),
    },
  ];
}
