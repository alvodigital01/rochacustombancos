"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type ItemCarrinho = {
  varianteId: string;
  produtoSlug: string;
  produtoNome: string;
  cor: string;
  precoUnit: number;
  imagemUrl: string | null;
  qtd: number;
  estoque: number;
  // Peso unitário do produto, em gramas. Ausente em itens antigos já
  // salvos no localStorage; quem consome deve aplicar um fallback.
  pesoG?: number;
};

const CHAVE_STORAGE = "rc_carrinho";

type Listener = () => void;

// Store fora do React: sincronizado com localStorage via useSyncExternalStore,
// que já resolve a diferença servidor (sem storage) x cliente (com storage)
// sem precisar de setState dentro de useEffect após o mount.
let itensAtuais: ItemCarrinho[] = [];
const listeners = new Set<Listener>();

if (typeof window !== "undefined") {
  try {
    const bruto = window.localStorage.getItem(CHAVE_STORAGE);
    if (bruto) itensAtuais = JSON.parse(bruto);
  } catch {
    // storage indisponível ou JSON inválido: segue com carrinho vazio.
  }
}

function persistir(itens: ItemCarrinho[]) {
  itensAtuais = itens;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(CHAVE_STORAGE, JSON.stringify(itens));
    } catch {
      // storage indisponível: mantém só em memória nesta aba.
    }
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return itensAtuais;
}

// Precisa ser uma referência estável: useSyncExternalStore assume que o
// snapshot mudou sempre que a referência retornada é diferente da anterior,
// e um array novo a cada chamada causa um loop de re-render na hidratação.
const SNAPSHOT_SERVIDOR: ItemCarrinho[] = [];

function getServerSnapshot(): ItemCarrinho[] {
  return SNAPSHOT_SERVIDOR;
}

function adicionarItemStore(item: ItemCarrinho) {
  const existente = itensAtuais.find((i) => i.varianteId === item.varianteId);
  if (existente) {
    const novaQtd = Math.min(existente.qtd + item.qtd, existente.estoque);
    persistir(
      itensAtuais.map((i) => (i.varianteId === item.varianteId ? { ...i, qtd: novaQtd } : i))
    );
    return;
  }
  persistir([...itensAtuais, { ...item, qtd: Math.min(item.qtd, item.estoque) }]);
}

function alterarQtdStore(varianteId: string, qtd: number) {
  persistir(
    itensAtuais.map((i) =>
      i.varianteId === varianteId ? { ...i, qtd: Math.max(1, Math.min(qtd, i.estoque)) } : i
    )
  );
}

function removerItemStore(varianteId: string) {
  persistir(itensAtuais.filter((i) => i.varianteId !== varianteId));
}

function limparStore() {
  persistir([]);
}

type CarrinhoContextValue = {
  itens: ItemCarrinho[];
  quantidadeTotal: number;
  subtotal: number;
  adicionarItem: (item: ItemCarrinho) => void;
  alterarQtd: (varianteId: string, qtd: number) => void;
  removerItem: (varianteId: string) => void;
  limpar: () => void;
};

const CarrinhoContext = createContext<CarrinhoContextValue | null>(null);

export function CarrinhoProvider({ children }: { children: ReactNode }) {
  const itens = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const quantidadeTotal = useMemo(() => itens.reduce((soma, i) => soma + i.qtd, 0), [itens]);
  const subtotal = useMemo(
    () => itens.reduce((soma, i) => soma + i.qtd * i.precoUnit, 0),
    [itens]
  );

  const value = useMemo(
    () => ({
      itens,
      quantidadeTotal,
      subtotal,
      adicionarItem: adicionarItemStore,
      alterarQtd: alterarQtdStore,
      removerItem: removerItemStore,
      limpar: limparStore,
    }),
    [itens, quantidadeTotal, subtotal]
  );

  return <CarrinhoContext.Provider value={value}>{children}</CarrinhoContext.Provider>;
}

export function useCarrinho() {
  const ctx = useContext(CarrinhoContext);
  if (!ctx) throw new Error("useCarrinho precisa ser usado dentro de CarrinhoProvider");
  return ctx;
}
