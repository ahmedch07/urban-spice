import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-xl border bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 transition-colors focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none",
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
Textarea.displayName = "Textarea";

export { Textarea };
