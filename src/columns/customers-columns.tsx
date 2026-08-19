import { ColumnDef } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface CustomerColumnsProps {
  onOpenProfile: (customer: any) => void;
  onEdit: (customer: any) => void;
  onDelete: (customer: any) => void;
}

export function getCustomerColumns({
  onOpenProfile,
  onEdit,
  onDelete,
}: CustomerColumnsProps): ColumnDef<any>[] {
  return [
    {
      header: 'Customer Name',
      accessorKey: 'name',
      className: 'font-bold text-slate-100',
    },
    {
      header: 'Phone & WhatsApp',
      accessorKey: 'phone',
      className: 'font-mono text-slate-300',
    },
    {
      header: 'Delivery Address',
      cell: (c) => (
        <span className="text-slate-400 max-w-xs truncate block">
          {c.address || '-'}
        </span>
      ),
    },
    {
      header: 'Total Orders',
      cell: (c) => (
        <span className="font-mono font-bold text-amber-400">
          {c.totalOrders || 0}
        </span>
      ),
    },
    {
      header: 'Total Spent',
      cell: (c) => (
        <span className="font-mono font-bold text-emerald-400">
          {formatCurrency(c.totalSpent || 0)}
        </span>
      ),
    },
    {
      header: 'Last Order',
      cell: (c) => (
        <span className="font-mono text-slate-400 text-[11px]">
          {c.lastOrder ? formatDate(c.lastOrder) : 'No orders'}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (c) => (
        <div className="flex items-center justify-end space-x-1.5">
          <Button
            variant="default"
            size="sm"
            onClick={() => onOpenProfile(c)}
            className="space-x-1"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(c)}
          >
            Edit
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30"
            onClick={() => onDelete(c)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];
}
