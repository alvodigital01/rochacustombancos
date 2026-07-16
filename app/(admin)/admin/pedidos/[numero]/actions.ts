"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verificarAdmin } from "@/lib/admin-auth";
import { supabaseServer } from "@/lib/supabase";
import { cancelarPedido, confirmarPagamento } from "@/lib/pedidos";

// O middleware já bloqueia /admin/* sem sessão, mas cada mutação também
// confere aqui — se a Server Action for chamada por qualquer outro meio,
// ela não escreve no banco sem sessão válida.
async function exigirAdmin() {
  if (!(await verificarAdmin())) {
    redirect("/admin/login");
  }
}

function redirecionarComErro(numero: string, mensagem: string): never {
  redirect(`/admin/pedidos/${numero}?erro=${encodeURIComponent(mensagem)}`);
}

export async function marcarComoEnviado(formData: FormData) {
  await exigirAdmin();

  const numero = String(formData.get("numero") ?? "");
  const transportadora = String(formData.get("transportadora") ?? "").trim();
  const codigoRastreio = String(formData.get("codigo_rastreio") ?? "").trim();

  if (!numero || !transportadora || !codigoRastreio) return;

  const supabase = supabaseServer();
  const { error } = await supabase
    .from("pedidos")
    .update({ status: "enviado", transportadora, codigo_rastreio: codigoRastreio })
    .eq("numero", numero);

  if (error) {
    console.error("Admin: erro ao marcar pedido como enviado", error);
    redirecionarComErro(numero, "Não foi possível salvar o envio. Tente de novo.");
  }

  revalidatePath(`/admin/pedidos/${numero}`);
}

export async function marcarComoEntregue(formData: FormData) {
  await exigirAdmin();

  const numero = String(formData.get("numero") ?? "");
  if (!numero) return;

  const supabase = supabaseServer();
  const { error } = await supabase
    .from("pedidos")
    .update({ status: "entregue" })
    .eq("numero", numero);

  if (error) {
    console.error("Admin: erro ao marcar pedido como entregue", error);
    redirecionarComErro(numero, "Não foi possível salvar. Tente de novo.");
  }

  revalidatePath(`/admin/pedidos/${numero}`);
}

export async function marcarComoCancelado(formData: FormData) {
  await exigirAdmin();

  const numero = String(formData.get("numero") ?? "");
  if (!numero) return;

  const resultado = await cancelarPedido(numero);

  if (!resultado.sucesso) {
    console.error("Admin: erro ao cancelar pedido", resultado.erro);
    redirecionarComErro(numero, "Não foi possível cancelar o pedido. Tente de novo.");
  }

  revalidatePath(`/admin/pedidos/${numero}`);
}

export async function marcarComoPagoManualmente(formData: FormData) {
  await exigirAdmin();

  const numero = String(formData.get("numero") ?? "");
  if (!numero) return;

  const resultado = await confirmarPagamento({ numero });

  if (!resultado.sucesso) {
    console.error("Admin: erro ao marcar pedido como pago manualmente", resultado.erro);
    redirecionarComErro(numero, "Não foi possível marcar como pago. Tente de novo.");
  }

  revalidatePath(`/admin/pedidos/${numero}`);
}
