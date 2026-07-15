import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ numero: string }> }
) {
  const { numero } = await params;
  const supabase = supabaseServer();

  const { data: pedido } = await supabase
    .from("pedidos")
    .select("status")
    .eq("numero", numero)
    .maybeSingle();

  if (!pedido) {
    return NextResponse.json({ erro: "Pedido não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ status: pedido.status });
}
