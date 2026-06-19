import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * shadcn/ui-style button. `buttonVariants` is exported so the same styles can be
 * applied to `<Link>`/`<a>` elements (e.g. the navbar CTAs) without a Slot dependency.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-b from-accent to-[#6D28D9] text-white shadow-[0_10px_30px_-10px_rgba(124,58,237,0.7)] hover:shadow-[0_16px_50px_-12px_rgba(124,58,237,0.9)] hover:-translate-y-0.5 active:translate-y-0",
        secondary:
          "border border-white/10 bg-white/[0.03] text-text-primary backdrop-blur-xl hover:bg-white/[0.07] hover:border-white/20 hover:-translate-y-0.5",
        ghost:
          "text-text-secondary hover:text-text-primary hover:bg-white/[0.05]",
        outline:
          "border border-white/12 text-text-primary hover:bg-white/[0.04] hover:border-white/25",
      },
      size: {
        sm: "h-9 px-4 text-[13px]",
        default: "h-11 px-5",
        lg: "h-[52px] px-7 text-[15px]",
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
