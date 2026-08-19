'use client';

import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="top-right"
      richColors
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-slate-900 group-[.toaster]:text-slate-100 group-[.toaster]:border-slate-800 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl',
          description: 'group-[.toast]:text-slate-400',
          actionButton:
            'group-[.toast]:bg-amber-500 group-[.toast]:text-slate-950 group-[.toast]:font-bold',
          cancelButton:
            'group-[.toast]:bg-slate-800 group-[.toast]:text-slate-300',
        },
      }}
      {...props}
    />
  );
}

export { toast } from 'sonner';
