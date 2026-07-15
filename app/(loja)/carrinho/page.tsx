"use client";

import Link from "next/link";
import { useCarrinho } from "@/components/CarrinhoContext";
import { formatarPreco } from "@/lib/format";

export default function CarrinhoPage() {
  const { itens, subtotal, alterarQtd, removerItem } = useCarrinho();

  if (itens.length === 0) {
    return (
      <main className="mx-auto max-w-3xl p-8 text-center">
        <h1 className="text-2xl font-bold">Seu carrinho está vazio</h1>
        <p className="mt-2 text-gray-500">Ainda não tem nada por aqui.</p>
        <Link href="/motos" className="mt-6 inline-block rounded bg-black px-6 py-2 text-white">
          Ver motos
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-bold">Carrinho</h1>

      <ul className="mt-6 divide-y">
        {itens.map((item) => (
          <li key={item.varianteId} className="flex flex-wrap items-center gap-4 py-4">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded border bg-gray-100">
              {item.imagemUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imagemUrl}
                  alt={item.produtoNome}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                  Sem imagem
                </div>
              )}
            </div>

            <div className="flex-1">
              <p className="font-medium">{item.produtoNome}</p>
              <p className="text-sm text-gray-500">Cor: {item.cor}</p>
              <p className="text-sm text-gray-500">{formatarPreco(item.precoUnit)} / un</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => alterarQtd(item.varianteId, item.qtd - 1)}
                disabled={item.qtd <= 1}
                className="rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                -
              </button>
              <span>{item.qtd}</span>
              <button
                type="button"
                onClick={() => alterarQtd(item.varianteId, item.qtd + 1)}
                disabled={item.qtd >= item.estoque}
                className="rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                +
              </button>
            </div>

            <p className="w-24 text-right font-medium">
              {formatarPreco(item.precoUnit * item.qtd)}
            </p>

            <button
              type="button"
              onClick={() => removerItem(item.varianteId)}
              className="text-sm text-red-600 underline"
            >
              Remover
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between border-t pt-4">
        <p className="text-lg font-semibold">Subtotal: {formatarPreco(subtotal)}</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-4">
        <Link href="/motos" className="rounded border px-6 py-2">
          Continuar comprando
        </Link>
        <Link href="/checkout" className="rounded bg-black px-6 py-2 text-white">
          Finalizar compra
        </Link>
      </div>
    </main>
  );
}
