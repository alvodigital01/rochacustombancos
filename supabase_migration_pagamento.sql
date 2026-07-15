-- Rocha Custom Bancos — migration para o fluxo de pagamento (Mercado Pago)
-- Cole no SQL Editor do Supabase e rode. Assume que as tabelas `pedidos` e
-- `pedido_itens` já existem (criadas manualmente).

alter table pedidos add column if not exists mp_preference_id text;
