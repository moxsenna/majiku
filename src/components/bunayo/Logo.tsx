import Image from "next/image";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";

// Rasio aset: logo 1307×441, ikon rumah "b" 350×439.
const LOGO_RATIO = 1307 / 441;
const MARK_RATIO = 350 / 439;

/**
 * Logo lengkap Bunayo. Tinggi: sidebar admin 30, landing & publik 36–40, layar masuk 44–48 (min. 24).
 * Logo berwarna hanya di atas Kertas/putih; di mode gelap diberi kotak putih (aturan "Di atas latar").
 */
export function BunayoLogo({ height = 30, className, priority }: { height?: number; className?: string; priority?: boolean }) {
  return (
    <span className={cn("inline-flex shrink-0 dark:rounded-input dark:bg-primary-foreground dark:px-2 dark:py-1", className)}>
      <Image
        src={siteConfig.logo}
        alt={siteConfig.name}
        width={Math.round(height * LOGO_RATIO)}
        height={height}
        priority={priority}
        style={{ height, width: "auto" }}
      />
    </span>
  );
}

/** Ikon rumah "b": rail tablet, topbar mobile, avatar notifikasi. */
export function BunayoMark({ height = 32, className, label = siteConfig.name }: { height?: number; className?: string; label?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 dark:rounded-input dark:bg-primary-foreground dark:p-1", className)}>
      <Image
        src={siteConfig.mark}
        alt={label}
        width={Math.round(height * MARK_RATIO)}
        height={height}
        style={{ height, width: "auto" }}
      />
    </span>
  );
}
