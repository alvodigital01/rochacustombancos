import { MercadoPagoConfig, Preference } from "mercadopago";

export const mercadoPagoClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

type ItemParaPreferencia = {
  titulo: string;
  quantidade: number;
  precoUnitario: number;
};

type CriarPreferenciaParams = {
  pedido: {
    numero: string;
    clienteNome: string;
    clienteEmail: string;
    freteValor: number;
  };
  itens: ItemParaPreferencia[];
  backUrls: {
    success: string;
    pending: string;
    failure: string;
  };
  notificationUrl: string;
};

export async function criarPreferencia({
  pedido,
  itens,
  backUrls,
  notificationUrl,
}: CriarPreferenciaParams) {
  const items = itens.map((item, indice) => ({
    id: `item-${indice}`,
    title: item.titulo,
    quantity: item.quantidade,
    unit_price: item.precoUnitario,
    currency_id: "BRL",
  }));

  if (pedido.freteValor > 0) {
    items.push({
      id: "frete",
      title: "Frete",
      quantity: 1,
      unit_price: pedido.freteValor,
      currency_id: "BRL",
    });
  }

  const preferencia = await new Preference(mercadoPagoClient).create({
    body: {
      items,
      payer: {
        name: pedido.clienteNome,
        email: pedido.clienteEmail,
      },
      external_reference: pedido.numero,
      back_urls: backUrls,
      auto_return: "approved",
      notification_url: notificationUrl,
    },
  });

  return {
    preferenceId: preferencia.id ?? null,
    initPoint: preferencia.init_point ?? preferencia.sandbox_init_point ?? null,
  };
}
