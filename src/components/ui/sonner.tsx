"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

// Kit .toast: latar Tinta, teks putih, tautan aksi stabilo (di mode gelap otomatis terbalik lewat token).
const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme = "light" } = useTheme();

  return (
    <Sonner
      theme={resolvedTheme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-foreground group-[.toaster]:text-background group-[.toaster]:border-0 group-[.toaster]:rounded group-[.toaster]:shadow-float group-[.toaster]:font-sans",
          description: "group-[.toast]:text-background/80",
          actionButton: "group-[.toast]:bg-transparent group-[.toast]:text-highlight group-[.toast]:font-semibold",
          cancelButton: "group-[.toast]:bg-transparent group-[.toast]:text-background/70",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
