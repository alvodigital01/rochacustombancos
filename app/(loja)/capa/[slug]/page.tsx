import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { supabaseBrowser } from "@/lib/supabase";
import { formatarPreco } from "@/lib/format";
import SeletorCompra from "@/components/SeletorCompra";

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
    <main className="p-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          {imagens.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {imagens.map((img) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={img.id}
                  src={img.url}
                  alt={produto.nome}
                  className="aspect-square w-full rounded-xl border border-border object-cover"
                />
              ))}
            </div>
          ) : (
            <div className="flex aspect-square w-full items-center justify-center rounded-xl border border-border bg-surface text-muted">
              Sem imagem
            </div>
          )}
        </div>

        <div>
          {moto && (
            <Link href="/motos" className="text-sm text-muted underline">
              {moto.nome}
            </Link>
          )}
          <h1 className="text-2xl font-bold">{produto.nome}</h1>
          <p className="mt-2 text-muted">{produto.descricao}</p>
          <p className="mt-2 text-sm text-muted">
            Preço base: {formatarPreco(Number(produto.preco))}
          </p>

          <SeletorCompra
            variantes={variantes}
            precoBase={Number(produto.preco)}
            produtoSlug={produto.slug}
            produtoNome={produto.nome}
            produtoPesoG={produto.peso_g ?? null}
          />

          <div className="mt-8 rounded-xl border border-border bg-surface p-4">
            <p className="font-medium">Você mesmo instala em minutos</p>
            <Link href="/como-instalar" className="text-accent underline">
              Ver como instalar
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
