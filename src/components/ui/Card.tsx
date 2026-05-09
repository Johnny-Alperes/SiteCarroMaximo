import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-[2rem] border border-border bg-card/50 backdrop-blur-xl p-6 text-card-foreground transition-all",
          hoverable && "hover:premium-shadow hover:border-primary/20",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export { Card };
