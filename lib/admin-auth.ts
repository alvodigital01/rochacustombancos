import { cookies } from "next/headers";
import { COOKIE_NAME, DURACAO_COOKIE_SEGUNDOS, criarTokenSessao, tokenValido } from "@/lib/admin-token";

export { verificarSenhaAdmin } from "@/lib/admin-token";

// Uso em Server Components / Route Handlers: lê o cookie da sessão atual.
export async function verificarAdmin(): Promise<boolean> {
  const store = await cookies();
  return tokenValido(store.get(COOKIE_NAME)?.value);
}

// Uso em Server Actions / Route Handlers: grava o cookie httpOnly com o
// token assinado (nunca a senha em si).
export async function criarSessaoAdmin(): Promise<void> {
  const token = await criarTokenSessao();
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACAO_COOKIE_SEGUNDOS,
  });
}

export async function encerrarSessaoAdmin(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
