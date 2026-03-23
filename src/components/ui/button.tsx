import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "destructive";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-2xl text-sm font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:scale-105",
          variant === "default" &&
            "bg-accent text-accent-foreground shadow-card hover:brightness-110",
          variant === "secondary" &&
            "bg-secondary text-secondary-foreground hover:brightness-110",
          variant === "ghost" &&
            "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
          variant === "destructive" &&
            "bg-destructive text-destructive-foreground hover:brightness-110",
          "h-10 px-4 py-2",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
