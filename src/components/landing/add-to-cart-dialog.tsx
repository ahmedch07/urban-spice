import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "./types";

type AddToCartDialogProps = {
  product: Product;
  onConfirm: () => void;
  onCancel: () => void;
};

export function AddToCartDialog({ product, onConfirm, onCancel }: AddToCartDialogProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4">
      <section role="dialog" aria-modal="true" aria-labelledby="add-to-cart-dialog-title" className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-6 text-center shadow-2xl">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-amber-500/15 text-amber-400">
          <ShoppingBag className="h-6 w-6" />
        </div>
        <h2 id="add-to-cart-dialog-title" className="mt-4 text-xl font-black">Add to cart?</h2>
        <p className="mt-2 text-sm text-slate-300">Add <strong className="text-slate-100">{product.name}</strong> to your order?</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button type="button" variant="secondary" size="lg" onClick={onCancel}>Cancel</Button>
          <Button type="button" size="lg" onClick={onConfirm}>Yes, add it</Button>
        </div>
      </section>
    </div>
  );
}
