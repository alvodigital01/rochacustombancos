import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase";
import { formatarPreco } from "@/lib/format";

// Renderiza no request, não no build: as envs do Supabase só existem
// depois que o .env.local é preenchido, então prerender estático falharia.
export const dynamic = "force-dynamic";

async function getMotoDestaque() {
  const supabase = supabaseBrowser();

  const { data: moto, error: motoError } = await supabase
    .from("motos")
    .select("id, nome, slug")
    .eq("slug", "honda-fan-160")
    .maybeSingle();

  if (motoError || !moto) return { moto: null, produto: null, error: motoError };

  const { data: produto, error: produtoError } = await supabase
    .from("produtos")
    .select("nome, slug, preco")
    .eq("moto_id", moto.id)
    .eq("ativo", true)
    .maybeSingle();

  return { moto, produto, error: produtoError };
}

export default async function HomePage() {
  const { moto, produto, error } = await getMotoDestaque();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Home</h1>

      {error && (
        <p className="mt-4 text-red-600">
          Erro ao conectar no Supabase: {error.message}
        </p>
      )}

      {!error && !moto && (
        <p className="mt-4 text-gray-500">
          Nenhuma moto com slug &quot;honda-fan-160&quot; encontrada. Confirme
          se o .env.local está preenchido e se o schema foi rodado no
          Supabase.
        </p>
      )}

      {moto && (
        <div className="mt-4">
          <p>Moto: {moto.nome}</p>
          {produto ? (
            <div className="mt-2">
              <p>
                {produto.nome} — {formatarPreco(Number(produto.preco))}
              </p>
              <Link
                href={`/capa/${produto.slug}`}
                className="mt-2 inline-block rounded bg-black px-4 py-2 text-white"
              >
                Ver capa
              </Link>
            </div>
          ) : (
            <p className="text-gray-500">Nenhum produto ativo para esta moto ainda.</p>
          )}
        </div>
      )}
    </main>
  );
}
