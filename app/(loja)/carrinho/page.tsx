"use client";

import Link from "next/link";
import { useCarrinho } from "@/components/CarrinhoContext";
import { formatarPreco } from "@/lib/format";

export default function CarrinhoPage() {
  const { itens, subtotal, alterarQtd, removerItem } = useCarrinho();

  if (itens.length === 0) {
    return (
      <main className="mx-auto max-w-3xl p-8 text-center">
        <h1 className="font-display text-2xl font-bold uppercase">Seu carrinho está vazio</h1>
        <p className="mt-2 text-muted">Ainda não tem nada por aqui.</p>
        <Link
          href="/motos"
          className="mt-6 inline-block rounded-lg bg-accent px-6 py-2 font-display font-semibold uppercase tracking-wide text-accent-foreground transition hover:bg-accent-hover"
        >
          Ver motos
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="font-display text-2xl font-bold uppercase">Carrinho</h1>

      <ul className="mt-6 divide-y divide-border">
        {itens.map((item) => (
          <li key={item.varianteId} className="flex flex-wrap items-center gap-4 py-4">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-surface">
              {item.imagemUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imagemUrl}
                  alt={item.produtoNome}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted">
                  Sem imagem
                </div>
              )}
            </div>

            <div className="flex-1">
              <p className="font-medium">{item.produtoNome}</p>
              <p className="text-sm text-muted">Cor: {item.cor}</p>
              <p className="text-sm text-muted">{formatarPreco(item.precoUnit)} / un</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => alterarQtd(item.varianteId, item.qtd - 1)}
                disabled={item.qtd <= 1}
                className="rounded-lg border border-border px-2 py-1 transition hover:border-accent/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                -
              </button>
              <span>{item.qtd}</span>
              <button
                type="button"
                onClick={() => alterarQtd(item.varianteId, item.qtd + 1)}
                disabled={item.qtd >= item.estoque}
                className="rounded-lg border border-border px-2 py-1 transition hover:border-accent/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                +
              </button>
            </div>

            <p className="w-24 text-right font-mono font-medium">
              {formatarPreco(item.precoUnit * item.qtd)}
            </p>

            <button
              type="button"
              onClick={() => removerItem(item.varianteId)}
              className="text-sm text-danger underline"
            >
              Remover
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
        <p className="font-mono text-lg font-semibold">Subtotal: {formatarPreco(subtotal)}</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-4">
        <Link
          href="/motos"
          className="rounded-lg border border-accent/50 px-6 py-2 font-display font-semibold uppercase tracking-wide transition hover:border-accent hover:bg-accent/10"
        >
          Continuar comprando
        </Link>
        <Link
          href="/checkout"
          className="rounded-lg bg-accent px-6 py-2 font-display font-semibold uppercase tracking-wide text-accent-foreground transition hover:bg-accent-hover"
        >
          Finalizar compra
        </Link>
      </div>
    </main>
  );
}
