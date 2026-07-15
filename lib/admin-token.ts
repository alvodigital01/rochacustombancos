// Lógica pura de assinatura/verificação do token de sessão do admin — sem
// depender de next/headers, pra poder rodar tanto no middleware (Edge
// runtime) quanto em Server Actions/Route Handlers (Node). Usa Web Crypto
// (crypto.subtle), disponível nos dois ambientes.

export const COOKIE_NAME = "rc_admin_session";
const DURACAO_SESSAO_SEGUNDOS = 60 * 60 * 24 * 7; // 7 dias

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET não configurado.");
  }
  return secret;
}

function bufferParaBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binario = "";
  for (const byte of bytes) binario += String.fromCharCode(byte);
  return btoa(binario).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function assinar(payload: string, secret: string): Promise<string> {
  const chave = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const assinatura = await crypto.subtle.sign("HMAC", chave, new TextEncoder().encode(payload));
  return bufferParaBase64Url(assinatura);
}

// Comparação em tempo constante — evita vazar, por timing, quantos
// caracteres do início bateram.
function compararConstante(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let resultado = 0;
  for (let i = 0; i < a.length; i++) {
    resultado |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return resultado === 0;
}

export async function criarTokenSessao(): Promise<string> {
  const expiraEm = Math.floor(Date.now() / 1000) + DURACAO_SESSAO_SEGUNDOS;
  const payload = `admin.${expiraEm}`;
  const assinatura = await assinar(payload, getSecret());
  return `${payload}.${assinatura}`;
}

export async function tokenValido(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;

  const partes = token.split(".");
  if (partes.length !== 3) return false;

  const [prefixo, expiraStr, assinaturaRecebida] = partes;
  if (prefixo !== "admin") return false;

  const expiraEm = Number(expiraStr);
  if (!Number.isFinite(expiraEm) || expiraEm < Math.floor(Date.now() / 1000)) return false;

  const payload = `${prefixo}.${expiraStr}`;
  const assinaturaEsperada = await assinar(payload, getSecret());

  return compararConstante(assinaturaEsperada, assinaturaRecebida);
}

// Compara a senha informada com ADMIN_PASSWORD assinando as duas com HMAC
// antes de comparar, pra não vazar nem o tamanho da senha certa por timing.
export async function verificarSenhaAdmin(senhaFornecida: string): Promise<boolean> {
  const senhaEsperada = process.env.ADMIN_PASSWORD;
  if (!senhaEsperada) return false;

  const secret = getSecret();
  const [hashFornecida, hashEsperada] = await Promise.all([
    assinar(senhaFornecida, secret),
    assinar(senhaEsperada, secret),
  ]);

  return compararConstante(hashFornecida, hashEsperada);
}

export const DURACAO_COOKIE_SEGUNDOS = DURACAO_SESSAO_SEGUNDOS;
