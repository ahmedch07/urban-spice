import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type OrderSuccessDialogProps = { invoiceNo?: string; onClose: () => void };

export function OrderSuccessDialog({
  invoiceNo,
  onClose,
}: OrderSuccessDialogProps) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-[#32170e]/50 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-dialog-title"
        className="w-full max-w-md rounded-3xl bg-[#fffaf3] p-7 text-center shadow-2xl"
      >
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
        <h2 id="success-dialog-title" className="mt-4 text-2xl font-black text-[#32170e]">
          Order received!
        </h2>
        <p className="mt-3 text-stone-500">Order number</p>
        <p className="text-2xl font-black text-orange-600">{invoiceNo}</p>
        <p className="mt-4 text-sm text-stone-500">
          Our team will accept and prepare your order. Payment is pending until
          collected or processed.
        </p>
        <Button type="button" size="lg" className="mt-6 bg-[#32170e] text-white hover:bg-[#572314]" onClick={onClose}>
          Back to menu
        </Button>
      </section>
    </div>
  );
}
