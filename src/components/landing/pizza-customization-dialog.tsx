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
      className="fixed inset-0 z-40 grid place-items-end bg-slate-950/80 p-0 sm:place-items-center sm:p-4"
      role="presentation"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="pizza-dialog-title"
        className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-t-3xl bg-slate-900 p-6 sm:rounded-3xl"
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
              <SelectTrigger className="mt-1">
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
              <SelectTrigger className="mt-1">
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
              <SelectTrigger className="mt-1">
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
                className="h-auto min-h-10 justify-start whitespace-normal px-3 py-2 text-left"
                onClick={() => onToggleTopping(topping.id)}
              >
                {topping.name} (+{formatMoney(topping.additionalPrice)})
              </Button>
            ))}
          </div>
        </fieldset>
        <Button type="button" size="lg" className="mt-5 w-full" onClick={onAdd}>
          Add pizza
        </Button>
      </section>
    </div>
  );
}
