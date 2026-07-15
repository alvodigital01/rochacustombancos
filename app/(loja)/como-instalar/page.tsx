import type { Metadata } from "next";
import { CheckCircle2, Layers, Unlock } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import Section from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Como instalar — Rocha Custom",
  description:
    "Passo a passo pra instalar sua capa de banco Rocha Custom em minutos, sem oficina e sem ferramenta especial.",
};

const PASSOS = [
  {
    Icone: Unlock,
    numero: "01",
    titulo: "Remova a capa original",
    descricao:
      "Solte as presilhas ou o elástico do banco da sua moto. Não precisa de chave de fenda nem ferramenta especial — é só destravar e puxar.",
  },
  {
    Icone: Layers,
    numero: "02",
    titulo: "Encaixe a Rocha Custom",
    descricao:
      "Posicione a capa nova alinhando as bordas com o formato do banco. O tecido já vem cortado sob medida pro seu modelo.",
  },
  {
    Icone: CheckCircle2,
    numero: "03",
    titulo: "Prenda e pronto",
    descricao:
      "Fixe os elásticos e grampos por baixo do assento, como estavam antes. Pronto — sua moto com a cara nova em poucos minutos.",
  },
];

export default function ComoInstalarPage() {
  return (
    <>
      <Section className="pb-12 pt-12 sm:pt-16">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <Badge variant="accent">Instalação</Badge>
              <h1 className="mt-4 font-display text-4xl font-bold uppercase leading-[1.05] tracking-tight sm:text-5xl">
                Você mesmo instala em minutos
              </h1>
              <p className="mt-5 max-w-md text-muted">
                Sem oficina, sem parafuso, sem complicação. Veja o passo a
                passo completo e troque a capa de banco da sua moto sozinho.
              </p>

              <ul className="mt-8 flex flex-wrap gap-2">
                <li>
                  <Badge>Sem ferramenta especial</Badge>
                </li>
                <li>
                  <Badge>Sem cola</Badge>
                </li>
                <li>
                  <Badge>Sem oficina</Badge>
                </li>
              </ul>
            </div>

            <ImagePlaceholder
              label="Foto ou vídeo do passo a passo aqui"
              className="aspect-[4/3] w-full"
            />
          </div>
        </Container>
      </Section>

      <Container>
        <div className="h-px w-full border-t-2 border-dashed border-accent/20" />
      </Container>

      <Section>
        <Container>
          <div className="grid gap-10 sm:grid-cols-3 sm:gap-8">
            {PASSOS.map(({ Icone, numero, titulo, descricao }) => (
              <div key={numero} className="rounded-2xl border border-border bg-surface p-6">
                <div className="flex items-center gap-3">
                  <Icone className="h-6 w-6 text-accent" aria-hidden />
                  <span className="font-mono text-sm text-accent">{numero}</span>
                </div>
                <p className="mt-4 font-display text-lg font-semibold uppercase tracking-wide">
                  {titulo}
                </p>
                <p className="mt-2 text-sm text-muted">{descricao}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-surface">
        <Container className="flex flex-col items-center gap-6 text-center">
          <h2 className="font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Ainda não tem a sua?
          </h2>
          <p className="max-w-md text-muted">
            Escolha sua moto e garanta a capa de banco Rocha Custom com pronta
            entrega.
          </p>
          <Button href="/motos" size="lg">
            Ver todas as motos
          </Button>
        </Container>
      </Section>
    </>
  );
}
