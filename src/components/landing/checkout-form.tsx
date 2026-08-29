import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Customer, OrderType, PaymentMethod } from "./types";

const formatMoney = (value: number) =>
  `Rs. ${Math.round(value).toLocaleString()}`;
type CheckoutFormProps = {
  customer: Customer;
  orderType: OrderType;
  paymentMethod: PaymentMethod;
  subtotal: number;
  deliveryFee: number;
  message: string;
  placing: boolean;
  onCustomerChange: (customer: Customer) => void;
  onOrderTypeChange: (type: OrderType) => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onPlaceOrder: () => void;
};

export function CheckoutForm(props: CheckoutFormProps) {
  const {
    customer,
    orderType,
    paymentMethod,
    subtotal,
    deliveryFee,
    message,
    placing,
    onCustomerChange,
    onOrderTypeChange,
    onPaymentMethodChange,
    onPlaceOrder,
  } = props;
  return (
    <div className="space-y-4">
      <Input
        placeholder="Your name"
        value={customer.name}
        onChange={(event) =>
          onCustomerChange({ ...customer, name: event.target.value })
        }
      />
      <Input
        placeholder="Contact number"
        value={customer.phone}
        onChange={(event) =>
          onCustomerChange({ ...customer, phone: event.target.value })
        }
      />
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant={orderType === "DELIVERY" ? "default" : "secondary"}
          onClick={() => onOrderTypeChange("DELIVERY")}
        >
          Delivery
        </Button>
        <Button
          type="button"
          variant={orderType === "TAKEAWAY" ? "default" : "secondary"}
          onClick={() => onOrderTypeChange("TAKEAWAY")}
        >
          Takeaway
        </Button>
      </div>
      {orderType === "DELIVERY" && (
        <Textarea
          placeholder="Delivery address"
          value={customer.address}
          onChange={(event) =>
            onCustomerChange({ ...customer, address: event.target.value })
          }
        />
      )}
      <Select
        value={paymentMethod}
        onValueChange={(value) => onPaymentMethodChange(value as PaymentMethod)}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="CASH">Cash on Delivery / Collection</SelectItem>
          <SelectItem value="ONLINE">Online Payment (pending)</SelectItem>
          <SelectItem value="CARD">Card Payment (pending)</SelectItem>
        </SelectContent>
      </Select>
      <div className="border-t border-slate-800 pt-3 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <strong>{formatMoney(subtotal)}</strong>
        </div>
        {orderType === "DELIVERY" && (
          <div className="mt-1 flex justify-between">
            <span>Delivery</span>
            <strong>{formatMoney(deliveryFee)}</strong>
          </div>
        )}
        <div className="mt-2 flex justify-between text-lg font-black">
          Total <span>{formatMoney(subtotal + deliveryFee)}</span>
        </div>
      </div>
      {message && (
        <p className="text-sm text-rose-400" role="alert">
          {message}
        </p>
      )}
      <Button
        type="button"
        size="lg"
        className="w-full"
        disabled={placing}
        onClick={onPlaceOrder}
      >
        {placing ? "Placing order…" : "Place order"}
      </Button>
    </div>
  );
}
