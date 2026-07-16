import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, Wrench } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";
import SeletorCompra from "@/components/SeletorCompra";
import Galeria from "@/components/Galeria";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";

export const dynamic = "force-dynamic";

async function getProduto(slug: string) {
  const supabase = supabaseBrowser();

  const { data: produto } = await supabase
    .from("produtos")
    .select(
      "id, nome, slug, descricao, preco, peso_g, moto_id, motos ( nome, slug )"
    )
    .eq("slug", slug)
    .eq("ativo", true)
    .maybeSingle();

  if (!produto) return null;

  // supabase-js tipa relações embutidas como array sem um schema tipado
  // gerado; produto.moto_id é único, então normalizamos pro objeto singular.
  const moto = Array.isArray(produto.motos) ? produto.motos[0] : produto.motos;

  const [{ data: variantes }, { data: imagens }] = await Promise.all([
    supabase
      .from("variantes")
      .select("id, cor, sku, estoque, preco_override, imagem_url")
      .eq("produto_id", produto.id),
    supabase
      .from("imagens_produto")
      .select("id, url, ordem")
      .eq("produto_id", produto.id)
      .order("ordem", { ascending: true }),
  ]);

  return { produto, moto, variantes: variantes ?? [], imagens: imagens ?? [] };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dados = await getProduto(slug);

  if (!dados) return { title: "Produto não encontrado" };

  return { title: dados.produto.nome };
}

export default async function ProdutoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dados = await getProduto(slug);

  if (!dados) notFound();

  const { produto, moto, variantes, imagens } = dados;

  return (
    <Section className="pb-16 pt-8 sm:pb-20 sm:pt-12">
      <Container>
        {moto && (
          <Link
            href="/motos"
            className="inline-flex items-center gap-1.5 rounded text-sm text-muted transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> {moto.nome}
          </Link>
        )}

        <div className="mt-4 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Galeria imagens={imagens} alt={produto.nome} />

          <div>
            <h1 className="font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
              {produto.nome}
            </h1>
            <p className="mt-3 text-muted">{produto.descricao}</p>

            <SeletorCompra
              variantes={variantes}
              precoBase={Number(produto.preco)}
              produtoSlug={produto.slug}
              produtoNome={produto.nome}
              produtoPesoG={produto.peso_g ?? null}
            />

            <div className="mt-8 flex items-start gap-3 rounded-2xl border border-border bg-surface p-4">
              <Wrench className="h-5 w-5 flex-shrink-0 text-accent" aria-hidden />
              <div>
                <p className="font-display text-sm font-semibold uppercase tracking-wide">
                  Você mesmo instala em minutos
                </p>
                <Link
                  href="/como-instalar"
                  className="mt-1 inline-flex items-center gap-1 rounded text-sm text-accent transition hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                >
                  Ver como instalar <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
