import type { Metadata } from "next";
import { MessageCircle, PackageCheck, RotateCcw } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Trocas e devoluções — Rocha Custom",
  description: "Como funciona a troca ou devolução da sua capa de banco Rocha Custom.",
};

// TODO: revisar o texto da política com o time jurídico antes de publicar.
const PASSOS = [
  {
    Icone: MessageCircle,
    titulo: "Fale com a gente",
    descricao: "Chama no WhatsApp com o número do seu pedido em até 7 dias corridos após o recebimento.",
  },
  {
    Icone: RotateCcw,
    titulo: "Combine a troca",
    descricao: "A gente confirma o motivo e organiza a coleta ou o envio da capa nova.",
  },
  {
    Icone: PackageCheck,
    titulo: "Pronto",
    descricao: "Assim que recebemos o produto de volta, despachamos a substituição ou o reembolso.",
  },
];

export default function TrocasPage() {
  return (
    <Section className="pb-16 pt-10 sm:pb-20 sm:pt-14">
      <Container className="max-w-2xl">
        <Badge variant="accent">Política</Badge>
        <h1 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
          Trocas e devoluções
        </h1>
        <p className="mt-3 text-muted">
          Você tem até 7 dias corridos após o recebimento pra solicitar troca
          ou devolução, conforme o Código de Defesa do Consumidor. A capa
          precisa estar sem uso e na embalagem original.
        </p>

        <div className="mt-10 space-y-4">
          {PASSOS.map(({ Icone, titulo, descricao }) => (
            <div
              key={titulo}
              className="flex items-start gap-4 rounded-2xl border border-border bg-surface p-5"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10">
                <Icone className="h-5 w-5 text-accent" aria-hidden />
              </div>
              <div>
                <p className="font-display text-sm font-semibold uppercase tracking-wide">
                  {titulo}
                </p>
                <p className="mt-1 text-sm text-muted">{descricao}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start gap-4 rounded-2xl border border-border bg-surface p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">Pronto pra iniciar uma troca?</p>
          <Button href="/contato">Falar no WhatsApp</Button>
        </div>
      </Container>
    </Section>
  );
}
