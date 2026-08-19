import { ColumnDef } from '@/components/ui/data-table';
import { formatCurrency, formatDate } from '@/lib/utils';

export const topProductColumns: ColumnDef<any>[] = [
  {
    header: 'Product',
    accessorKey: 'name',
    className: 'font-bold text-slate-100',
  },
  {
    header: 'Units Sold',
    accessorKey: 'quantity',
    className: 'font-mono font-bold text-amber-400',
  },
  {
    header: 'Total Revenue',
    cell: (p) => (
      <span className="font-mono font-bold text-emerald-400">
        {formatCurrency(p.total)}
      </span>
    ),
  },
];

export const salesOrderColumns: ColumnDef<any>[] = [
  {
    header: 'Invoice',
    accessorKey: 'invoiceNo',
    className: 'font-mono font-bold text-amber-400',
  },
  {
    header: 'Customer',
    cell: (o) => (
      <span className="text-slate-200">{o.customer?.name || 'Walk-in Customer'}</span>
    ),
  },
  {
    header: 'Type',
    accessorKey: 'orderType',
    className: 'text-slate-300',
  },
  {
    header: 'Payment',
    accessorKey: 'paymentMethod',
    className: 'text-slate-300',
  },
  {
    header: 'Status',
    accessorKey: 'status',
    className: 'text-slate-300 font-bold',
  },
  {
    header: 'Total',
    cell: (o) => (
      <span className="font-mono font-bold text-emerald-400">{formatCurrency(o.grandTotal)}</span>
    ),
  },
  {
    header: 'Date / Time',
    cell: (o) => (
      <span className="font-mono text-slate-400 text-[11px] whitespace-nowrap">
        {formatDate(o.createdAt)}
      </span>
    ),
  },
];
