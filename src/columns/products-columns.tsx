import { ColumnDef } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Edit2, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ProductColumnsProps {
  onEdit: (product: any) => void;
  onDelete: (id: string) => void;
}

export function getProductColumns({ onEdit, onDelete }: ProductColumnsProps): ColumnDef<any>[] {
  return [
    {
      header: 'Item',
      cell: (p) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
            {p.image ? (
              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
            ) : (
              <Package className="w-5 h-5 text-slate-600" />
            )}
          </div>
          <div>
            <h4 className="font-bold text-slate-100">{p.name}</h4>
            <p className="text-[11px] text-slate-400 line-clamp-1 max-w-[240px]">
              {p.description || 'No description provided'}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'SKU',
      accessorKey: 'SKU',
      className: 'font-mono text-slate-400',
    },
    {
      header: 'Category',
      cell: (p) => (
        <Badge variant="secondary">
          {p.category?.name || 'Unassigned'}
        </Badge>
      ),
    },
    {
      header: 'Base Price',
      cell: (p) => (
        <span className="font-mono font-bold text-amber-400">
          {formatCurrency(p.basePrice)}
        </span>
      ),
    },
    {
      header: 'Stock',
      cell: (p) => <span className="font-mono text-slate-300">{p.stock}</span>,
    },
    {
      header: 'Type',
      cell: (p) =>
        p.isPizza ? (
          <Badge variant="default">
            Pizza (Multi-Size)
          </Badge>
        ) : (
          <Badge variant="secondary" className="border-blue-500/20 text-blue-400 bg-blue-500/10">
            Standard Item
          </Badge>
        ),
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (p) => (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => onEdit(p)}
            title="Edit Product"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="hover:bg-rose-500/20 hover:text-rose-400"
            onClick={() => onDelete(p.id)}
            title="Delete Product"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];
}
