import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";
import Badge from "@/components/ui/Badge";
import Container from "@/components/ui/Container";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import Section from "@/components/ui/Section";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Escolha sua moto — Rocha Custom",
  description: "Veja as motos com capa de banco Rocha Custom disponível.",
};

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
    <Section className="pb-20 pt-12 sm:pt-16">
      <Container>
        <Badge variant="accent">Catálogo</Badge>
        <h1 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight sm:text-5xl">
          Escolha sua moto
        </h1>
        <p className="mt-3 max-w-md text-muted">
          Selecione o modelo pra ver a capa de banco feita sob medida pra ele.
        </p>

        {error && (
          <p className="mt-8 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
            Erro ao conectar no Supabase: {error.message}
          </p>
        )}

        {!error && motos.length === 0 && (
          <p className="mt-8 rounded-xl border border-border bg-surface p-4 text-sm text-muted">
            Nenhuma moto cadastrada ainda.
          </p>
        )}

        <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {motos.map((moto) => {
            const produto = produtoPorMoto.get(moto.id);
            const conteudo = (
              <>
                <ImagePlaceholder
                  label=""
                  className="aspect-square w-full transition group-hover:scale-[1.02] group-hover:border-accent"
                />
                <div className="mt-3">
                  <p className="font-display text-sm font-semibold uppercase tracking-wide sm:text-base">
                    {moto.nome}
                  </p>
                  {produto ? (
                    <span className="mt-1 inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wide text-accent">
                      Ver capa <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </span>
                  ) : (
                    <Badge variant="muted" className="mt-1">
                      Em breve
                    </Badge>
                  )}
                </div>
              </>
            );

            return produto ? (
              <Link
                key={moto.id}
                href={`/capa/${produto.slug}`}
                className="group rounded-2xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                {conteudo}
              </Link>
            ) : (
              <div key={moto.id} className="opacity-60">
                {conteudo}
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
