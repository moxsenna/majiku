import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Badge lama dipetakan ke gaya status kit (.st): titik + teks. Pil merah muda hanya untuk yang menuntut tindakan.
 * Untuk kode baru pakai <StatusDot> dari @/components/bunayo.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] font-semibold before:h-2 before:w-2 before:shrink-0 before:rounded-full before:content-['']",
  {
    variants: {
      variant: {
        default: "text-foreground before:bg-foreground",
        secondary: "text-muted-foreground before:border-[1.5px] before:border-muted-foreground before:h-1.5 before:w-1.5",
        outline: "text-foreground-2 before:hidden rounded-full border border-border px-2.5 py-0.5",
        muted: "text-muted-foreground before:border-[1.5px] before:border-muted-foreground before:h-1.5 before:w-1.5",
        accent: "text-foreground before:bg-foreground",
        success: "text-success before:bg-daun",
        warning: "text-warning before:bg-matahari",
        info: "text-info before:bg-langit",
        highlight: "hl before:hidden",
        destructive: "text-destructive bg-destructive-soft rounded-full px-2.5 py-0.5 before:hidden",
        // status lama
        present: "text-success before:bg-daun",
        paid: "text-success before:bg-daun",
        late: "text-warning before:bg-matahari",
        pending: "text-muted-foreground before:border-[1.5px] before:border-muted-foreground before:h-1.5 before:w-1.5",
        unpaid: "text-warning before:bg-matahari",
        absent: "text-destructive bg-destructive-soft rounded-full px-2.5 py-0.5 before:hidden",
        overdue: "text-destructive bg-destructive-soft rounded-full px-2.5 py-0.5 before:hidden",
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
