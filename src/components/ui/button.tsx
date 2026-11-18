import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Kit Bunayo (.b): biru hanya untuk satu aksi utama per layar; tombol kedua bergaris Tinta 1,5 px.
// Ukuran: 44 standar · 36 aksi baris desktop · 52 tombol utama mobile.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded border-[1.5px] border-transparent text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-soft disabled:pointer-events-none disabled:bg-disabled disabled:text-primary-foreground disabled:border-transparent [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        pri: "bg-primary text-primary-foreground hover:bg-primary-hover",
        sec: "border-foreground bg-card text-foreground hover:bg-background",
        txt: "text-muted-foreground hover:text-foreground px-2.5",
        link: "text-primary hover:underline underline-offset-4 px-2.5",
        dng: "border-destructive text-destructive bg-card hover:bg-destructive-soft",
        dark: "bg-foreground text-background hover:bg-foreground-2",
        soft: "bg-muted text-foreground hover:bg-border",
        // Nama varian lama → padanan kit (dibersihkan per layar)
        default: "bg-primary text-primary-foreground hover:bg-primary-hover",
        hero: "bg-primary text-primary-foreground hover:bg-primary-hover",
        outline: "border-foreground bg-card text-foreground hover:bg-background",
        glass: "border-foreground bg-card text-foreground hover:bg-background",
        secondary: "bg-muted text-foreground hover:bg-border",
        ghost: "text-foreground hover:bg-muted",
        destructive: "border-destructive text-destructive bg-card hover:bg-destructive-soft",
        success: "bg-foreground text-background hover:bg-foreground-2",
        warning: "bg-foreground text-background hover:bg-foreground-2",
        info: "bg-foreground text-background hover:bg-foreground-2",
      },
      size: {
        default: "h-btn px-[18px]",
        sm: "h-btn-sm px-3.5",
        lg: "h-btn-lg px-[22px] text-base",
        xl: "h-btn-lg px-[22px] text-base rounded-full",
        icon: "h-btn w-btn p-0",
        "icon-sm": "h-btn-sm w-btn-sm p-0 [&_svg]:size-[18px]",
        "icon-lg": "h-btn-lg w-btn-lg p-0",
      },
      full: {
        true: "w-full",
      },
      pill: {
        true: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "pri",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, full, pill, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, full, pill, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
