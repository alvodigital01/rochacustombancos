import { supabaseServer } from "@/lib/supabase";

export type ResultadoOperacaoPedido =
  | { sucesso: true; jaProcessado: boolean }
  | { sucesso: false; erro: string };

// IMPORTANTE: os nomes dos parâmetros abaixo (variante_id, qtd — sem
// prefixo) precisam bater com a função decrementar_estoque/incrementar_estoque
// de verdade publicada no Supabase. Uma chamada com nomes diferentes (ex:
// p_variante_id) falha silenciosamente com "function not found".
async function decrementarEstoquePorPedido(pedidoId: string): Promise<string | null> {
  const supabase = supabaseServer();

  const { data: itens, error: erroItens } = await supabase
    .from("pedido_itens")
    .select("variante_id, qtd")
    .eq("pedido_id", pedidoId);

  if (erroItens) return erroItens.message;

  for (const item of itens ?? []) {
    const { error } = await supabase.rpc("decrementar_estoque", {
      variante_id: item.variante_id,
      qtd: item.qtd,
    });
    if (error) return error.message;
  }

  return null;
}

async function incrementarEstoquePorPedido(pedidoId: string): Promise<string | null> {
  const supabase = supabaseServer();

  const { data: itens, error: erroItens } = await supabase
    .from("pedido_itens")
    .select("variante_id, qtd")
    .eq("pedido_id", pedidoId);

  if (erroItens) return erroItens.message;

  for (const item of itens ?? []) {
    const { error } = await supabase.rpc("incrementar_estoque", {
      variante_id: item.variante_id,
      qtd: item.qtd,
    });
    if (error) return error.message;
  }

  return null;
}

// Confirma o pagamento de um pedido — usada tanto pelo webhook do Mercado
// Pago (pagamento aprovado) quanto pela ação manual do admin. Idempotente:
// só transiciona pedidos que ainda estão aguardando pagamento; uma segunda
// chamada pro mesmo pedido não decrementa estoque de novo.
export async function confirmarPagamento(params: {
  numero: string;
  mpPaymentId?: string;
  mpStatus?: string;
}): Promise<ResultadoOperacaoPedido> {
  const supabase = supabaseServer();

  const camposExtras: Record<string, string> = {};
  if (params.mpPaymentId) camposExtras.mp_payment_id = params.mpPaymentId;
  if (params.mpStatus) camposExtras.mp_status = params.mpStatus;

  const { data: pedidosAtualizados, error: erroUpdate } = await supabase
    .from("pedidos")
    .update({ status: "pago", ...camposExtras })
    .eq("numero", params.numero)
    .eq("status", "aguardando_pagamento")
    .select("id");

  if (erroUpdate) return { sucesso: false, erro: erroUpdate.message };

  const pedidoConfirmadoAgora = pedidosAtualizados?.[0];
  if (!pedidoConfirmadoAgora) {
    // Já estava pago (ou não existe) — nada a fazer, não é erro.
    return { sucesso: true, jaProcessado: true };
  }

  const erroEstoque = await decrementarEstoquePorPedido(pedidoConfirmadoAgora.id);
  if (erroEstoque) return { sucesso: false, erro: erroEstoque };

  return { sucesso: true, jaProcessado: false };
}

// Marca um pedido como pagamento recusado — usada pelo webhook quando o
// Mercado Pago retorna 'rejected'/'cancelled'. Idempotente pelo mesmo
// motivo de confirmarPagamento; nunca sobrescreve um pedido que já foi
// confirmado como pago (só transiciona a partir de aguardando_pagamento).
export async function marcarPagamentoRecusado(params: {
  numero: string;
  mpPaymentId?: string;
  mpStatus?: string;
}): Promise<ResultadoOperacaoPedido> {
  const supabase = supabaseServer();

  const camposExtras: Record<string, string> = {};
  if (params.mpPaymentId) camposExtras.mp_payment_id = params.mpPaymentId;
  if (params.mpStatus) camposExtras.mp_status = params.mpStatus;

  const { data: pedidosAtualizados, error } = await supabase
    .from("pedidos")
    .update({ status: "pagamento_recusado", ...camposExtras })
    .eq("numero", params.numero)
    .eq("status", "aguardando_pagamento")
    .select("id");

  if (error) return { sucesso: false, erro: error.message };

  return { sucesso: true, jaProcessado: !pedidosAtualizados?.length };
}

// Cancela um pedido. Se ele já estava pago/enviado/entregue (ou seja, o
// estoque já tinha sido baixado), devolve o estoque de cada item. Usa uma
// trava otimista (só atualiza se o status ainda for o que acabamos de ler)
// pra não devolver estoque duas vezes em cliques simultâneos.
export async function cancelarPedido(numero: string): Promise<ResultadoOperacaoPedido> {
  const supabase = supabaseServer();

  const { data: pedido, error: erroBusca } = await supabase
    .from("pedidos")
    .select("id, status")
    .eq("numero", numero)
    .maybeSingle();

  if (erroBusca) return { sucesso: false, erro: erroBusca.message };
  if (!pedido) return { sucesso: false, erro: "Pedido não encontrado." };
  if (pedido.status === "cancelado") return { sucesso: true, jaProcessado: true };

  const estoqueJaBaixado = ["pago", "enviado", "entregue"].includes(pedido.status);

  // Devolve o estoque ANTES de marcar como cancelado: se isso falhar (ex:
  // a função incrementar_estoque ainda não existe no banco), o pedido
  // continua com o status original em vez de ficar "cancelado" sem o
  // estoque ter voltado.
  if (estoqueJaBaixado) {
    const erroEstoque = await incrementarEstoquePorPedido(pedido.id);
    if (erroEstoque) return { sucesso: false, erro: erroEstoque };
  }

  const { data: atualizados, error: erroUpdate } = await supabase
    .from("pedidos")
    .update({ status: "cancelado" })
    .eq("id", pedido.id)
    .eq("status", pedido.status)
    .select("id");

  if (erroUpdate) return { sucesso: false, erro: erroUpdate.message };
  if (!atualizados?.length) return { sucesso: true, jaProcessado: true };

  return { sucesso: true, jaProcessado: false };
}
