import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground border-border",
        success: "border-transparent bg-success/15 text-success border-success/30",
        warning: "border-transparent bg-warning/15 text-warning-foreground border-warning/30",
        info: "border-transparent bg-info/15 text-info border-info/30",
        muted: "border-transparent bg-muted text-muted-foreground",
        accent: "border-transparent bg-accent text-accent-foreground",
        highlight: "border-transparent bg-highlight/15 text-highlight-foreground border-highlight/30",
        // Status badges
        present: "border-transparent bg-success/15 text-success",
        absent: "border-transparent bg-destructive/15 text-destructive",
        late: "border-transparent bg-warning/15 text-warning-foreground",
        overdue: "border-transparent bg-destructive/15 text-destructive",
        pending: "border-transparent bg-muted text-muted-foreground",
        paid: "border-transparent bg-success/15 text-success",
        unpaid: "border-transparent bg-destructive/15 text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
