import { login } from "./actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-4 text-white">
      <div className="w-full max-w-sm rounded border border-white/10 bg-white/5 p-6">
        <h1 className="text-xl font-bold text-yellow-400">Admin — Rocha Custom</h1>

        <form action={login} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs text-gray-400">Senha</span>
            <input
              type="password"
              name="senha"
              autoFocus
              required
              className="w-full rounded border border-white/20 bg-black/40 px-3 py-2 text-sm text-white focus:border-yellow-400 focus:outline-none"
            />
          </label>

          {erro && <p className="text-sm text-red-400">Senha incorreta.</p>}

          <button
            type="submit"
            className="w-full rounded bg-yellow-400 px-4 py-2 font-semibold text-black"
          >
            Entrar
          </button>
        </form>
      </div>
    </main>
  );
}
