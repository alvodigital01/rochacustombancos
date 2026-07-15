-- Rocha Custom Bancos — schema do catálogo (motos, produtos, variantes, imagens)
-- Cole este arquivo inteiro no SQL Editor do Supabase e rode.

create extension if not exists pgcrypto;

-- ============ TABELAS ============

create table if not exists motos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  marca text,
  ordem int not null default 0,
  ativo boolean not null default true
);

create table if not exists produtos (
  id uuid primary key default gen_random_uuid(),
  moto_id uuid not null references motos(id) on delete cascade,
  nome text not null,
  slug text not null unique,
  descricao text,
  preco numeric(10,2) not null,
  tipo text,
  peso_g int,
  altura_cm numeric(6,2),
  largura_cm numeric(6,2),
  comprimento_cm numeric(6,2),
  ativo boolean not null default true
);

create table if not exists variantes (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references produtos(id) on delete cascade,
  cor text not null,
  sku text not null unique,
  estoque int not null default 0,
  preco_override numeric(10,2),
  imagem_url text
);

create table if not exists imagens_produto (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references produtos(id) on delete cascade,
  url text not null,
  ordem int not null default 0
);

create index if not exists produtos_moto_id_idx on produtos(moto_id);
create index if not exists variantes_produto_id_idx on variantes(produto_id);
create index if not exists imagens_produto_produto_id_idx on imagens_produto(produto_id);

-- ============ RLS: leitura pública, escrita só via service role ============

alter table motos enable row level security;
alter table produtos enable row level security;
alter table variantes enable row level security;
alter table imagens_produto enable row level security;

create policy "motos: leitura publica" on motos
  for select using (true);

create policy "produtos: leitura publica" on produtos
  for select using (true);

create policy "variantes: leitura publica" on variantes
  for select using (true);

create policy "imagens_produto: leitura publica" on imagens_produto
  for select using (true);

-- Nenhuma policy de insert/update/delete é criada aqui: com RLS ligado e
-- sem policy, só a service role (que ignora RLS) consegue escrever. É o que
-- as rotas de admin vão usar.

-- ============ DADOS DE EXEMPLO (Honda Fan 160) ============

with moto as (
  insert into motos (nome, slug, marca, ordem, ativo)
  values ('Honda Fan 160', 'honda-fan-160', 'Honda', 1, true)
  returning id
),
produto as (
  insert into produtos (moto_id, nome, slug, descricao, preco, tipo, peso_g, altura_cm, largura_cm, comprimento_cm, ativo)
  select id, 'Capa Comfort Honda Fan 160', 'capa-comfort-honda-fan-160',
         'Capa de banco sob medida para Honda Fan 160, com espuma de conforto e acabamento em costura dupla.',
         189.90, 'capa', 450, 8, 32, 68, true
  from moto
  returning id
)
insert into variantes (produto_id, cor, sku, estoque, preco_override, imagem_url)
select id, cor, sku, estoque, preco_override, null
from produto,
  (values
    ('Preta', 'CAPA-FAN160-PRETA', 15, null::numeric),
    ('Preta e Vermelha', 'CAPA-FAN160-PRETA-VM', 8, null::numeric),
    ('Preta e Amarela', 'CAPA-FAN160-PRETA-AM', 0, null::numeric)
  ) as v(cor, sku, estoque, preco_override);
