import { NextResponse } from "next/server";
import { buscarPagamento } from "@/lib/mercadopago";
import { confirmarPagamento, marcarPagamentoRecusado } from "@/lib/pedidos";

export const runtime = "nodejs";

// "Recebido e processado" (ou intencionalmente ignorado) — o Mercado Pago
// não reenvia.
const OK = () => NextResponse.json({ recebido: true });

// "Não consegui verificar/processar" — 500 faz o Mercado Pago reenviar
// mais tarde, em vez de perdermos a notificação silenciosamente.
const FALHA_TEMPORARIA = () =>
  NextResponse.json({ recebido: false, erro: "Falha ao processar a notificação." }, { status: 500 });

export async function POST(request: Request) {
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
  // sempre reconsultar o pagamento direto na API do Mercado Pago. Se essa
  // consulta falhar (rede/timeout/instabilidade), não temos como saber o
  // status real: respondemos 500 pra o Mercado Pago tentar de novo, em vez
  // de arriscar perder a confirmação.
  let pagamento;
  try {
    pagamento = await buscarPagamento(String(paymentId));
  } catch (erro) {
    console.error("Webhook MP: falha ao consultar pagamento na API do Mercado Pago", erro);
    return FALHA_TEMPORARIA();
  }

  const status = pagamento.status;
  const numero = pagamento.external_reference;

  if (!numero) {
    // Consultamos com sucesso, só não há pedido nosso associado — reenviar
    // não muda esse fato, então não é um caso de falha temporária.
    console.error("Webhook MP: pagamento sem external_reference", paymentId);
    return OK();
  }

  try {
    if (status === "approved") {
      const resultado = await confirmarPagamento({
        numero,
        mpPaymentId: String(paymentId),
        mpStatus: status,
      });

      if (!resultado.sucesso) {
        console.error("Webhook MP: erro ao confirmar pagamento", resultado.erro);
        return FALHA_TEMPORARIA();
      }
    } else if (status === "rejected" || status === "cancelled") {
      const resultado = await marcarPagamentoRecusado({
        numero,
        mpPaymentId: String(paymentId),
        mpStatus: status,
      });

      if (!resultado.sucesso) {
        console.error("Webhook MP: erro ao registrar recusa/cancelamento", resultado.erro);
        return FALHA_TEMPORARIA();
      }
    }
  } catch (erro) {
    console.error("Webhook MP: erro inesperado ao processar pagamento", erro);
    return FALHA_TEMPORARIA();
  }

  // TODO opcional: validar a assinatura x-signature do Mercado Pago para
  // hardening extra (a re-consulta do pagamento acima já previne
  // falsificação de status).

  return OK();
}
