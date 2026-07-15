import { cn } from "@/lib/cn";

// TODO: trocar por <Image> real assim que tivermos fotos do produto.
export default function ImagePlaceholder({
  label = "Foto do produto aqui",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-accent/50 bg-gradient-to-br from-surface via-surface to-surface-2 ring-1 ring-inset ring-accent/15",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,#F2B70530,transparent_65%)]" />
      <span className="relative px-6 text-center font-mono text-xs uppercase tracking-widest text-muted">
        {label}
      </span>
    </div>
  );
}
