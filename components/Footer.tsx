import { AtSign, MapPin, MessageCircle, ShieldCheck } from "lucide-react";
import Container from "@/components/ui/Container";
import { cn } from "@/lib/cn";

// TODO: substituir pelo número real de WhatsApp da loja.
const WHATSAPP_NUMERO = "5543999999999";
const INSTAGRAM_HANDLE = "rochacustombancos";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-lg font-bold uppercase tracking-wide">
            Rocha <span className="text-accent">Custom</span>
          </p>
          <p className="mt-3 max-w-[24ch] text-sm text-muted">
            Capas de banco custom pra sua moto ficar com a sua cara.
          </p>
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted">Contato</p>
          <ul className="mt-3 space-y-2.5 text-sm">
            <li>
              <a
                href={`https://wa.me/${WHATSAPP_NUMERO}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-2 rounded transition hover:text-accent",
                  FOCUS_RING
                )}
              >
                <MessageCircle className="h-4 w-4" aria-hidden /> Fale no WhatsApp
              </a>
            </li>
            <li className="inline-flex items-center gap-2 text-muted">
              <MapPin className="h-4 w-4" aria-hidden /> Londrina · PR
            </li>
          </ul>
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted">Redes sociais</p>
          <ul className="mt-3 space-y-2.5 text-sm">
            <li>
              <a
                href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-2 rounded transition hover:text-accent",
                  FOCUS_RING
                )}
              >
                <AtSign className="h-4 w-4" aria-hidden /> {INSTAGRAM_HANDLE}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted">Pagamento</p>
          <div className="mt-3 flex items-center gap-2 text-sm text-foreground">
            <ShieldCheck className="h-4 w-4 text-accent" aria-hidden /> Pagamento seguro
          </div>
          <div className="mt-3 flex gap-2 font-mono text-[11px] uppercase tracking-wider text-muted">
            <span className="rounded border border-border px-2 py-1">Pix</span>
            <span className="rounded border border-border px-2 py-1">Cartão</span>
          </div>
        </div>
      </Container>

      <div className="border-t border-border">
        <Container className="flex flex-col gap-2 py-4 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>Pronta entrega • Envio para todo o Brasil</p>
          <p>© {new Date().getFullYear()} Rocha Custom</p>
        </Container>
      </div>
    </footer>
  );
}
