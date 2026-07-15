import Link from "next/link";
import {
  ArrowRight,
  AtSign,
  PackageCheck,
  ShieldCheck,
  Truck,
  Wrench,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase";
import { formatarPreco } from "@/lib/format";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import Section from "@/components/ui/Section";

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

const BENEFICIOS = [
  {
    Icone: PackageCheck,
    titulo: "Pronta entrega",
    descricao: "Produto pronto no estoque, sem espera de fabricação.",
  },
  {
    Icone: Wrench,
    titulo: "Você mesmo instala",
    descricao: "Em poucos minutos, sem ferramenta especial nem oficina.",
  },
  {
    Icone: ShieldCheck,
    titulo: "Pagamento seguro",
    descricao: "Pix ou cartão, processado direto pelo Mercado Pago.",
  },
  {
    Icone: Truck,
    titulo: "Envio pro Brasil todo",
    descricao: "Despachamos pra qualquer CEP, de norte a sul.",
  },
];

const PASSOS = [
  {
    numero: "01",
    titulo: "Remova a capa original",
    descricao: "Solte as presilhas do banco da sua moto — leva segundos.",
  },
  {
    numero: "02",
    titulo: "Encaixe a Rocha Custom",
    descricao: "Alinhe pelas bordas e acomode o tecido sob o assento.",
  },
  {
    numero: "03",
    titulo: "Prenda e pronto",
    descricao: "Fixe os elásticos e grampos — sem cola, sem oficina.",
  },
];

// TODO: substituir por depoimentos reais de clientes assim que tivermos.
const DEPOIMENTOS = [
  {
    nome: "Marcos R.",
    cidade: "Londrina · PR",
    texto: "Ficou show na minha Fan, instalei sozinho em uns 10 minutos.",
  },
  {
    nome: "Juliana T.",
    cidade: "Maringá · PR",
    texto: "Acabamento muito bom, não esperava por esse preço.",
  },
  {
    nome: "Diego A.",
    cidade: "Curitiba · PR",
    texto: "Chegou rápido e o material é bem mais grosso que o original.",
  },
];

const FAIXA_OFICINA =
  "bg-[repeating-linear-gradient(135deg,#F2B705_0px,#F2B705_14px,#0B0B0C_14px,#0B0B0C_28px)] h-1.5 w-full";

export default async function HomePage() {
  const { moto, produto, error } = await getMotoDestaque();
  const linkProdutoAtivo = produto ? `/capa/${produto.slug}` : "/motos";

  return (
    <>
      {/* HERO */}
      <Section className="pb-12 pt-10 sm:pb-20 sm:pt-16">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <Badge variant="accent">Capa de banco · Honda Fan 160</Badge>

              <h1 className="mt-5 font-display text-4xl font-bold uppercase leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Conforto, estilo e durabilidade pra sua{" "}
                <span className="text-accent">Fan 160</span>
              </h1>

              <p className="mt-5 max-w-md text-base text-muted sm:text-lg">
                Capa costurada com acabamento reforçado e instalação em
                minutos — sem precisar de oficina.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button href={linkProdutoAtivo} size="lg">
                  Comprar agora
                </Button>
                <Button href="/motos" variant="secondary" size="lg">
                  Ver todas as motos
                </Button>
              </div>

              <ul className="mt-8 flex flex-wrap gap-2">
                <li>
                  <Badge>Pronta entrega</Badge>
                </li>
                <li>
                  <Badge>Você mesmo instala em minutos</Badge>
                </li>
                <li>
                  <Badge>Envio para todo o Brasil</Badge>
                </li>
              </ul>
            </div>

            <ImagePlaceholder className="aspect-[4/5] w-full lg:aspect-square" />
          </div>
        </Container>
      </Section>

      <Container>
        <div className="h-px w-full border-t-2 border-dashed border-accent/20" />
      </Container>

      {/* BENEFÍCIOS */}
      <Section>
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFICIOS.map(({ Icone, titulo, descricao }) => (
              <div
                key={titulo}
                className="rounded-2xl border border-border bg-surface p-6 transition hover:border-accent/40"
              >
                <Icone className="h-6 w-6 text-accent" aria-hidden />
                <p className="mt-4 font-display text-base font-semibold uppercase tracking-wide">
                  {titulo}
                </p>
                <p className="mt-2 text-sm text-muted">{descricao}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* DESTAQUE DO PRODUTO */}
      <Section className="bg-surface">
        <Container>
          {error && (
            <p className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
              Erro ao conectar no Supabase: {error.message}
            </p>
          )}

          {!error && !moto && (
            <p className="rounded-xl border border-border bg-bg p-4 text-sm text-muted">
              Nenhuma moto com slug &quot;honda-fan-160&quot; encontrada.
              Confirme se o .env.local está preenchido e se o schema foi
              rodado no Supabase.
            </p>
          )}

          {moto && (
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <ImagePlaceholder className="aspect-square w-full max-w-md" />

              <div>
                <Badge variant="accent">Modelo em destaque</Badge>
                <h2 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
                  {moto.nome}
                </h2>

                {produto ? (
                  <>
                    <p className="mt-2 text-lg text-muted">{produto.nome}</p>
                    <p className="mt-4 font-mono text-3xl font-bold text-accent">
                      {formatarPreco(Number(produto.preco))}
                    </p>
                    <Button href={`/capa/${produto.slug}`} className="mt-6">
                      Ver capa
                    </Button>
                  </>
                ) : (
                  <p className="mt-4 text-muted">
                    Nenhum produto ativo para esta moto ainda.
                  </p>
                )}
              </div>
            </div>
          )}
        </Container>
      </Section>

      {/* COMO INSTALAR */}
      <Section>
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="accent">Instalação</Badge>
            <h2 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
              Instale em 3 passos
            </h2>
            <p className="mt-3 text-muted">
              Sem oficina, sem ferramenta especial — você mesmo troca a capa
              da sua Fan em poucos minutos.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {PASSOS.map((passo) => (
              <div key={passo.numero} className="text-center sm:text-left">
                <span className="font-mono text-sm text-accent">{passo.numero}</span>
                <p className="mt-2 font-display text-lg font-semibold uppercase tracking-wide">
                  {passo.titulo}
                </p>
                <p className="mt-2 text-sm text-muted">{passo.descricao}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center sm:text-left">
            <Link
              href="/como-instalar"
              className="inline-flex items-center gap-2 rounded font-display text-sm font-semibold uppercase tracking-wide text-accent transition hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              Ver tutorial completo <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </Container>
      </Section>

      {/* PROVA SOCIAL */}
      <Section className="bg-surface">
        <Container>
          <div className="flex flex-col items-center gap-2 text-center">
            <AtSign className="h-6 w-6 text-accent" aria-hidden />
            <p className="font-display text-2xl font-bold uppercase tracking-wide sm:text-3xl">
              +1.500 seguidores no Instagram
            </p>
            <p className="text-sm text-muted">@rochacustombancos</p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {DEPOIMENTOS.map((depoimento) => (
              <div key={depoimento.nome} className="rounded-2xl border border-border bg-bg p-6">
                <p className="text-sm text-foreground">&ldquo;{depoimento.texto}&rdquo;</p>
                <p className="mt-4 font-mono text-xs uppercase tracking-wider text-muted">
                  {depoimento.nome} · {depoimento.cidade}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* CHAMADA FINAL */}
      <div className={FAIXA_OFICINA} />
      <Section className="bg-surface">
        <Container className="flex flex-col items-center gap-6 text-center">
          <h2 className="font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Pronto pra deixar sua Fan 160 com a sua cara?
          </h2>
          <Button href={linkProdutoAtivo} size="lg">
            Comprar agora
          </Button>
        </Container>
      </Section>
      <div className={FAIXA_OFICINA} />
    </>
  );
}
