import { ColumnDef } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { Truck } from 'lucide-react';

interface RiderColumnsProps {
  onEdit: (rider: any) => void;
  onDelete: (rider: any) => void;
  onToggleActive: (rider: any) => void;
  canManage: boolean;
}

export function getRiderColumns({
  onEdit,
  onDelete,
  onToggleActive,
  canManage,
}: RiderColumnsProps): ColumnDef<any>[] {
  return [
    {
      header: 'Rider Name',
      accessorKey: 'name',
      className: 'font-bold text-slate-100',
    },
    {
      header: 'Phone Number',
      accessorKey: 'phone',
      className: 'font-mono text-slate-300',
    },
    {
      header: 'Vehicle Reg #',
      cell: (r) => (
        <span className="font-mono text-xs font-bold text-amber-400">
          {r.vehicleNo || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Availability',
      cell: (r) => (
        <Badge variant={r.active ? 'success' : 'secondary'}>
          {r.active ? 'Available' : 'Offline'}
        </Badge>
      ),
    },
    {
      header: 'Registered Date',
      cell: (r) => (
        <span className="font-mono text-slate-400 text-[11px] whitespace-nowrap">
          {r.createdAt ? formatDate(r.createdAt) : '-'}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (r) => (
        <div className="flex items-center justify-end space-x-1.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onToggleActive(r)}
            className="text-xs"
          >
            {r.active ? 'Set Offline' : 'Set Available'}
          </Button>

          {canManage && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit(r)}
              className="text-xs"
            >
              Edit
            </Button>
          )}

          {canManage && (
            <Button
              variant="secondary"
              size="sm"
              className="hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 text-xs"
              onClick={() => onDelete(r)}
            >
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];
}
