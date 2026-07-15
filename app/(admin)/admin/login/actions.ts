"use server";

import { redirect } from "next/navigation";
import { verificarSenhaAdmin, criarSessaoAdmin } from "@/lib/admin-auth";

export async function login(formData: FormData) {
  const senha = String(formData.get("senha") ?? "");

  if (!(await verificarSenhaAdmin(senha))) {
    redirect("/admin/login?erro=1");
  }

  await criarSessaoAdmin();
  redirect("/admin/pedidos");
}
