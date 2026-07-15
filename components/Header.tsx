"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, ShoppingCart, X } from "lucide-react";
import { useCarrinho } from "@/components/CarrinhoContext";
import Container from "@/components/ui/Container";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/", label: "Início" },
  { href: "/motos", label: "Motos" },
  { href: "/como-instalar", label: "Como instalar" },
];

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

export default function Header() {
  const { quantidadeTotal } = useCarrinho();
  const [scrolled, setScrolled] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    function aoRolar() {
      setScrolled(window.scrollY > 8);
    }
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors",
        scrolled ? "border-border bg-bg/85 backdrop-blur-md" : "border-transparent bg-bg/40 backdrop-blur-sm"
      )}
    >
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className={cn("rounded font-display text-xl font-bold uppercase tracking-wide", FOCUS_RING)}
        >
          Rocha <span className="text-accent">Custom Bancos</span>
        </Link>

        <nav className="hidden items-center gap-8 font-display text-sm uppercase tracking-wide text-muted md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn("rounded transition hover:text-accent", FOCUS_RING)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href="/carrinho"
            aria-label="Carrinho"
            className={cn(
              "relative flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition hover:bg-surface",
              FOCUS_RING
            )}
          >
            <ShoppingCart className="h-5 w-5" />
            {quantidadeTotal > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 font-mono text-[11px] font-bold text-accent-foreground">
                {quantidadeTotal}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setMenuAberto((aberto) => !aberto)}
            aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuAberto}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition hover:bg-surface md:hidden",
              FOCUS_RING
            )}
          >
            {menuAberto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </Container>

      {menuAberto && (
        <nav className="border-t border-border bg-bg px-4 py-3 font-display text-sm uppercase tracking-wide text-muted md:hidden">
          <ul className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuAberto(false)}
                  className={cn(
                    "block rounded-lg px-3 py-2.5 transition hover:bg-surface hover:text-accent",
                    FOCUS_RING
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
