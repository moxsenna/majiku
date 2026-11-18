import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Kit .in: tinggi 44, garis --input (3,6:1), fokus 2 px biru + cincin primary-soft, galat 2 px merah.
const inputVariants = cva(
  "flex w-full rounded-input border border-input bg-card px-3 text-[15px] text-foreground placeholder:text-placeholder transition-shadow file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary focus-visible:shadow-focus aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-destructive disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground [&[type='date']]:pr-3",
  {
    variants: {
      variant: {
        default: "",
        // varian lama
        filled: "",
        ghost: "",
      },
      inputSize: {
        default: "h-input",
        sm: "h-btn-sm text-sm",
        lg: "h-btn-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
);

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, inputSize, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, inputSize, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input, inputVariants };
