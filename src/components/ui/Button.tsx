import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: "bg-blue-600 hover:bg-blue-700 text-white premium-shadow",
      secondary: "bg-indigo-600 hover:bg-indigo-700 text-white",
      danger: "bg-red-600 hover:bg-red-700 text-white",
      outline: "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground",
      ghost: "bg-transparent hover:bg-accent hover:text-accent-foreground border-transparent",
    };

    const sizes = {
      default: "px-4 py-2 text-sm",
      sm: "px-3 py-1.5 text-xs",
      lg: "px-6 py-3 text-base",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={isLoading || disabled}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none gap-2",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
