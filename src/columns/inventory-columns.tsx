import { ColumnDef } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

interface InventoryColumnsProps {
  onAdjust: (item: any) => void;
}

export function getInventoryColumns({ onAdjust }: InventoryColumnsProps): ColumnDef<any>[] {
  return [
    {
      header: 'Raw Item',
      accessorKey: 'name',
      className: 'font-bold text-slate-100',
    },
    {
      header: 'SKU',
      accessorKey: 'SKU',
      className: 'font-mono text-slate-400',
    },
    {
      header: 'Current Stock',
      cell: (item) => {
        const isLow = item.currentStock <= item.minStock;
        return (
          <span
            className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${
              isLow
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}
          >
            {item.currentStock} {item.unit}
          </span>
        );
      },
    },
    {
      header: 'Min Threshold',
      cell: (item) => (
        <span className="font-mono text-slate-400">
          {item.minStock} {item.unit}
        </span>
      ),
    },
    {
      header: 'Unit Cost',
      cell: (item) => (
        <span className="font-mono text-slate-300">
          {formatCurrency(item.costPerUnit)}
        </span>
      ),
    },
    {
      header: 'Supplier',
      cell: (item) => (
        <span className="text-slate-400">{item.supplier || '-'}</span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (item) => (
        <div className="flex items-center justify-end">
          <Button
            variant="default"
            size="sm"
            onClick={() => onAdjust(item)}
          >
            Adjust Stock
          </Button>
        </div>
      ),
    },
  ];
}
