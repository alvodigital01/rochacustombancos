"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verificarAdmin } from "@/lib/admin-auth";
import { supabaseServer } from "@/lib/supabase";

// O middleware já bloqueia /admin/* sem sessão, mas cada mutação também
// confere aqui — se a Server Action for chamada por qualquer outro meio,
// ela não escreve no banco sem sessão válida.
async function exigirAdmin() {
  if (!(await verificarAdmin())) {
    redirect("/admin/login");
  }
}

export async function marcarComoEnviado(formData: FormData) {
  await exigirAdmin();

  const numero = String(formData.get("numero") ?? "");
  const transportadora = String(formData.get("transportadora") ?? "").trim();
  const codigoRastreio = String(formData.get("codigo_rastreio") ?? "").trim();

  if (!numero || !transportadora || !codigoRastreio) return;

  const supabase = supabaseServer();
  await supabase
    .from("pedidos")
    .update({ status: "enviado", transportadora, codigo_rastreio: codigoRastreio })
    .eq("numero", numero);

  revalidatePath(`/admin/pedidos/${numero}`);
}

export async function marcarComoEntregue(formData: FormData) {
  await exigirAdmin();

  const numero = String(formData.get("numero") ?? "");
  if (!numero) return;

  const supabase = supabaseServer();
  await supabase.from("pedidos").update({ status: "entregue" }).eq("numero", numero);

  revalidatePath(`/admin/pedidos/${numero}`);
}

export async function marcarComoCancelado(formData: FormData) {
  await exigirAdmin();

  const numero = String(formData.get("numero") ?? "");
  if (!numero) return;

  const supabase = supabaseServer();
  await supabase.from("pedidos").update({ status: "cancelado" }).eq("numero", numero);

  revalidatePath(`/admin/pedidos/${numero}`);
}
