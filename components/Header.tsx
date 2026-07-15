"use client";

import Link from "next/link";
import { useCarrinho } from "@/components/CarrinhoContext";

export default function Header() {
  const { quantidadeTotal } = useCarrinho();

  return (
    <header className="sticky top-0 z-50 border-b border-yellow-500/30 bg-black text-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-wide">
          Rocha <span className="text-yellow-400">Custom</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/motos" className="transition hover:text-yellow-400">
            Motos
          </Link>
          <Link href="/carrinho" className="relative transition hover:text-yellow-400">
            Carrinho
            {quantidadeTotal > 0 && (
              <span className="absolute -right-4 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-black">
                {quantidadeTotal}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
