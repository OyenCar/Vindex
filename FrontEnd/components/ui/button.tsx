import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Neo-brutalist button. Hard borders, offset shadows, no rounded corners.
 * `buttonVariants` is exported so the same styles can be applied to <Link>/<a> elements.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold uppercase tracking-wider transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:pointer-events-none disabled:opacity-40 select-none cursor-pointer border-2 border-[var(--border)] rounded-xl",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--accent)] text-white shadow-[var(--shadow-brutal)] hover:shadow-[var(--shadow-brutal-hover)] hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-0 active:translate-y-0 active:shadow-none",
        secondary:
          "bg-[var(--surface)] text-[var(--text-primary)] shadow-[var(--shadow-brutal-sm)] hover:shadow-[var(--shadow-brutal)] hover:-translate-x-[1px] hover:-translate-y-[1px] active:translate-x-0 active:translate-y-0 active:shadow-none",
        ghost:
          "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] shadow-none rounded-xl",
        outline:
          "bg-transparent text-[var(--text-primary)] hover:bg-[var(--surface-hover)]",
        danger:
          "bg-[var(--danger)] text-white border-[var(--border)] shadow-[var(--shadow-brutal)] hover:shadow-[var(--shadow-brutal-hover)] hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-0 active:translate-y-0 active:shadow-none",
      },
      size: {
        sm: "h-9 px-4 text-[11px]",
        default: "h-11 px-5 text-[12px]",
        lg: "h-[52px] px-7 text-[13px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { Button, buttonVariants };
