export type OpcaoFrete = {
  id: string;
  nome: string;
  prazoDias: number;
  valor: number;
};

type Regiao = "sudeste" | "sul" | "nordeste" | "norte" | "centro_oeste";

// Valores e prazos placeholder por região — fáceis de editar enquanto não
// integramos um cálculo real.
const TABELA_FRETE: Record<
  Regiao,
  { economico: number; expresso: number; prazoEconomico: number; prazoExpresso: number }
> = {
  sudeste: { economico: 19.9, expresso: 34.9, prazoEconomico: 5, prazoExpresso: 2 },
  sul: { economico: 24.9, expresso: 39.9, prazoEconomico: 6, prazoExpresso: 3 },
  centro_oeste: { economico: 29.9, expresso: 49.9, prazoEconomico: 8, prazoExpresso: 4 },
  nordeste: { economico: 34.9, expresso: 54.9, prazoEconomico: 9, prazoExpresso: 4 },
  norte: { economico: 44.9, expresso: 69.9, prazoEconomico: 12, prazoExpresso: 6 },
};

// Subtotal a partir do qual o frete fica grátis. 0 = desativado.
const SUBTOTAL_FRETE_GRATIS = 0;

function regiaoPorCep(cepDestino: string): Regiao {
  const primeiroDigito = cepDestino.replace(/\D/g, "").charAt(0);

  switch (primeiroDigito) {
    case "0":
    case "1":
    case "2":
    case "3":
      return "sudeste"; // SP, RJ, ES, MG
    case "4":
    case "5":
      return "nordeste"; // BA, SE, PE, AL, PB, RN
    case "6":
      return "norte"; // CE, PI, MA + região norte
    case "7":
      return "centro_oeste"; // DF, GO, TO, MT, MS
    case "8":
    case "9":
      return "sul"; // PR, SC, RS
    default:
      return "sudeste";
  }
}

// TODO: substituir por integração real com Melhor Envio (OAuth2) numa próxima etapa.
// A assinatura desta função não deve mudar quando isso acontecer.
export function calcularFrete(
  cepDestino: string,
  pesoTotalG: number,
  subtotal: number
): OpcaoFrete[] {
  if (SUBTOTAL_FRETE_GRATIS > 0 && subtotal >= SUBTOTAL_FRETE_GRATIS) {
    return [{ id: "gratis", nome: "Frete grátis", prazoDias: 7, valor: 0 }];
  }

  const tabela = TABELA_FRETE[regiaoPorCep(cepDestino)];

  // Adicional placeholder pra dar alguma sensibilidade ao peso, sem base
  // tarifária real por trás.
  const kgExtra = Math.max(0, pesoTotalG - 1000) / 1000;
  const adicional = kgExtra * 4;

  return [
    {
      id: "economico",
      nome: "Econômico",
      prazoDias: tabela.prazoEconomico,
      valor: Number((tabela.economico + adicional).toFixed(2)),
    },
    {
      id: "expresso",
      nome: "Expresso",
      prazoDias: tabela.prazoExpresso,
      valor: Number((tabela.expresso + adicional).toFixed(2)),
    },
  ];
}
