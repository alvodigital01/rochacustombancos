"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ShieldCheck, ShoppingCart } from "lucide-react";
import { useCarrinho } from "@/components/CarrinhoContext";
import { formatarPreco, formatarCPF, formatarTelefone } from "@/lib/format";
import { buscarEndereco, type Endereco } from "@/lib/cep";
import { calcularFrete } from "@/lib/frete";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import { cn } from "@/lib/cn";

const PESO_FALLBACK_G = 450;

const inputClass =
  "w-full rounded-lg border border-border bg-bg/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition";

function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

function Etapa({
  numero,
  titulo,
  children,
}: {
  numero: string;
  titulo: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="font-mono text-xs text-accent">{numero}</span>
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide">{titulo}</h2>
      </div>
      {children}
    </section>
  );
}

export default function CheckoutPage() {
  const { itens, subtotal, limpar } = useCarrinho();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");

  const [cep, setCep] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [freteId, setFreteId] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [processando, setProcessando] = useState(false);

  // Só o resultado bruto da busca do CEP vira estado (setado de forma
  // assíncrona, dentro do .then). Tudo o mais — endereço, status, opções de
  // frete — é derivado dele a cada render, então trocar o CEP não exige
  // nenhum reset manual de estado.
  const [resultadoCep, setResultadoCep] = useState<{ cep: string; endereco: Endereco | null } | null>(
    null
  );

  const pesoTotalG = useMemo(
    () => itens.reduce((soma, item) => soma + (item.pesoG ?? PESO_FALLBACK_G) * item.qtd, 0),
    [itens]
  );

  const cepLimpo = cep.replace(/\D/g, "");
  const cepValido = cepLimpo.length === 8;
  const resultadoAtual = resultadoCep?.cep === cepLimpo ? resultadoCep : null;
  const buscandoCep = cepValido && !resultadoAtual;
  const cepComErro = resultadoAtual !== null && resultadoAtual.endereco === null;
  const endereco = resultadoAtual?.endereco ?? null;

  useEffect(() => {
    if (!cepValido) return;

    let cancelado = false;

    buscarEndereco(cepLimpo).then((resultado) => {
      if (cancelado) return;
      setResultadoCep({ cep: cepLimpo, endereco: resultado });
    });

    return () => {
      cancelado = true;
    };
  }, [cepValido, cepLimpo]);

  const opcoesFrete = useMemo(
    () => (endereco ? calcularFrete(cepLimpo, pesoTotalG, subtotal) : []),
    [endereco, cepLimpo, pesoTotalG, subtotal]
  );

  const frete = opcoesFrete.find((o) => o.id === freteId) ?? opcoesFrete[0] ?? null;
  const total = subtotal + (frete?.valor ?? 0);

  const formularioCompleto =
    nome.trim().length > 0 &&
    email.trim().length > 0 &&
    cpf.replace(/\D/g, "").length === 11 &&
    telefone.replace(/\D/g, "").length >= 10 &&
    !!endereco &&
    numero.trim().length > 0 &&
    !!frete;

  async function irParaPagamento() {
    if (!formularioCompleto || !endereco || !frete) {
      setAviso("Preencha todos os campos e escolha o frete antes de continuar.");
      return;
    }

    setProcessando(true);
    setAviso(null);

    try {
      const resposta = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itens: itens.map((item) => ({ varianteId: item.varianteId, qtd: item.qtd })),
          cliente: { nome, email, cpf, telefone },
          endereco: {
            cep: cepLimpo,
            logradouro: endereco.logradouro,
            bairro: endereco.bairro,
            cidade: endereco.cidade,
            uf: endereco.uf,
            numero,
            complemento,
          },
          freteId: frete.id,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setAviso(dados.erro ?? "Não foi possível continuar. Tente novamente.");
        setProcessando(false);
        return;
      }

      limpar();
      window.location.href = dados.initPoint;
    } catch {
      setAviso("Não foi possível conectar. Verifique sua internet e tente de novo.");
      setProcessando(false);
    }
  }

  if (itens.length === 0) {
    return (
      <Section className="flex min-h-[70vh] items-center">
        <Container className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-surface">
            <ShoppingCart className="h-7 w-7 text-muted" aria-hidden />
          </div>
          <h1 className="font-display text-2xl font-bold uppercase">Seu carrinho está vazio</h1>
          <p className="text-muted">Adicione algo antes de ir pro checkout.</p>
          <Button href="/motos" size="lg" className="mt-2">
            Ver motos
          </Button>
        </Container>
      </Section>
    );
  }

  return (
    <Section className="pb-16 pt-8 sm:pb-20 sm:pt-12">
      <Container>
        <h1 className="font-display text-2xl font-bold uppercase sm:text-3xl">Checkout</h1>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4 lg:order-1">
            <Etapa numero="01" titulo="Seus dados">
              <div className="space-y-3">
                <Campo label="Nome completo">
                  <input value={nome} onChange={(e) => setNome(e.target.value)} className={inputClass} />
                </Campo>
                <Campo label="E-mail">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </Campo>
                <div className="grid grid-cols-2 gap-3">
                  <Campo label="CPF">
                    <input
                      value={cpf}
                      onChange={(e) => setCpf(formatarCPF(e.target.value))}
                      placeholder="000.000.000-00"
                      inputMode="numeric"
                      className={inputClass}
                    />
                  </Campo>
                  <Campo label="Telefone">
                    <input
                      value={telefone}
                      onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                      placeholder="(00) 00000-0000"
                      inputMode="numeric"
                      className={inputClass}
                    />
                  </Campo>
                </div>
              </div>
            </Etapa>

            <Etapa numero="02" titulo="Endereço de entrega">
              <div className="space-y-3">
                <Campo label="CEP">
                  <input
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    placeholder="00000-000"
                    inputMode="numeric"
                    maxLength={9}
                    className={inputClass}
                  />
                  {buscandoCep && (
                    <p className="mt-1 text-xs text-muted">Buscando endereço...</p>
                  )}
                  {cepComErro && (
                    <p className="mt-1 text-xs text-danger">
                      CEP não encontrado. Confira e tente de novo.
                    </p>
                  )}
                </Campo>

                {endereco && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <Campo label="Logradouro">
                        <input value={endereco.logradouro} readOnly className={cn(inputClass, "opacity-70")} />
                      </Campo>
                      <Campo label="Bairro">
                        <input value={endereco.bairro} readOnly className={cn(inputClass, "opacity-70")} />
                      </Campo>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Campo label="Cidade">
                        <input value={endereco.cidade} readOnly className={cn(inputClass, "opacity-70")} />
                      </Campo>
                      <Campo label="UF">
                        <input value={endereco.uf} readOnly className={cn(inputClass, "opacity-70")} />
                      </Campo>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Campo label="Número">
                        <input
                          value={numero}
                          onChange={(e) => setNumero(e.target.value)}
                          className={inputClass}
                        />
                      </Campo>
                      <Campo label="Complemento (opcional)">
                        <input
                          value={complemento}
                          onChange={(e) => setComplemento(e.target.value)}
                          className={inputClass}
                        />
                      </Campo>
                    </div>
                  </>
                )}
              </div>
            </Etapa>

            {opcoesFrete.length > 0 && (
              <Etapa numero="03" titulo="Frete">
                <div className="space-y-2">
                  {opcoesFrete.map((opcao) => (
                    <label
                      key={opcao.id}
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-2 rounded-xl border px-4 py-3 transition",
                        freteId === opcao.id
                          ? "border-accent bg-accent/10"
                          : "border-border hover:border-accent/40"
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="frete"
                          checked={freteId === opcao.id}
                          onChange={() => setFreteId(opcao.id)}
                          className="h-4 w-4 accent-accent"
                        />
                        <span className="text-sm">
                          {opcao.nome} — até {opcao.prazoDias} dia{opcao.prazoDias > 1 ? "s" : ""} úteis
                        </span>
                      </span>
                      <span className="font-mono text-sm font-medium">
                        {opcao.valor === 0 ? "Grátis" : formatarPreco(opcao.valor)}
                      </span>
                    </label>
                  ))}
                </div>
              </Etapa>
            )}
          </div>

          <div className="space-y-4 lg:order-2 lg:self-start lg:sticky lg:top-24">
            <Etapa numero="04" titulo="Resumo do pedido">
              <ul className="space-y-2 text-sm">
                {itens.map((item) => (
                  <li key={item.varianteId} className="flex justify-between gap-2">
                    <span className="text-muted">
                      {item.produtoNome} ({item.cor}) x{item.qtd}
                    </span>
                    <span className="whitespace-nowrap font-mono">
                      {formatarPreco(item.precoUnit * item.qtd)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span className="font-mono">{formatarPreco(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Frete</span>
                  <span className="font-mono">
                    {frete ? (frete.valor === 0 ? "Grátis" : formatarPreco(frete.valor)) : "—"}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="font-mono text-accent">{formatarPreco(total)}</span>
                </div>
              </div>
            </Etapa>

            <Button
              type="button"
              onClick={irParaPagamento}
              disabled={processando}
              size="lg"
              className="w-full"
            >
              {processando ? "Processando..." : "Ir para o pagamento"}
            </Button>

            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" aria-hidden />
              Pagamento seguro via Mercado Pago · Pix ou cartão
            </p>

            {aviso && <p className="text-center text-sm text-accent">{aviso}</p>}
          </div>
        </div>
      </Container>
    </Section>
  );
}
