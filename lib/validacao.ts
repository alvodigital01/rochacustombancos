// Confere os dígitos verificadores do CPF (algoritmo oficial) e rejeita
// sequências repetidas (ex: 11111111111), que passam na conta dos dígitos
// verificadores mas nunca são CPFs reais.
export function validarCPF(cpfBruto: string): boolean {
  const cpf = cpfBruto.replace(/\D/g, "");

  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const calcularDigitoVerificador = (tamanhoBase: number) => {
    let soma = 0;
    for (let i = 0; i < tamanhoBase; i++) {
      soma += Number(cpf[i]) * (tamanhoBase + 1 - i);
    }
    const resto = 11 - (soma % 11);
    return resto >= 10 ? 0 : resto;
  };

  if (calcularDigitoVerificador(9) !== Number(cpf[9])) return false;
  if (calcularDigitoVerificador(10) !== Number(cpf[10])) return false;

  return true;
}

// Regex simples e permissiva o suficiente pra pegar e-mails malformados
// óbvios, sem tentar validar cada regra do RFC 5322.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

// Telefones brasileiros (fixo ou celular, com DDD) têm 10 ou 11 dígitos.
export function validarTelefone(telefone: string): boolean {
  const digitos = telefone.replace(/\D/g, "");
  return digitos.length === 10 || digitos.length === 11;
}
