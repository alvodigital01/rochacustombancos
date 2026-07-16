import type { Metadata } from "next";
import { AtSign, MapPin, MessageCircle } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Contato — Rocha Custom",
  description: "Fale com a Rocha Custom pelo WhatsApp ou Instagram.",
};

// TODO: substituir pelo número real de WhatsApp da loja.
const WHATSAPP_NUMERO = "5543999999999";
const INSTAGRAM_HANDLE = "rochacustombancos";

export default function ContatoPage() {
  return (
    <Section className="pb-16 pt-10 sm:pb-20 sm:pt-14">
      <Container className="max-w-2xl">
        <Badge variant="accent">Contato</Badge>
        <h1 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
          Fala com a gente
        </h1>
        <p className="mt-3 text-muted">
          Prefere falar direto? O WhatsApp é o jeito mais rápido de te
          atender.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <a
            href={`https://wa.me/${WHATSAPP_NUMERO}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-4 rounded-2xl border border-accent/30 bg-accent/10 p-5 transition hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <MessageCircle className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="font-display text-sm font-semibold uppercase tracking-wide">WhatsApp</p>
              <p className="mt-1 text-sm text-muted">Resposta rápida, todos os dias.</p>
            </div>
          </a>

          <a
            href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-4 rounded-2xl border border-border bg-surface p-5 transition hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/10">
              <AtSign className="h-5 w-5 text-accent" aria-hidden />
            </div>
            <div>
              <p className="font-display text-sm font-semibold uppercase tracking-wide">Instagram</p>
              <p className="mt-1 text-sm text-muted">{INSTAGRAM_HANDLE}</p>
            </div>
          </a>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-surface p-5">
          <MapPin className="h-5 w-5 flex-shrink-0 text-accent" aria-hidden />
          <div>
            <p className="font-display text-sm font-semibold uppercase tracking-wide">Onde estamos</p>
            <p className="mt-1 text-sm text-muted">Londrina · PR</p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Button
            href={`https://wa.me/${WHATSAPP_NUMERO}`}
            target="_blank"
            rel="noopener noreferrer"
            size="lg"
          >
            Chamar no WhatsApp
          </Button>
        </div>
      </Container>
    </Section>
  );
}
