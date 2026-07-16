import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { supabaseServer } from "@/lib/supabase";
import { calcularFrete } from "@/lib/frete";
import { criarPreferencia } from "@/lib/mercadopago";
import { validarCPF, validarEmail, validarTelefone } from "@/lib/validacao";

export const runtime = "nodejs";

const PESO_FALLBACK_G = 450;

type ItemRequisicao = { varianteId: string; qtd: number };

type CorpoRequisicao = {
  itens: ItemRequisicao[];
  cliente: { nome: string; email: string; cpf: string; telefone: string };
  endereco: {
    cep: string;
    logradouro: string;
    bairro: string;
    cidade: string;
    uf: string;
    numero: string;
    complemento?: string;
  };
  freteId: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CorpoRequisicao;

    if (!body.itens || body.itens.length === 0) {
      return NextResponse.json({ erro: "Carrinho vazio." }, { status: 400 });
    }
    if (!body.cliente?.nome?.trim()) {
      return NextResponse.json({ erro: "Informe seu nome completo." }, { status: 400 });
    }
    if (!body.cliente?.email || !validarEmail(body.cliente.email)) {
      return NextResponse.json({ erro: "E-mail inválido." }, { status: 400 });
    }
    if (!body.cliente?.cpf || !validarCPF(body.cliente.cpf)) {
      return NextResponse.json({ erro: "CPF inválido." }, { status: 400 });
    }
    if (!body.cliente?.telefone || !validarTelefone(body.cliente.telefone)) {
      return NextResponse.json({ erro: "Telefone inválido." }, { status: 400 });
    }
    if (!body.endereco?.cep || !body.endereco?.numero) {
      return NextResponse.json({ erro: "Endereço incompleto." }, { status: 400 });
    }
    if (!body.freteId) {
      return NextResponse.json({ erro: "Escolha uma opção de frete." }, { status: 400 });
    }

    const supabase = supabaseServer();

    // Nunca confiamos em preço vindo do front: cada variante é buscada no
    // banco pra pegar preço e estoque reais.
    const itensComPreco: {
      varianteId: string;
      qtd: number;
      precoUnit: number;
      pesoG: number;
      titulo: string;
    }[] = [];

    for (const itemPedido of body.itens) {
      const { data: variante, error } = await supabase
        .from("variantes")
        .select("id, cor, estoque, preco_override, produtos ( nome, preco, peso_g )")
        .eq("id", itemPedido.varianteId)
        .maybeSingle();

      if (error || !variante) {
        return NextResponse.json(
          { erro: `Item não encontrado no catálogo (${itemPedido.varianteId}).` },
          { status: 400 }
        );
      }

      const produto = Array.isArray(variante.produtos) ? variante.produtos[0] : variante.produtos;
      if (!produto) {
        return NextResponse.json(
          { erro: `Produto não encontrado para a variante ${variante.cor}.` },
          { status: 400 }
        );
      }

      if (itemPedido.qtd < 1 || variante.estoque < itemPedido.qtd) {
        return NextResponse.json(
          { erro: `Estoque insuficiente para ${produto.nome} (${variante.cor}).` },
          { status: 400 }
        );
      }

      itensComPreco.push({
        varianteId: variante.id,
        qtd: itemPedido.qtd,
        precoUnit: Number(variante.preco_override ?? produto.preco),
        pesoG: produto.peso_g ?? PESO_FALLBACK_G,
        titulo: `${produto.nome} — ${variante.cor}`,
      });
    }

    const subtotal = itensComPreco.reduce((soma, i) => soma + i.precoUnit * i.qtd, 0);
    const pesoTotalG = itensComPreco.reduce((soma, i) => soma + i.pesoG * i.qtd, 0);

    const opcoesFrete = calcularFrete(body.endereco.cep, pesoTotalG, subtotal);
    const frete = opcoesFrete.find((o) => o.id === body.freteId);

    if (!frete) {
      return NextResponse.json({ erro: "Opção de frete inválida." }, { status: 400 });
    }

    const total = subtotal + frete.valor;
    // Sem sistema de contas, o número do pedido funciona como credencial de
    // acesso ao /pedido/{numero} (quem tem o link, vê o pedido). Por isso
    // precisa ser imprevisível — CSPRNG, não derivado de timestamp.
    const numero = `RC-${randomBytes(8).toString("hex").toUpperCase()}`;

    const { data: pedido, error: erroPedido } = await supabase
      .from("pedidos")
      .insert({
        numero,
        status: "aguardando_pagamento",
        cliente_nome: body.cliente.nome,
        cliente_email: body.cliente.email,
        cliente_cpf: body.cliente.cpf,
        cliente_telefone: body.cliente.telefone,
        cep: body.endereco.cep,
        endereco: body.endereco.logradouro,
        numero_end: body.endereco.numero,
        complemento: body.endereco.complemento ?? null,
        bairro: body.endereco.bairro,
        cidade: body.endereco.cidade,
        uf: body.endereco.uf,
        subtotal,
        frete_valor: frete.valor,
        frete_servico: frete.nome,
        total,
      })
      .select("id, numero")
      .single();

    if (erroPedido || !pedido) {
      console.error("Erro ao criar pedido:", erroPedido);
      return NextResponse.json(
        { erro: "Não foi possível criar o pedido. Tente novamente." },
        { status: 500 }
      );
    }

    const { error: erroItens } = await supabase.from("pedido_itens").insert(
      itensComPreco.map((item) => ({
        pedido_id: pedido.id,
        variante_id: item.varianteId,
        qtd: item.qtd,
        preco_unit: item.precoUnit,
      }))
    );

    if (erroItens) {
      console.error("Erro ao criar itens do pedido:", erroItens);
      return NextResponse.json(
        { erro: "Não foi possível registrar os itens do pedido." },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
    const urlPedido = `${baseUrl}/pedido/${pedido.numero}`;

    const { preferenceId, initPoint } = await criarPreferencia({
      pedido: {
        numero: pedido.numero,
        clienteNome: body.cliente.nome,
        clienteEmail: body.cliente.email,
        freteValor: frete.valor,
      },
      itens: itensComPreco.map((item) => ({
        titulo: item.titulo,
        quantidade: item.qtd,
        precoUnitario: item.precoUnit,
      })),
      backUrls: {
        success: urlPedido,
        pending: urlPedido,
        failure: urlPedido,
      },
      notificationUrl: `${baseUrl}/api/webhooks/mercadopago`,
    });

    if (!initPoint) {
      return NextResponse.json(
        { erro: "Não foi possível iniciar o pagamento. Tente novamente." },
        { status: 500 }
      );
    }

    await supabase.from("pedidos").update({ mp_preference_id: preferenceId }).eq("id", pedido.id);

    return NextResponse.json({ initPoint, numero: pedido.numero });
  } catch (erro) {
    console.error("Erro no checkout:", erro);
    return NextResponse.json(
      { erro: "Erro inesperado ao processar o pedido. Tente novamente." },
      { status: 500 }
    );
  }
}
