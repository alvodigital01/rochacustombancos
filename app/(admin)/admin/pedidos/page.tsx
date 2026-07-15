import Link from "next/link";
import { supabaseServer } from "@/lib/supabase";
import { formatarPreco } from "@/lib/format";
import { logout } from "../actions";

export const dynamic = "force-dynamic";

const STATUS_OPCOES = [
  { valor: "", label: "Todos" },
  { valor: "aguardando_pagamento", label: "Aguardando pagamento" },
  { valor: "pago", label: "Pago" },
  { valor: "enviado", label: "Enviado" },
  { valor: "entregue", label: "Entregue" },
  { valor: "cancelado", label: "Cancelado" },
];

const STATUS_CORES: Record<string, string> = {
  aguardando_pagamento: "bg-gray-500/20 text-gray-300",
  pago: "bg-green-500/20 text-green-300",
  enviado: "bg-blue-500/20 text-blue-300",
  entregue: "bg-emerald-500/20 text-emerald-300",
  cancelado: "bg-red-500/20 text-red-300",
};

async function getPedidos(status: string, busca: string) {
  const supabase = supabaseServer();

  let query = supabase.from("pedidos").select("*").order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  if (busca) {
    // Remove caracteres com significado especial na mini-linguagem de
    // filtro do PostgREST antes de interpolar no .or().
    const buscaSegura = busca.replace(/[,()]/g, "").trim();
    if (buscaSegura) {
      query = query.or(`numero.ilike.%${buscaSegura}%,cliente_nome.ilike.%${buscaSegura}%`);
    }
  }

  const { data } = await query;
  return data ?? [];
}

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; busca?: string }>;
}) {
  const { status = "", busca = "" } = await searchParams;
  const pedidos = await getPedidos(status, busca);

  return (
    <main className="min-h-screen bg-black p-4 text-white sm:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Pedidos</h1>
          <form action={logout}>
            <button
              type="submit"
              className="rounded border border-white/20 px-3 py-1.5 text-sm hover:border-yellow-400"
            >
              Sair
            </button>
          </form>
        </div>

        <form method="get" className="mt-6 flex flex-wrap gap-3">
          <select
            name="status"
            defaultValue={status}
            className="rounded border border-white/20 bg-black/40 px-3 py-2 text-sm"
          >
            {STATUS_OPCOES.map((opcao) => (
              <option key={opcao.valor} value={opcao.valor}>
                {opcao.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="busca"
            defaultValue={busca}
            placeholder="Buscar por número ou cliente"
            className="min-w-[220px] flex-1 rounded border border-white/20 bg-black/40 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded bg-yellow-400 px-4 py-2 text-sm font-semibold text-black"
          >
            Filtrar
          </button>
        </form>

        <div className="mt-6 overflow-x-auto rounded border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left text-gray-400">
              <tr>
                <th className="px-4 py-2">Número</th>
                <th className="px-4 py-2">Data</th>
                <th className="px-4 py-2">Cliente</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((pedido) => (
                <tr key={pedido.id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="px-4 py-2">
                    <Link
                      href={`/admin/pedidos/${pedido.numero}`}
                      className="text-yellow-400 underline"
                    >
                      {pedido.numero}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-300">
                    {new Date(pedido.created_at).toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-2 text-gray-300">{pedido.cliente_nome}</td>
                  <td className="whitespace-nowrap px-4 py-2">
                    {formatarPreco(Number(pedido.total))}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded px-2 py-1 text-xs ${
                        STATUS_CORES[pedido.status] ?? "bg-white/10 text-gray-300"
                      }`}
                    >
                      {pedido.status}
                    </span>
                  </td>
                </tr>
              ))}
              {pedidos.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
