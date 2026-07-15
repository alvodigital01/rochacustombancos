-- Rocha Custom Bancos — migration para o webhook do Mercado Pago
-- Cole no SQL Editor do Supabase e rode.

-- Decrementa o estoque de uma variante de forma atômica (uma única
-- instrução UPDATE), evitando race condition se dois webhooks tentarem
-- decrementar a mesma variante ao mesmo tempo. Nunca deixa o estoque
-- negativo.
create or replace function decrementar_estoque(p_variante_id uuid, p_qtd int)
returns void
language sql
as $$
  update variantes
  set estoque = greatest(estoque - p_qtd, 0)
  where id = p_variante_id;
$$;
