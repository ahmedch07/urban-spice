import { ColumnDef } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, CheckCircle, XCircle, Edit2, Trash2 } from 'lucide-react';
import { RiderItem } from '@/lib/types';

interface RiderColumnsProps {
  onEdit: (rider: RiderItem) => void;
  onDelete: (rider: RiderItem) => void;
}

export function getRiderColumns({ onEdit, onDelete }: RiderColumnsProps): ColumnDef<RiderItem>[] {
  return [
    {
      header: 'Rider Name',
      cell: (r) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-amber-400 font-bold flex items-center justify-center text-xs">
            {r.name.substring(0, 2).toUpperCase()}
          </div>
          <span className="font-bold text-slate-100">{r.name}</span>
        </div>
      ),
    },
    {
      header: 'Contact Phone',
      cell: (r) => (
        <div className="flex items-center space-x-1.5 text-slate-300 font-mono">
          <Phone className="w-3.5 h-3.5 text-slate-500" />
          <span>{r.phone}</span>
        </div>
      ),
    },
    {
      header: 'Vehicle / Bike No',
      cell: (r) =>
        r.vehicleNo ? (
          <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-slate-300 font-bold font-mono text-[11px]">
            {r.vehicleNo}
          </span>
        ) : (
          <span className="text-slate-600 italic">Not specified</span>
        ),
    },
    {
      header: 'Duty Status',
      cell: (r) =>
        r.active ? (
          <Badge variant="success" className="space-x-1">
            <CheckCircle className="w-3 h-3" />
            <span>Active</span>
          </Badge>
        ) : (
          <Badge variant="destructive" className="space-x-1">
            <XCircle className="w-3 h-3" />
            <span>Inactive</span>
          </Badge>
        ),
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (r) => (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => onEdit(r)}
            title="Edit Rider"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="hover:bg-red-500/20 hover:text-red-400"
            onClick={() => onDelete(r)}
            title="Delete Rider"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];
}
