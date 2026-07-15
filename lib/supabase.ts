import { createClient } from "@supabase/supabase-js";

// Cliente para uso no browser (catálogo, carrinho, etc). Usa a chave anon,
// que respeita as políticas de RLS do banco.
export function supabaseBrowser() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Cliente para uso EXCLUSIVO em código de servidor (pedidos, webhooks,
// rotas de admin). Usa a service role key, que ignora RLS e tem acesso
// total ao banco. A service role NUNCA pode ser exposta ao client
// (nunca importe este arquivo em um Client Component).
export function supabaseServer() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
