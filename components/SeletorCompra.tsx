"use client";

import { useMemo, useState } from "react";
import { formatarPreco } from "@/lib/format";
import { useCarrinho } from "@/components/CarrinhoContext";

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
    return <p className="text-muted">Nenhuma variante disponível no momento.</p>;
  }

  return (
    <div className="mt-4 space-y-4">
      <p className="font-mono text-xl font-semibold text-accent">{formatarPreco(preco)}</p>

      <div>
        <p className="mb-2 text-sm font-medium text-muted">Cor</p>
        <div className="flex flex-wrap gap-2">
          {variantes.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => selecionarVariante(v.id)}
              className={`rounded-lg border px-3 py-1 text-sm transition ${
                v.id === varianteId
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border hover:border-accent/50"
              } ${v.estoque <= 0 ? "opacity-50" : ""}`}
            >
              {v.cor}
              {v.estoque <= 0 ? " (esgotado)" : ""}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-muted">Quantidade</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
            disabled={quantidade <= 1}
            className="rounded-lg border border-border px-3 py-1 transition hover:border-accent/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            -
          </button>
          <span>{quantidade}</span>
          <button
            type="button"
            onClick={() =>
              setQuantidade((q) => (variante ? Math.min(variante.estoque, q + 1) : q))
            }
            disabled={!variante || quantidade >= variante.estoque}
            className="rounded-lg border border-border px-3 py-1 transition hover:border-accent/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            +
          </button>
        </div>
      </div>

      <p className={esgotado ? "text-danger" : "text-emerald-400"}>
        {esgotado ? "Esgotado" : `Em estoque (${variante?.estoque})`}
      </p>

      <button
        type="button"
        onClick={adicionarAoCarrinho}
        disabled={esgotado}
        className="rounded-lg bg-accent px-6 py-2 font-display font-semibold uppercase tracking-wide text-accent-foreground transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        Adicionar ao carrinho
      </button>

      {aviso && <p className="text-sm text-muted">{aviso}</p>}
    </div>
  );
}
