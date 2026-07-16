"use client";

import { ShoppingCart, Trash2 } from "lucide-react";
import { useCarrinho } from "@/components/CarrinhoContext";
import { formatarPreco } from "@/lib/format";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";

export default function CarrinhoPage() {
  const { itens, subtotal, alterarQtd, removerItem } = useCarrinho();

  if (itens.length === 0) {
    return (
      <Section className="flex min-h-[70vh] items-center">
        <Container className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-surface">
            <ShoppingCart className="h-7 w-7 text-muted" aria-hidden />
          </div>
          <h1 className="font-display text-2xl font-bold uppercase">Seu carrinho está vazio</h1>
          <p className="text-muted">Ainda não tem nada por aqui.</p>
          <Button href="/motos" size="lg" className="mt-2">
            Ver motos
          </Button>
        </Container>
      </Section>
    );
  }

  return (
    <Section className="pb-16 pt-10 sm:pb-20 sm:pt-14">
      <Container className="max-w-3xl">
        <h1 className="font-display text-2xl font-bold uppercase sm:text-3xl">Carrinho</h1>

        <ul className="mt-8 space-y-4">
          {itens.map((item) => (
            <li
              key={item.varianteId}
              className="flex gap-4 rounded-2xl border border-border bg-surface p-4"
            >
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-border bg-bg">
                {item.imagemUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imagemUrl}
                    alt={item.produtoNome}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-center text-[10px] uppercase tracking-wide text-muted">
                    Sem foto
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p className="font-medium">{item.produtoNome}</p>
                  <p className="text-sm text-muted">Cor: {item.cor}</p>
                  <p className="font-mono text-sm text-accent">{formatarPreco(item.precoUnit)}</p>
                </div>

                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <div className="inline-flex items-center gap-3 rounded-full border border-border px-1.5 py-1.5">
                    <button
                      type="button"
                      onClick={() => alterarQtd(item.varianteId, item.qtd - 1)}
                      disabled={item.qtd <= 1}
                      aria-label="Diminuir quantidade"
                      className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-bg disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      −
                    </button>
                    <span className="w-4 text-center font-mono text-sm">{item.qtd}</span>
                    <button
                      type="button"
                      onClick={() => alterarQtd(item.varianteId, item.qtd + 1)}
                      disabled={item.qtd >= item.estoque}
                      aria-label="Aumentar quantidade"
                      className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-bg disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                  <p className="font-mono font-semibold">
                    {formatarPreco(item.precoUnit * item.qtd)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removerItem(item.varianteId)}
                aria-label="Remover item"
                className="self-start rounded p-1 text-muted transition hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-8 rounded-2xl border border-accent/30 bg-surface p-6">
          <div className="flex items-center justify-between">
            <span className="text-muted">Subtotal</span>
            <span className="font-mono text-2xl font-bold text-accent">
              {formatarPreco(subtotal)}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted">Frete calculado no próximo passo.</p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button href="/motos" variant="secondary" size="lg" className="sm:flex-1">
            Continuar comprando
          </Button>
          <Button href="/checkout" size="lg" className="sm:flex-1">
            Finalizar compra
          </Button>
        </div>
      </Container>
    </Section>
  );
}
