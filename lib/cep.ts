export type Endereco = {
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
};

export type ResultadoBuscaCep =
  | { encontrado: true; endereco: Endereco }
  | { encontrado: false; motivo: "nao_encontrado" | "indisponivel" };

const TIMEOUT_MS = 5000;

export async function buscarEndereco(cep: string): Promise<ResultadoBuscaCep> {
  const cepLimpo = cep.replace(/\D/g, "");
  if (cepLimpo.length !== 8) {
    return { encontrado: false, motivo: "nao_encontrado" };
  }

  const controlador = new AbortController();
  const timeoutId = setTimeout(() => controlador.abort(), TIMEOUT_MS);

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`, {
      signal: controlador.signal,
    });

    if (!resposta.ok) {
      return { encontrado: false, motivo: "indisponivel" };
    }

    const dados = await resposta.json();
    if (dados.erro) {
      return { encontrado: false, motivo: "nao_encontrado" };
    }

    return {
      encontrado: true,
      endereco: {
        logradouro: dados.logradouro ?? "",
        bairro: dados.bairro ?? "",
        cidade: dados.localidade ?? "",
        uf: dados.uf ?? "",
      },
    };
  } catch {
    // Rede fora, timeout (abort) ou resposta inválida — tudo isso é "não
    // conseguimos consultar agora", diferente de "esse CEP não existe".
    return { encontrado: false, motivo: "indisponivel" };
  } finally {
    clearTimeout(timeoutId);
  }
}
