import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckoutForm } from "./checkout-form";
import type { CartItem, Customer, OrderType, PaymentMethod } from "./types";

const formatMoney = (value: number) =>
  `Rs. ${Math.round(value).toLocaleString()}`;
type CartDrawerProps = {
  cart: CartItem[];
  checkout: boolean;
  subtotal: number;
  deliveryFee: number;
  customer: Customer;
  orderType: OrderType;
  paymentMethod: PaymentMethod;
  message: string;
  placing: boolean;
  onClose: () => void;
  onCheckout: () => void;
  onChangeQuantity: (key: string, change: number) => void;
  onRemove: (key: string) => void;
  onCustomerChange: (customer: Customer) => void;
  onOrderTypeChange: (type: OrderType) => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onPlaceOrder: () => void;
};

export function CartDrawer(props: CartDrawerProps) {
  const {
    cart,
    checkout,
    subtotal,
    deliveryFee,
    customer,
    orderType,
    paymentMethod,
    message,
    placing,
    onClose,
    onCheckout,
    onChangeQuantity,
    onRemove,
    onCustomerChange,
    onOrderTypeChange,
    onPaymentMethodChange,
    onPlaceOrder,
  } = props;
  return (
    <div className="fixed inset-0 z-30 bg-slate-950/70" role="presentation">
      <aside
        aria-label={checkout ? "Checkout" : "Shopping cart"}
        className="ml-auto flex h-full w-full max-w-md flex-col bg-slate-900 p-5"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-black">
            {checkout ? "Checkout" : "Your cart"}
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close cart"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {checkout ? (
          <CheckoutForm
            customer={customer}
            orderType={orderType}
            paymentMethod={paymentMethod}
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            message={message}
            placing={placing}
            onCustomerChange={onCustomerChange}
            onOrderTypeChange={onOrderTypeChange}
            onPaymentMethodChange={onPaymentMethodChange}
            onPlaceOrder={onPlaceOrder}
          />
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-auto">
              {cart.map((item) => (
                <div key={item.key} className="rounded-xl bg-slate-950 p-3">
                  <div className="flex items-center justify-between gap-3 font-bold">
                    <span>{item.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemove(item.key)}
                      aria-label={`Remove ${item.name}`}
                    >
                      <X className="h-4 w-4 text-rose-400" />
                    </Button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-amber-400">
                      {formatMoney(item.price * item.quantity)}
                    </span>
                    <span className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onChangeQuantity(item.key, -1)}
                        aria-label={`Remove one ${item.name}`}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      {item.quantity}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onChangeQuantity(item.key, 1)}
                        aria-label={`Add one ${item.name}`}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </span>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <p className="pt-10 text-center text-slate-400">
                  Your cart is empty.
                </p>
              )}
            </div>
            <div className="border-t border-slate-800 pt-4">
              <div className="flex justify-between text-lg font-black">
                <span>Total</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              <Button
                type="button"
                size="lg"
                className="mt-4 w-full"
                disabled={cart.length === 0}
                onClick={onCheckout}
              >
                Continue to checkout
              </Button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
