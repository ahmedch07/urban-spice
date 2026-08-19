import React from 'react';
import { ColumnDef } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, Edit2, Trash2, Check } from 'lucide-react';

interface EmployeeColumnsProps {
  onEdit: (emp: any) => void;
  onDelete: (emp: any) => void;
}

export function getEmployeeColumns({ onEdit, onDelete }: EmployeeColumnsProps): ColumnDef<any>[] {
  return [
    {
      header: 'Staff Name',
      cell: (emp) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-amber-400 font-bold flex items-center justify-center text-xs">
            {emp.name.substring(0, 2).toUpperCase()}
          </div>
          <span className="font-bold text-slate-100">{emp.name}</span>
        </div>
      ),
    },
    {
      header: 'Contact Details',
      cell: (emp) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-1.5 text-slate-300 font-mono">
            <Mail className="w-3.5 h-3.5 text-slate-500" />
            <span>{emp.email}</span>
          </div>
          {emp.phone && (
            <div className="flex items-center space-x-1.5 text-slate-400 font-mono text-[11px]">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>{emp.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Assigned Role',
      cell: (emp) => (
        <Badge
          variant={emp.role === 'ADMIN' ? 'destructive' : 'default'}
          className={emp.role === 'ADMIN' ? 'text-red-400' : 'text-blue-400 border-blue-500/30 bg-blue-500/10'}
        >
          {emp.role}
        </Badge>
      ),
    },
    {
      header: 'Account Status',
      cell: () => (
        <span className="flex items-center space-x-1.5 text-emerald-400 font-medium">
          <Check className="w-3.5 h-3.5" />
          <span>Active</span>
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (emp) => (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => onEdit(emp)}
            title="Edit Account"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="hover:bg-red-500/20 hover:text-red-400"
            onClick={() => onDelete(emp)}
            title="Delete Account"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];
}
