import { cn } from "@/lib/utils";

// Kit .sk: warna --skeleton, denyut 1,6 s (mati bila prefers-reduced-motion).
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden className={cn("sk sk-box", className)} {...props} />;
}

export { Skeleton };
