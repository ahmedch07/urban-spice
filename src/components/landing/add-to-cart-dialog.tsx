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
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#32170e]/50 p-4 backdrop-blur-sm">
      <section role="dialog" aria-modal="true" aria-labelledby="add-to-cart-dialog-title" className="w-full max-w-sm rounded-3xl border border-orange-100 bg-[#fffaf3] p-6 text-center shadow-2xl">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-orange-100 text-orange-600">
          <ShoppingBag className="h-6 w-6" />
        </div>
        <h2 id="add-to-cart-dialog-title" className="mt-4 text-xl font-black text-[#32170e]">Add to cart?</h2>
        <p className="mt-2 text-sm text-stone-600">Add <strong className="text-[#32170e]">{product.name}</strong> to your order?</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button type="button" variant="secondary" size="lg" className="border border-orange-100 bg-white text-[#6b3422] hover:bg-orange-50" onClick={onCancel}>Cancel</Button>
          <Button type="button" size="lg" className="bg-[#32170e] text-white hover:bg-[#572314]" onClick={onConfirm}>Yes, add it</Button>
        </div>
      </section>
    </div>
  );
}
