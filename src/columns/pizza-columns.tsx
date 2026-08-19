import { ColumnDef } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pizza, Edit2, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface FlavorColumnsProps {
  sizes: any[];
  onEdit: (flavor: any) => void;
  onDelete: (id: string) => void;
}

export function getFlavorColumns({ sizes, onEdit, onDelete }: FlavorColumnsProps): ColumnDef<any>[] {
  const cols: ColumnDef<any>[] = [
    {
      header: 'Flavor Name',
      cell: (f) => (
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
            {f.image ? (
              <img src={f.image} alt={f.name} className="w-full h-full object-cover" />
            ) : (
              <Pizza className="w-4 h-4 text-amber-500" />
            )}
          </div>
          <span className="font-bold text-slate-100">{f.name}</span>
        </div>
      ),
    },
    {
      header: 'Description',
      cell: (f) => (
        <span className="text-slate-400 line-clamp-1 max-w-[200px] block">
          {f.description || '-'}
        </span>
      ),
    },
  ];

  sizes.forEach((s) => {
    cols.push({
      header: `${s.name} (${s.code})`,
      align: 'center',
      cell: (f) => {
        const priceObj = f.flavorPrices?.find((fp: any) => fp.sizeId === s.id);
        return (
          <span className="font-mono font-bold text-amber-400">
            {priceObj ? formatCurrency(priceObj.price) : <span className="text-slate-600">-</span>}
          </span>
        );
      },
    });
  });

  cols.push({
    header: 'Actions',
    align: 'right',
    cell: (f) => (
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => onEdit(f)}
        >
          <Edit2 className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="hover:bg-rose-500/20 hover:text-rose-400"
          onClick={() => onDelete(f.id)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    ),
  });

  return cols;
}

interface SizeColumnsProps {
  onEdit: (size: any) => void;
  onDelete: (id: string) => void;
}

export function getSizeColumns({ onEdit, onDelete }: SizeColumnsProps): ColumnDef<any>[] {
  return [
    {
      header: 'Size Label',
      accessorKey: 'name',
      className: 'font-bold text-slate-100',
    },
    {
      header: 'Code / Abbr',
      cell: (s) => (
        <Badge variant="default" className="font-mono">
          {s.code}
        </Badge>
      ),
    },
    {
      header: 'Display Sort Order',
      cell: (s) => <span className="font-mono text-slate-400">#{s.sortOrder}</span>,
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (s) => (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => onEdit(s)}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="hover:bg-rose-500/20 hover:text-rose-400"
            onClick={() => onDelete(s.id)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];
}

interface GenericColumnsProps {
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
}

export function getCrustColumns({ onEdit, onDelete }: GenericColumnsProps): ColumnDef<any>[] {
  return [
    {
      header: 'Crust Name',
      accessorKey: 'name',
      className: 'font-bold text-slate-100',
    },
    {
      header: 'Extra Charge (Rs.)',
      cell: (c) => (
        <span className="font-mono font-bold text-amber-400">
          {c.additionalPrice > 0 ? `+${formatCurrency(c.additionalPrice)}` : 'Free'}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (c) => (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => onEdit(c)}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="hover:bg-rose-500/20 hover:text-rose-400"
            onClick={() => onDelete(c.id)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];
}

export function getToppingColumns({ onEdit, onDelete }: GenericColumnsProps): ColumnDef<any>[] {
  return [
    {
      header: 'Topping Name',
      accessorKey: 'name',
      className: 'font-bold text-slate-100',
    },
    {
      header: 'Extra Charge (Rs.)',
      cell: (t) => (
        <span className="font-mono font-bold text-amber-400">
          +{formatCurrency(t.additionalPrice)}
        </span>
      ),
    },
    {
      header: 'Stock Level',
      cell: (t) => (
        <span className="font-mono text-slate-300">{t.stock} servings</span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (t) => (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => onEdit(t)}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="hover:bg-rose-500/20 hover:text-rose-400"
            onClick={() => onDelete(t.id)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];
}
