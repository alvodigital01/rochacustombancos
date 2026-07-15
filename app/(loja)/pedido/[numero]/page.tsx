import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase";
import { formatarPreco } from "@/lib/format";

export const dynamic = "force-dynamic";

const MENSAGENS_STATUS: Record<string, string> = {
  aguardando_pagamento: "Estamos aguardando a confirmação do seu pagamento.",
  aprovado: "Pagamento aprovado! Seu pedido já está sendo preparado.",
  cancelado: "Este pedido foi cancelado.",
  recusado: "O pagamento não foi aprovado. Tente novamente ou entre em contato.",
};

async function getPedido(numero: string) {
  const supabase = supabaseServer();

  const { data: pedido } = await supabase
    .from("pedidos")
    .select("*")
    .eq("numero", numero)
    .maybeSingle();

  if (!pedido) return null;

  const { data: itensBrutos } = await supabase
    .from("pedido_itens")
    .select("id, qtd, preco_unit, variantes ( cor, produtos ( nome ) )")
    .eq("pedido_id", pedido.id);

  const itens = (itensBrutos ?? []).map((item) => {
    const variante = Array.isArray(item.variantes) ? item.variantes[0] : item.variantes;
    const produto = variante
      ? Array.isArray(variante.produtos)
        ? variante.produtos[0]
        : variante.produtos
      : null;

    return {
      id: item.id,
      qtd: item.qtd,
      precoUnit: Number(item.preco_unit),
      cor: variante?.cor ?? "",
      nome: produto?.nome ?? "Produto",
    };
  });

  return { pedido, itens };
}

export default async function PedidoPage({
  params,
}: {
  params: Promise<{ numero: string }>;
}) {
  const { numero } = await params;
  const dados = await getPedido(numero);

  if (!dados) notFound();

  const { pedido, itens } = dados;
  const mensagem = MENSAGENS_STATUS[pedido.status] ?? `Status do pedido: ${pedido.status}`;

  return (
    <main className="min-h-screen bg-black p-4 pb-24 text-white sm:p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold">Pedido {pedido.numero}</h1>
        <p className="mt-2 rounded border border-yellow-500/30 bg-yellow-400/10 px-4 py-3 text-yellow-200">
          {mensagem}
        </p>

        <section className="mt-6 rounded border border-white/10 bg-white/5 p-4">
          <h2 className="mb-4 font-semibold text-yellow-400">Itens</h2>
          <ul className="space-y-2 text-sm">
            {itens.map((item) => (
              <li key={item.id} className="flex justify-between gap-2">
                <span className="text-gray-300">
                  {item.nome} ({item.cor}) x{item.qtd}
                </span>
                <span className="whitespace-nowrap">{formatarPreco(item.precoUnit * item.qtd)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-1 border-t border-white/10 pt-4 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>Subtotal</span>
              <span>{formatarPreco(Number(pedido.subtotal))}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Frete{pedido.frete_servico ? ` (${pedido.frete_servico})` : ""}</span>
              <span>{formatarPreco(Number(pedido.frete_valor))}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-white">
              <span>Total</span>
              <span>{formatarPreco(Number(pedido.total))}</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
