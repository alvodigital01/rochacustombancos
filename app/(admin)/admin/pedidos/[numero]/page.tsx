import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase";
import { formatarPreco } from "@/lib/format";
import { marcarComoEnviado, marcarComoEntregue, marcarComoCancelado } from "./actions";
import FormularioComConfirmacao from "@/components/admin/FormularioComConfirmacao";

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

export default async function AdminPedidoDetalhePage({
  params,
}: {
  params: Promise<{ numero: string }>;
}) {
  const { numero } = await params;
  const dados = await getPedido(numero);

  if (!dados) notFound();

  const { pedido, itens } = dados;

  return (
    <main className="min-h-screen bg-black p-4 text-white sm:p-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/admin/pedidos" className="text-sm text-gray-400 hover:text-yellow-400">
          ← Pedidos
        </Link>

        <h1 className="mt-2 text-2xl font-bold">Pedido {pedido.numero}</h1>
        <p className="text-sm text-gray-400">
          Status atual: <span className="font-medium text-white">{pedido.status}</span>
        </p>

        <section className="mt-6 rounded border border-white/10 bg-white/5 p-4">
          <h2 className="mb-4 font-semibold text-yellow-400">Cliente</h2>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-gray-400">Nome</dt>
            <dd>{pedido.cliente_nome}</dd>
            <dt className="text-gray-400">E-mail</dt>
            <dd>{pedido.cliente_email}</dd>
            <dt className="text-gray-400">CPF</dt>
            <dd>{pedido.cliente_cpf}</dd>
            <dt className="text-gray-400">Telefone</dt>
            <dd>{pedido.cliente_telefone}</dd>
          </dl>
        </section>

        <section className="mt-4 rounded border border-white/10 bg-white/5 p-4">
          <h2 className="mb-4 font-semibold text-yellow-400">Endereço</h2>
          <p className="text-sm text-gray-300">
            {pedido.endereco}, {pedido.numero_end}
            {pedido.complemento ? ` — ${pedido.complemento}` : ""}
            <br />
            {pedido.bairro} — {pedido.cidade}/{pedido.uf}
            <br />
            CEP {pedido.cep}
          </p>
        </section>

        <section className="mt-4 rounded border border-white/10 bg-white/5 p-4">
          <h2 className="mb-4 font-semibold text-yellow-400">Itens</h2>
          <ul className="space-y-2 text-sm">
            {itens.map((item) => (
              <li key={item.id} className="flex justify-between gap-2">
                <span className="text-gray-300">
                  {item.nome} ({item.cor}) x{item.qtd}
                </span>
                <span>{formatarPreco(item.precoUnit * item.qtd)}</span>
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

        <section className="mt-4 rounded border border-white/10 bg-white/5 p-4">
          <h2 className="mb-4 font-semibold text-yellow-400">Pagamento</h2>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-gray-400">Status Mercado Pago</dt>
            <dd>{pedido.mp_status ?? "—"}</dd>
            <dt className="text-gray-400">ID do pagamento</dt>
            <dd>{pedido.mp_payment_id ?? "—"}</dd>
          </dl>
        </section>

        <section className="mt-4 rounded border border-white/10 bg-white/5 p-4">
          <h2 className="mb-4 font-semibold text-yellow-400">Envio</h2>

          {pedido.codigo_rastreio ? (
            <p className="text-sm text-gray-300">
              {pedido.transportadora ? `${pedido.transportadora} — ` : ""}
              {pedido.codigo_rastreio}
            </p>
          ) : (
            <form action={marcarComoEnviado} className="space-y-3">
              <input type="hidden" name="numero" value={pedido.numero} />
              <label className="block">
                <span className="mb-1 block text-xs text-gray-400">Transportadora</span>
                <input
                  name="transportadora"
                  required
                  className="w-full rounded border border-white/20 bg-black/40 px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-gray-400">Código de rastreio</span>
                <input
                  name="codigo_rastreio"
                  required
                  className="w-full rounded border border-white/20 bg-black/40 px-3 py-2 text-sm text-white"
                />
              </label>
              <button
                type="submit"
                className="rounded bg-yellow-400 px-4 py-2 text-sm font-semibold text-black"
              >
                Marcar como enviado
              </button>
            </form>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <form action={marcarComoEntregue}>
              <input type="hidden" name="numero" value={pedido.numero} />
              <button
                type="submit"
                className="rounded border border-white/20 px-4 py-2 text-sm hover:border-yellow-400"
              >
                Marcar como entregue
              </button>
            </form>

            <FormularioComConfirmacao
              action={marcarComoCancelado}
              numero={pedido.numero}
              mensagemConfirmacao="Tem certeza que quer cancelar este pedido?"
            >
              <button
                type="submit"
                className="rounded border border-red-500/40 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
              >
                Cancelar pedido
              </button>
            </FormularioComConfirmacao>
          </div>
        </section>
      </div>
    </main>
  );
}
