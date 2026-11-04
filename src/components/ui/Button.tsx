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
      primary: "bg-white hover:bg-zinc-200 text-zinc-950",
      secondary: "bg-zinc-800 hover:bg-zinc-700 text-zinc-100",
      danger: "bg-red-600 hover:bg-red-700 text-white",
      outline: "border border-zinc-700 bg-transparent text-zinc-300 hover:border-zinc-500 hover:text-white",
      ghost: "bg-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white border-transparent",
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
          "inline-flex items-center justify-center rounded-none font-bold uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50 disabled:pointer-events-none gap-2",
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
