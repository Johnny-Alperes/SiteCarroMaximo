import { InputHTMLAttributes, forwardRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-sm font-semibold ml-1 text-foreground/70">
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 group-focus-within:text-primary transition-colors">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "flex h-12 w-full rounded-2xl border border-border bg-background/50 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all disabled:cursor-not-allowed disabled:opacity-50",
              icon && "pl-11",
              error && "border-red-500 focus-visible:ring-red-500/10 focus-visible:border-red-500",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs font-medium text-red-500 ml-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
