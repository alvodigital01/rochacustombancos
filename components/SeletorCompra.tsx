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
    return <p className="text-gray-500">Nenhuma variante disponível no momento.</p>;
  }

  return (
    <div className="mt-4 space-y-4">
      <p className="text-xl font-semibold">{formatarPreco(preco)}</p>

      <div>
        <p className="mb-2 text-sm font-medium">Cor</p>
        <div className="flex flex-wrap gap-2">
          {variantes.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => selecionarVariante(v.id)}
              className={`rounded border px-3 py-1 text-sm ${
                v.id === varianteId ? "border-black bg-black text-white" : "border-gray-300"
              } ${v.estoque <= 0 ? "opacity-50" : ""}`}
            >
              {v.cor}
              {v.estoque <= 0 ? " (esgotado)" : ""}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Quantidade</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
            disabled={quantidade <= 1}
            className="rounded border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
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
            className="rounded border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            +
          </button>
        </div>
      </div>

      <p className={esgotado ? "text-red-600" : "text-green-700"}>
        {esgotado ? "Esgotado" : `Em estoque (${variante?.estoque})`}
      </p>

      <button
        type="button"
        onClick={adicionarAoCarrinho}
        disabled={esgotado}
        className="rounded bg-black px-6 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        Adicionar ao carrinho
      </button>

      {aviso && <p className="text-sm text-gray-700">{aviso}</p>}
    </div>
  );
}
