"use client";

import { useState } from "react";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import { cn } from "@/lib/cn";

type Imagem = { id: string; url: string };

export default function Galeria({ imagens, alt }: { imagens: Imagem[]; alt: string }) {
  const [ativaId, setAtivaId] = useState(imagens[0]?.id ?? null);
  const ativa = imagens.find((img) => img.id === ativaId) ?? imagens[0] ?? null;

  if (!ativa) {
    return <ImagePlaceholder className="aspect-square w-full" />;
  }

  return (
    <div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={ativa.url}
        alt={alt}
        className="aspect-square w-full rounded-2xl border border-border object-cover"
      />

      {imagens.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {imagens.map((img) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setAtivaId(img.id)}
              aria-label="Ver esta foto"
              className={cn(
                "h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                img.id === ativa.id ? "border-accent" : "border-border opacity-70 hover:opacity-100"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
