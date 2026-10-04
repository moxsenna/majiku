import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionButtonProps {
  icon: LucideIcon;
  label: string;
  color: "primary" | "green" | "blue" | "purple" | "orange";
  onClick?: () => void;
}

const colorVariants = {
  primary: {
    bg: "bg-primary/10 hover:bg-primary/20",
    icon: "text-primary",
    border: "border-primary/20 hover:border-primary/40",
  },
  green: {
    bg: "bg-green-500/10 hover:bg-green-500/20",
    icon: "text-green-600",
    border: "border-green-500/20 hover:border-green-500/40",
  },
  blue: {
    bg: "bg-blue-500/10 hover:bg-blue-500/20",
    icon: "text-blue-600",
    border: "border-blue-500/20 hover:border-blue-500/40",
  },
  purple: {
    bg: "bg-purple-500/10 hover:bg-purple-500/20",
    icon: "text-purple-600",
    border: "border-purple-500/20 hover:border-purple-500/40",
  },
  orange: {
    bg: "bg-orange-500/10 hover:bg-orange-500/20",
    icon: "text-orange-600",
    border: "border-orange-500/20 hover:border-orange-500/40",
  },
};

export function QuickActionButton({ icon: Icon, label, color, onClick }: QuickActionButtonProps) {
  const variant = colorVariants[color];

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200",
        "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
        variant.bg,
        variant.border
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center mb-2",
        variant.bg
      )}>
        <Icon className={cn("w-6 h-6", variant.icon)} />
      </div>
      <span className="font-medium text-sm text-foreground">{label}</span>
    </button>
  );
}
