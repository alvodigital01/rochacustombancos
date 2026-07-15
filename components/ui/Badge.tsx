import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const VARIANTS = {
  accent: "border-accent/30 bg-accent/10 text-accent",
  outline: "border-white/15 bg-transparent text-foreground",
  muted: "border-border bg-surface text-muted",
} as const;

export default function Badge({
  children,
  variant = "outline",
  className,
}: {
  children: ReactNode;
  variant?: keyof typeof VARIANTS;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wider",
        VARIANTS[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
