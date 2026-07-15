import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { buscarPagamento } from "@/lib/mercadopago";

export const runtime = "nodejs";

// O Mercado Pago reenvia a notificação se não receber 200, então sempre
// respondemos 200 (mesmo em erro tratado) e só logamos o problema.
const OK = () => NextResponse.json({ recebido: true });

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);

    let body: { type?: string; data?: { id?: string } } | null = null;
    try {
      body = await request.json();
    } catch {
      body = null;
    }

    const tipo = body?.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
    if (tipo !== "payment") {
      return OK();
    }

    const paymentId = body?.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id");
    if (!paymentId) {
      return OK();
    }

    // SEGURANÇA: nunca confiar no status vindo no corpo da notificação —
    // sempre reconsultar o pagamento direto na API do Mercado Pago.
    const pagamento = await buscarPagamento(String(paymentId));
    const status = pagamento.status;
    const numero = pagamento.external_reference;

    if (!numero) {
      console.error("Webhook MP: pagamento sem external_reference", paymentId);
      return OK();
    }

    const supabase = supabaseServer();

    if (status === "approved") {
      // Idempotência: só transiciona pedidos que ainda estão aguardando
      // pagamento. Se o webhook chegar duplicado, a segunda chamada não
      // afeta nenhuma linha e não decrementa estoque de novo.
      const { data: pedidosAtualizados, error: erroUpdate } = await supabase
        .from("pedidos")
        .update({ status: "pago", mp_payment_id: String(paymentId), mp_status: status })
        .eq("numero", numero)
        .eq("status", "aguardando_pagamento")
        .select("id");

      if (erroUpdate) {
        console.error("Webhook MP: erro ao atualizar pedido", erroUpdate);
        return OK();
      }

      const pedidoConfirmadoAgora = pedidosAtualizados?.[0];

      if (pedidoConfirmadoAgora) {
        const { data: itens, error: erroItens } = await supabase
          .from("pedido_itens")
          .select("variante_id, qtd")
          .eq("pedido_id", pedidoConfirmadoAgora.id);

        if (erroItens) {
          console.error("Webhook MP: erro ao buscar itens do pedido", erroItens);
        }

        for (const item of itens ?? []) {
          const { error: erroEstoque } = await supabase.rpc("decrementar_estoque", {
            p_variante_id: item.variante_id,
            p_qtd: item.qtd,
          });
          if (erroEstoque) {
            console.error("Webhook MP: erro ao decrementar estoque", erroEstoque);
          }
        }
      }
    } else if (status === "rejected" || status === "cancelled") {
      const { error: erroUpdate } = await supabase
        .from("pedidos")
        .update({ mp_status: status, mp_payment_id: String(paymentId) })
        .eq("numero", numero);

      if (erroUpdate) {
        console.error("Webhook MP: erro ao registrar status de recusa/cancelamento", erroUpdate);
      }
    }

    // TODO opcional: validar a assinatura x-signature do Mercado Pago para
    // hardening extra (a re-consulta do pagamento acima já previne
    // falsificação de status).

    return OK();
  } catch (erro) {
    console.error("Webhook MP: erro inesperado", erro);
    return OK();
  }
}
