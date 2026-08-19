'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import { CustomerItem } from '@/lib/types';

const customerSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  phone: z.string().min(1, 'Phone number is required').min(7, 'Please enter a valid phone number'),
  address: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: CustomerItem) => void;
}

export default function CustomerModal({
  isOpen,
  onClose,
  onSelectCustomer,
}: CustomerModalProps) {
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      phone: '',
      address: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: '',
        phone: '',
        address: '',
      });
      setFormError('');
    }
  }, [isOpen, reset]);

  const onCreateCustomer = async (values: CustomerFormValues) => {
    setFormError('');

    try {
      const res = await fetch('/api/pos/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to create customer');
        return;
      }
      reset();
      onSelectCustomer(data.customer);
      onClose();
    } catch (error) {
      setFormError('Network error creating customer');
    }
  };

  const onInvalid = () => {
    setFormError('Please enter a valid customer name and phone number');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in-0">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col my-8 zoom-in-95 animate-in">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-slate-100 text-sm">Customer Details</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onCreateCustomer, onInvalid)} className="p-5 space-y-4" noValidate>
          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl font-medium flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Name *</label>
            <Input
              type="text"
              {...register('name')}
              placeholder="e.g. Usama Khan"
              error={!!errors.name}
            />
            {errors.name && (
              <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone *</label>
            <Input
              type="text"
              {...register('phone')}
              placeholder="e.g. 03001234567"
              className="font-mono"
              error={!!errors.phone}
            />
            {errors.phone && (
              <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Delivery Address</label>
            <Textarea
              rows={2}
              {...register('address')}
              placeholder="House #, Street, Area / Sector..."
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
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
              {isSubmitting ? 'Saving...' : 'Select Customer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
