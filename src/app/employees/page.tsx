'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { DeleteConfirmModal } from '@/components/ui/delete-confirm-modal';
import { getEmployeeColumns } from '@/columns';
import { UserCheck, Plus, Mail, Phone, Edit2, Trash2, Check, X, AlertTriangle, AlertCircle } from 'lucide-react';

const createEmployeeSchema = z.object({
  name: z.string().min(1, 'Employee name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  role: z.enum(['CASHIER', 'ADMIN', 'MANAGER']),
});

type CreateEmployeeFormValues = z.infer<typeof createEmployeeSchema>;

const editEmployeeSchema = z.object({
  name: z.string().min(1, 'Employee name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().optional(),
  role: z.enum(['CASHIER', 'ADMIN', 'MANAGER']),
});

type EditEmployeeFormValues = z.infer<typeof editEmployeeSchema>;

export default function EmployeesPage() {
  const [currentUser, setCurrentUser] = useState<any>({ name: 'Admin', role: 'ADMIN' });
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState<any>(null);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch(console.error);

    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      if (data.employees) setEmployees(data.employees);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (emp: any) => {
    setEditingEmployee(emp);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (emp: any) => {
    setDeletingEmployee(emp);
    setDeleteErrorMsg('');
    setIsDeleteModalOpen(true);
  };

  const handleDeleteEmployee = async () => {
    if (!deletingEmployee) return;
    setIsDeleting(true);
    setDeleteErrorMsg('');
    try {
      const res = await fetch(`/api/employees?id=${deletingEmployee.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        setDeleteErrorMsg(data.error || 'Failed to delete employee');
        setIsDeleting(false);
        return;
      }
      setIsDeleteModalOpen(false);
      fetchEmployees();
    } catch (e) {
      setDeleteErrorMsg('Network error');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = useMemo(
    () =>
      getEmployeeColumns({
        onEdit: openEditModal,
        onDelete: openDeleteModal,
      }),
    []
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar userRole={currentUser?.role} userName={currentUser?.name} userEmail={currentUser?.email} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar title="Staff & Access Management" />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header Action Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">Employee Accounts & Roles</h2>
                <p className="text-xs text-slate-400">Manage cashier and admin accounts for login access.</p>
              </div>
            </div>

            <Button
              variant="default"
              onClick={() => setIsModalOpen(true)}
              className="space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Staff</span>
            </Button>
          </div>

          {/* Employees List DataTable */}
          <DataTable
            columns={columns}
            data={employees}
            isLoading={isLoading}
            loadingMessage="Loading staff list..."
            emptyMessage='No employee accounts found. Click "Add New Staff" to create one.'
          />
        </main>
      </div>

      {/* Add Employee Modal */}
      {isModalOpen && (
        <CreateEmployeeModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchEmployees();
          }}
        />
      )}

      {/* Edit Employee Modal */}
      {isEditModalOpen && editingEmployee && (
        <EditEmployeeModal
          employee={editingEmployee}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            setIsEditModalOpen(false);
            fetchEmployees();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen && !!deletingEmployee}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteEmployee}
        isLoading={isDeleting}
        errorMsg={deleteErrorMsg}
        title="Delete Staff Account?"
        description={
          deletingEmployee ? (
            <>
              Are you sure you want to delete <span className="text-slate-200 font-bold">{deletingEmployee.name}</span> ({deletingEmployee.email})? This action cannot be undone.
            </>
          ) : undefined
        }
        confirmText="Delete Account"
      />
    </div>
  );
}

function CreateEmployeeModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateEmployeeFormValues>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'CASHIER',
    },
  });

  const onCreate = async (values: CreateEmployeeFormValues) => {
    setErrorMsg('');
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to create employee');
        return;
      }
      onSuccess();
    } catch (e) {
      setErrorMsg('Network error');
    }
  };

  const onInvalid = () => {
    setErrorMsg('Please fill in all required fields properly');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100">Add New Staff Account</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onCreate, onInvalid)} className="space-y-3" noValidate>
          <div>
            <label className="block text-xs text-slate-300 font-semibold mb-1">Employee Name *</label>
            <Input
              type="text"
              {...register('name')}
              error={!!errors.name}
            />
            {errors.name && (
              <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs text-slate-300 font-semibold mb-1">Email Address *</label>
            <Input
              type="email"
              {...register('email')}
              error={!!errors.email}
            />
            {errors.email && (
              <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs text-slate-300 font-semibold mb-1">Phone Number</label>
            <Input
              type="text"
              {...register('phone')}
              className="font-mono"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 font-semibold mb-1">Password *</label>
            <Input
              type="password"
              {...register('password')}
              error={!!errors.password}
            />
            {errors.password && (
              <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs text-slate-300 font-semibold mb-1">Role *</label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger error={!!errors.role}>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASHIER">CASHIER (POS & Billing only)</SelectItem>
                    <SelectItem value="ADMIN">ADMIN (Full Control)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditEmployeeModal({
  employee,
  onClose,
  onSuccess,
}: {
  employee: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [editErrorMsg, setEditErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EditEmployeeFormValues>({
    resolver: zodResolver(editEmployeeSchema),
    defaultValues: {
      name: employee.name || '',
      email: employee.email || '',
      phone: employee.phone || '',
      password: '',
      role: (employee.role as any) || 'CASHIER',
    },
  });

  const onUpdate = async (values: EditEmployeeFormValues) => {
    setEditErrorMsg('');
    try {
      const res = await fetch('/api/employees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: employee.id,
          name: values.name,
          email: values.email,
          phone: values.phone,
          role: values.role,
          password: values.password && values.password.trim() !== '' ? values.password : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditErrorMsg(data.error || 'Failed to update employee');
        return;
      }
      onSuccess();
    } catch (e) {
      setEditErrorMsg('Network error');
    }
  };

  const onInvalid = () => {
    setEditErrorMsg('Please fill in all required fields properly');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100">Edit Staff Account</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {editErrorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{editErrorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onUpdate, onInvalid)} className="space-y-3" noValidate>
          <div>
            <label className="block text-xs text-slate-300 font-semibold mb-1">Employee Name *</label>
            <Input
              type="text"
              {...register('name')}
              error={!!errors.name}
            />
            {errors.name && (
              <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs text-slate-300 font-semibold mb-1">Email Address *</label>
            <Input
              type="email"
              {...register('email')}
              error={!!errors.email}
            />
            {errors.email && (
              <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs text-slate-300 font-semibold mb-1">Phone Number</label>
            <Input
              type="text"
              {...register('phone')}
              className="font-mono"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 font-semibold mb-1">
              New Password <span className="text-slate-500 font-normal">(Leave blank to keep unchanged)</span>
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              {...register('password')}
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 font-semibold mb-1">Role *</label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger error={!!errors.role}>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASHIER">CASHIER (POS & Billing only)</SelectItem>
                    <SelectItem value="ADMIN">ADMIN (Full Control)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
