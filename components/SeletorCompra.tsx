"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, PackageCheck, Truck, Wrench, XCircle } from "lucide-react";
import { formatarPreco } from "@/lib/format";
import { useCarrinho } from "@/components/CarrinhoContext";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type Variante = {
  id: string;
  cor: string;
  sku: string;
  estoque: number;
  preco_override: number | null;
  imagem_url: string | null;
};

export default function SeletorCompra({
  variantes,
  precoBase,
  produtoSlug,
  produtoNome,
  produtoPesoG,
}: {
  variantes: Variante[];
  precoBase: number;
  produtoSlug: string;
  produtoNome: string;
  produtoPesoG?: number | null;
}) {
  const { adicionarItem } = useCarrinho();
  const [varianteId, setVarianteId] = useState(variantes[0]?.id ?? "");
  const [quantidade, setQuantidade] = useState(1);
  const [aviso, setAviso] = useState<string | null>(null);

  const variante = useMemo(
    () => variantes.find((v) => v.id === varianteId) ?? null,
    [variantes, varianteId]
  );

  const preco = variante?.preco_override ?? precoBase;
  const esgotado = !variante || variante.estoque <= 0;

  function selecionarVariante(id: string) {
    setVarianteId(id);
    setQuantidade(1);
  }

  function adicionarAoCarrinho() {
    if (!variante || esgotado) return;
    adicionarItem({
      varianteId: variante.id,
      produtoSlug,
      produtoNome,
      cor: variante.cor,
      precoUnit: preco,
      imagemUrl: variante.imagem_url,
      qtd: quantidade,
      estoque: variante.estoque,
      pesoG: produtoPesoG ?? undefined,
    });
    setAviso("Adicionado ao carrinho");
    setTimeout(() => setAviso(null), 3000);
  }

  if (variantes.length === 0) {
    return <p className="mt-6 text-muted">Nenhuma variante disponível no momento.</p>;
  }

  return (
    <div className="mt-6 space-y-6">
      <p className="font-mono text-3xl font-bold text-accent">{formatarPreco(preco)}</p>

      <div>
        <p className="mb-3 text-sm font-medium text-muted">Cor</p>
        <div className="flex flex-wrap gap-2">
          {variantes.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => selecionarVariante(v.id)}
              disabled={v.estoque <= 0}
              className={cn(
                "rounded-xl border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                v.id === varianteId
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border hover:border-accent/50",
                v.estoque <= 0 && "cursor-not-allowed opacity-40"
              )}
            >
              {v.cor}
              {v.estoque <= 0 ? " · esgotado" : ""}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-medium text-muted">Quantidade</p>
          <div className="inline-flex items-center gap-4 rounded-full border border-border px-1.5 py-1.5">
            <button
              type="button"
              onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
              disabled={quantidade <= 1}
              aria-label="Diminuir quantidade"
              className="flex h-8 w-8 items-center justify-center rounded-full text-lg transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
            >
              −
            </button>
            <span className="w-4 text-center font-mono text-sm">{quantidade}</span>
            <button
              type="button"
              onClick={() =>
                setQuantidade((q) => (variante ? Math.min(variante.estoque, q + 1) : q))
              }
              disabled={!variante || quantidade >= variante.estoque}
              aria-label="Aumentar quantidade"
              className="flex h-8 w-8 items-center justify-center rounded-full text-lg transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>

        <div
          className={cn(
            "inline-flex items-center gap-1.5 text-sm font-medium",
            esgotado ? "text-danger" : "text-emerald-400"
          )}
        >
          {esgotado ? (
            <XCircle className="h-4 w-4" aria-hidden />
          ) : (
            <CheckCircle2 className="h-4 w-4" aria-hidden />
          )}
          {esgotado ? "Esgotado" : `Em estoque (${variante?.estoque})`}
        </div>
      </div>

      {/* Só no desktop — no mobile o CTA fica na barra fixa abaixo. */}
      <div className="hidden sm:block">
        <Button
          type="button"
          onClick={adicionarAoCarrinho}
          disabled={esgotado}
          size="lg"
        >
          {aviso ? (
            <>
              <CheckCircle2 className="h-5 w-5" aria-hidden /> Adicionado!
            </>
          ) : (
            "Adicionar ao carrinho"
          )}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge>
          <PackageCheck className="h-3.5 w-3.5" aria-hidden /> Pronta entrega
        </Badge>
        <Badge>
          <Truck className="h-3.5 w-3.5" aria-hidden /> Envio Brasil
        </Badge>
        <Badge>
          <Wrench className="h-3.5 w-3.5" aria-hidden /> Você instala
        </Badge>
      </div>

      {/* Barra fixa só no mobile — no desktop o CTA acima já fica visível. */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-border bg-bg/95 p-4 backdrop-blur-md sm:hidden">
        <p className="font-mono text-lg font-bold text-accent">{formatarPreco(preco)}</p>
        <Button
          type="button"
          onClick={adicionarAoCarrinho}
          disabled={esgotado}
          className="flex-1"
        >
          {aviso ? (
            <>
              <CheckCircle2 className="h-4 w-4" aria-hidden /> Adicionado!
            </>
          ) : (
            "Adicionar ao carrinho"
          )}
        </Button>
      </div>
      <div className="h-20 sm:hidden" aria-hidden />
    </div>
  );
}
