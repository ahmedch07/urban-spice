import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type OrderSuccessDialogProps = { invoiceNo?: string; onClose: () => void };

export function OrderSuccessDialog({
  invoiceNo,
  onClose,
}: OrderSuccessDialogProps) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/80 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-dialog-title"
        className="w-full max-w-md rounded-3xl bg-slate-900 p-7 text-center"
      >
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-400" />
        <h2 id="success-dialog-title" className="mt-4 text-2xl font-black">
          Order received!
        </h2>
        <p className="mt-3 text-slate-300">Order number</p>
        <p className="text-2xl font-black text-amber-400">{invoiceNo}</p>
        <p className="mt-4 text-sm text-slate-400">
          Our team will accept and prepare your order. Payment is pending until
          collected or processed.
        </p>
        <Button type="button" size="lg" className="mt-6" onClick={onClose}>
          Back to menu
        </Button>
      </section>
    </div>
  );
}
