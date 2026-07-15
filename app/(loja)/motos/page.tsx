import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function getMotosComProdutoAtivo() {
  const supabase = supabaseBrowser();

  const { data: motos, error } = await supabase
    .from("motos")
    .select("id, nome, slug")
    .eq("ativo", true)
    .order("ordem", { ascending: true });

  if (error || !motos) return { motos: [], produtoPorMoto: new Map<string, { slug: string }>(), error };

  const { data: produtos } = await supabase
    .from("produtos")
    .select("moto_id, slug")
    .eq("ativo", true)
    .in("moto_id", motos.map((m) => m.id));

  const produtoPorMoto = new Map<string, { slug: string }>();
  for (const p of produtos ?? []) {
    if (!produtoPorMoto.has(p.moto_id)) produtoPorMoto.set(p.moto_id, { slug: p.slug });
  }

  return { motos, produtoPorMoto, error: null };
}

export default async function MotosPage() {
  const { motos, produtoPorMoto, error } = await getMotosComProdutoAtivo();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Escolha sua moto</h1>

      {error && (
        <p className="mt-4 text-danger">
          Erro ao conectar no Supabase: {error.message}
        </p>
      )}

      {!error && motos.length === 0 && (
        <p className="mt-4 text-muted">Nenhuma moto cadastrada ainda.</p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {motos.map((moto) => {
          const produto = produtoPorMoto.get(moto.id);
          return (
            <div key={moto.id} className="rounded-xl border border-border bg-surface p-4">
              <p className="font-medium">{moto.nome}</p>
              {produto ? (
                <Link href={`/capa/${produto.slug}`} className="mt-2 inline-block text-accent underline">
                  Ver capa
                </Link>
              ) : (
                <p className="mt-2 text-muted">Em breve</p>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
