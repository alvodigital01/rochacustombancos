-- Rocha Custom Bancos — migration pras correções de pagamento recusado e
-- devolução de estoque ao cancelar.
-- Cole no SQL Editor do Supabase e rode. Pode rodar mais de uma vez sem
-- problema (idempotente).

-- 1) Permite 'pagamento_recusado' no CHECK da coluna status. Descobre o
--    nome do constraint atual (qualquer que seja) e substitui, em vez de
--    supor um nome fixo.
do $$
declare
  nome_constraint text;
begin
  select con.conname into nome_constraint
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  join pg_attribute att on att.attrelid = rel.oid and att.attnum = any(con.conkey)
  where rel.relname = 'pedidos'
    and att.attname = 'status'
    and con.contype = 'c';

  if nome_constraint is not null then
    execute format('alter table pedidos drop constraint %I', nome_constraint);
  end if;
end $$;

alter table pedidos add constraint pedidos_status_check
  check (status in (
    'aguardando_pagamento',
    'pago',
    'pagamento_recusado',
    'enviado',
    'entregue',
    'cancelado'
  ));

-- 2) Função pra devolver estoque ao cancelar um pedido que já tinha sido
--    pago. Usa os mesmos nomes de parâmetro (variante_id, qtd — sem
--    prefixo "p_") da função decrementar_estoque que já está publicada no
--    banco hoje, por consistência.
create or replace function incrementar_estoque(variante_id uuid, qtd int)
returns void
language sql
as $$
  update variantes
  set estoque = estoque + qtd
  where id = variante_id;
$$;
