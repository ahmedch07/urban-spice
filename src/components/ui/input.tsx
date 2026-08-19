import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 transition-colors file:border-0 file:bg-transparent file:text-xs file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-1 focus-visible:ring-red-500"
            : "border-slate-800 focus-visible:border-amber-500 focus-visible:ring-1 focus-visible:ring-amber-500/50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
