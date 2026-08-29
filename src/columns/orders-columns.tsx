import { ColumnDef } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Pencil, Printer, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface OrderColumnsProps {
  onUpdateStatus: (orderId: string, status: string) => void;
  onOpenReceipt: (order: any) => void;
  onEdit: (order: any) => void;
  onDelete: (order: any) => void;
  canManage: boolean;
}

export function getOrderColumns({
  onUpdateStatus,
  onOpenReceipt,
  onEdit,
  onDelete,
  canManage,
}: OrderColumnsProps): ColumnDef<any>[] {
  return [
    {
      header: 'Invoice #',
      cell: (o) => (
        <div className="space-y-1">
          <span className="font-mono font-bold text-amber-400">{o.invoiceNo}</span>
          {o.source === 'ONLINE' && <div className="w-fit rounded border border-sky-400/30 bg-sky-400/10 px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider text-sky-300">ONLINE</div>}
        </div>
      ),
    },
    {
      header: 'Customer',
      cell: (o) => (
        <div>
          <div className="font-bold text-slate-200">{o.customer?.name || 'Walk-in Guest'}</div>
          <div className="text-[10px] text-slate-500 font-mono">{o.customer?.phone || '-'}</div>
        </div>
      ),
    },
    {
      header: 'Table / Delivery',
      cell: (o) => (
        <div>
          <span className="font-semibold text-slate-300">
            {o.orderType === 'DINE_IN'
              ? 'Dine In'
              : o.orderType === 'DELIVERY'
              ? 'Delivery'
              : 'Takeaway'}
          </span>
          {o.tableNo && (
            <div className="text-[11px] font-bold text-amber-400 font-mono">
              {o.tableNo}
            </div>
          )}
          {o.riderName && (
            <div className="text-[10px] font-bold text-sky-400 font-mono">
              🏍 {o.riderName}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Payment Status',
      cell: (o) => {
        const isPaid = o.paymentStatus === 'PAID' || o.status === 'COMPLETED';
        return (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
              isPaid
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            }`}
          >
            {isPaid ? 'PAID' : 'UNPAID (Open)'}
          </span>
        );
      },
    },
    {
      header: 'Items',
      cell: (o) => (
        <div className="text-slate-300 line-clamp-1 max-w-[200px] font-medium text-xs">
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
      header: 'Method',
      accessorKey: 'paymentMethod',
      className: 'font-semibold text-slate-300 text-xs',
    },
    {
      header: 'Kitchen Status',
      cell: (o) => (
        <select
          value={o.status}
          onChange={(e) => onUpdateStatus(o.id, e.target.value)}
          className={`px-2 py-1 rounded-xl text-[10px] font-extrabold uppercase border focus:outline-none bg-slate-950 ${
            o.status === 'COMPLETED'
              ? 'text-emerald-400 border-emerald-500/30'
              : o.status === 'CANCELLED' || o.status === 'REFUNDED'
              ? 'text-rose-400 border-rose-500/30'
              : 'text-amber-400 border-amber-500/30'
          }`}
        >
          <option value="PENDING">PENDING</option>
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
        <div className="flex justify-end gap-1">
          <Button variant="secondary" size="icon" onClick={() => onOpenReceipt(o)} title="Print Receipt">
            <Printer className="w-3.5 h-3.5" />
          </Button>
          {canManage && (
            <Button variant="secondary" size="icon" onClick={() => onEdit(o)} title="Edit Order">
              <Pencil className="w-3.5 h-3.5 text-amber-400" />
            </Button>
          )}
          {canManage && (
            <Button variant="secondary" size="icon" onClick={() => onDelete(o)} title="Delete Order">
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            </Button>
          )}
        </div>
      ),
    },
  ];
}
