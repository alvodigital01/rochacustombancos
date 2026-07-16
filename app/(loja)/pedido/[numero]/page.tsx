import { notFound } from "next/navigation";
import { Truck } from "lucide-react";
import { supabaseServer } from "@/lib/supabase";
import { formatarPreco } from "@/lib/format";
import StatusPedido from "@/components/StatusPedido";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";

export const dynamic = "force-dynamic";

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

  return (
    <Section className="pb-16 pt-10 sm:pb-20 sm:pt-14">
      <Container className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">Pedido</p>
        <h1 className="mt-1 font-display text-2xl font-bold uppercase sm:text-3xl">
          {pedido.numero}
        </h1>

        <StatusPedido numero={pedido.numero} statusInicial={pedido.status} />

        {(pedido.status === "enviado" || pedido.status === "entregue") && pedido.codigo_rastreio && (
          <section className="mt-4 flex items-start gap-3 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4">
            <Truck className="h-5 w-5 flex-shrink-0 text-blue-400" aria-hidden />
            <div>
              <p className="font-display text-sm font-semibold uppercase tracking-wide">Rastreio</p>
              <p className="mt-1 text-sm">
                {pedido.transportadora ? `${pedido.transportadora} — ` : ""}
                <span className="font-mono">{pedido.codigo_rastreio}</span>
              </p>
              <p className="mt-1 text-xs text-muted">Rastreio automático chega em breve.</p>
            </div>
          </section>
        )}

        <section className="mt-6 rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-accent">
            Itens
          </h2>
          <ul className="space-y-2 text-sm">
            {itens.map((item) => (
              <li key={item.id} className="flex justify-between gap-2">
                <span className="text-muted">
                  {item.nome} ({item.cor}) x{item.qtd}
                </span>
                <span className="whitespace-nowrap font-mono">
                  {formatarPreco(item.precoUnit * item.qtd)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span className="font-mono">{formatarPreco(Number(pedido.subtotal))}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Frete{pedido.frete_servico ? ` (${pedido.frete_servico})` : ""}</span>
              <span className="font-mono">{formatarPreco(Number(pedido.frete_valor))}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="font-mono text-accent">{formatarPreco(Number(pedido.total))}</span>
            </div>
          </div>
        </section>
      </Container>
    </Section>
  );
}
