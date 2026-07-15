"use server";

import { redirect } from "next/navigation";
import { encerrarSessaoAdmin } from "@/lib/admin-auth";

export async function logout() {
  await encerrarSessaoAdmin();
  redirect("/admin/login");
}
