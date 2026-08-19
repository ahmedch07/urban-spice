import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:pointer-events-none disabled:opacity-50 select-none";

    const variantStyles = {
      default: "bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md shadow-amber-500/20 active:scale-[0.98]",
      primary: "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-[0.98]",
      destructive: "bg-red-500 hover:bg-red-400 text-white shadow-md shadow-red-500/20 active:scale-[0.98]",
      outline: "border border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-200 hover:text-white",
      secondary: "bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white",
      ghost: "hover:bg-slate-800 text-slate-400 hover:text-slate-100",
      link: "text-amber-400 underline-offset-4 hover:underline",
    };

    const sizeStyles = {
      default: "h-9 px-4 py-2",
      sm: "h-7 rounded-lg px-2.5 text-[11px]",
      lg: "h-11 rounded-xl px-6 text-sm",
      icon: "h-8 w-8 rounded-lg p-0",
    };

    return (
      <button
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
