"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useCarrinho } from "@/components/CarrinhoContext";
import { formatarPreco, formatarCPF, formatarTelefone } from "@/lib/format";
import { buscarEndereco, type Endereco } from "@/lib/cep";
import { calcularFrete } from "@/lib/frete";

const PESO_FALLBACK_G = 450;

const inputClass =
  "w-full rounded border border-white/20 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-yellow-400 focus:outline-none";

function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-gray-400">{label}</span>
      {children}
    </label>
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
      <main className="min-h-screen bg-black p-8 text-center text-white">
        <h1 className="text-2xl font-bold">Seu carrinho está vazio</h1>
        <p className="mt-2 text-gray-400">Adicione algo antes de ir pro checkout.</p>
        <Link
          href="/motos"
          className="mt-6 inline-block rounded bg-yellow-400 px-6 py-2 font-semibold text-black"
        >
          Ver motos
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-4 pb-24 text-white sm:p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold">Checkout</h1>

        <div className="mt-6 grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <section className="rounded border border-white/10 bg-white/5 p-4">
              <h2 className="mb-4 font-semibold text-yellow-400">Seus dados</h2>
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
            </section>

            <section className="rounded border border-white/10 bg-white/5 p-4">
              <h2 className="mb-4 font-semibold text-yellow-400">Endereço de entrega</h2>
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
                    <p className="mt-1 text-xs text-gray-400">Buscando endereço...</p>
                  )}
                  {cepComErro && (
                    <p className="mt-1 text-xs text-red-400">
                      CEP não encontrado. Confira e tente de novo.
                    </p>
                  )}
                </Campo>

                {endereco && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <Campo label="Logradouro">
                        <input value={endereco.logradouro} readOnly className={`${inputClass} opacity-70`} />
                      </Campo>
                      <Campo label="Bairro">
                        <input value={endereco.bairro} readOnly className={`${inputClass} opacity-70`} />
                      </Campo>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Campo label="Cidade">
                        <input value={endereco.cidade} readOnly className={`${inputClass} opacity-70`} />
                      </Campo>
                      <Campo label="UF">
                        <input value={endereco.uf} readOnly className={`${inputClass} opacity-70`} />
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
            </section>

            {opcoesFrete.length > 0 && (
              <section className="rounded border border-white/10 bg-white/5 p-4">
                <h2 className="mb-4 font-semibold text-yellow-400">Frete</h2>
                <div className="space-y-2">
                  {opcoesFrete.map((opcao) => (
                    <label
                      key={opcao.id}
                      className={`flex cursor-pointer items-center justify-between gap-2 rounded border px-3 py-2 ${
                        freteId === opcao.id ? "border-yellow-400 bg-yellow-400/10" : "border-white/10"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="frete"
                          checked={freteId === opcao.id}
                          onChange={() => setFreteId(opcao.id)}
                        />
                        <span>
                          {opcao.nome} — até {opcao.prazoDias} dia{opcao.prazoDias > 1 ? "s" : ""} úteis
                        </span>
                      </span>
                      <span className="font-medium">
                        {opcao.valor === 0 ? "Grátis" : formatarPreco(opcao.valor)}
                      </span>
                    </label>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-4">
            <section className="rounded border border-white/10 bg-white/5 p-4">
              <h2 className="mb-4 font-semibold text-yellow-400">Resumo do pedido</h2>
              <ul className="space-y-2 text-sm">
                {itens.map((item) => (
                  <li key={item.varianteId} className="flex justify-between gap-2">
                    <span className="text-gray-300">
                      {item.produtoNome} ({item.cor}) x{item.qtd}
                    </span>
                    <span className="whitespace-nowrap">{formatarPreco(item.precoUnit * item.qtd)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 space-y-1 border-t border-white/10 pt-4 text-sm">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>{formatarPreco(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Frete</span>
                  <span>{frete ? (frete.valor === 0 ? "Grátis" : formatarPreco(frete.valor)) : "—"}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-white">
                  <span>Total</span>
                  <span>{formatarPreco(total)}</span>
                </div>
              </div>
            </section>

            <button
              type="button"
              onClick={irParaPagamento}
              disabled={processando}
              className="w-full rounded bg-yellow-400 px-6 py-3 font-semibold text-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {processando ? "Processando..." : "Ir para o pagamento"}
            </button>

            {aviso && <p className="text-center text-sm text-yellow-300">{aviso}</p>}
          </div>
        </div>
      </div>
    </main>
  );
}
