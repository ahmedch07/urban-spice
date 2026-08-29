import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MenuData, Product } from "./types";

const formatMoney = (value: number) =>
  `Rs. ${Math.round(value).toLocaleString()}`;
type PizzaCustomizationDialogProps = {
  product: Product;
  menu: MenuData;
  flavorId: string;
  sizeId: string;
  crustId: string;
  toppingIds: string[];
  onFlavorChange: (value: string) => void;
  onSizeChange: (value: string) => void;
  onCrustChange: (value: string) => void;
  onToggleTopping: (id: string) => void;
  onAdd: () => void;
  onClose: () => void;
};

export function PizzaCustomizationDialog(props: PizzaCustomizationDialogProps) {
  const {
    product,
    menu,
    flavorId,
    sizeId,
    crustId,
    toppingIds,
    onFlavorChange,
    onSizeChange,
    onCrustChange,
    onToggleTopping,
    onAdd,
    onClose,
  } = props;
  return (
    <div
      className="fixed inset-0 z-40 grid place-items-end bg-[#32170e]/50 p-0 backdrop-blur-sm sm:place-items-center sm:p-4"
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="pizza-dialog-title"
        className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-t-3xl bg-[#fffaf3] p-6 text-[#32170e] sm:rounded-3xl"
      >
        <div className="flex items-center justify-between">
          <h2 id="pizza-dialog-title" className="text-xl font-black">
            Customize {product.name}
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close customization"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          <label className="block text-sm font-bold">
            Flavor
            <Select value={flavorId} onValueChange={onFlavorChange}>
            <SelectTrigger className="mt-1 border-orange-200 bg-white text-[#32170e]">
                <SelectValue placeholder="Choose a flavor" />
              </SelectTrigger>
              <SelectContent>
                {menu.flavors.map((flavor) => (
                  <SelectItem key={flavor.id} value={flavor.id}>
                    {flavor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="block text-sm font-bold">
            Size
            <Select value={sizeId} onValueChange={onSizeChange}>
            <SelectTrigger className="mt-1 border-orange-200 bg-white text-[#32170e]">
                <SelectValue placeholder="Choose a size" />
              </SelectTrigger>
              <SelectContent>
                {menu.sizes.map((size) => (
                  <SelectItem key={size.id} value={size.id}>
                    {size.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="block text-sm font-bold">
            Crust
            <Select
              value={crustId || "regular"}
              onValueChange={(value) =>
                onCrustChange(value === "regular" ? "" : value)
              }
            >
              <SelectTrigger className="mt-1 border-orange-200 bg-white text-[#32170e]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Regular crust</SelectItem>
                {menu.crusts.map((crust) => (
                  <SelectItem key={crust.id} value={crust.id}>
                    {crust.name} (+{formatMoney(crust.additionalPrice)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </div>
        <fieldset className="mt-4">
          <legend className="text-sm font-bold">Extra toppings</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {menu.toppings.map((topping) => (
              <Button
                key={topping.id}
                type="button"
                variant={
                  toppingIds.includes(topping.id) ? "default" : "secondary"
                }
                className={toppingIds.includes(topping.id) ? "h-auto min-h-10 justify-start whitespace-normal bg-orange-500 px-3 py-2 text-left text-[#32170e] hover:bg-orange-400" : "h-auto min-h-10 justify-start whitespace-normal border border-orange-100 bg-white px-3 py-2 text-left text-[#6b3422] hover:bg-orange-50"}
                onClick={() => onToggleTopping(topping.id)}
              >
                {topping.name} (+{formatMoney(topping.additionalPrice)})
              </Button>
            ))}
          </div>
        </fieldset>
        <Button type="button" size="lg" className="mt-5 w-full bg-[#32170e] text-white hover:bg-[#572314]" onClick={onAdd}>
          Add pizza
        </Button>
      </section>
    </div>
  );
}
