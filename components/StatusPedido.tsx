"use client";

import { useEffect, useState } from "react";

const MENSAGENS_STATUS: Record<string, string> = {
  aguardando_pagamento: "Estamos aguardando a confirmação do seu pagamento.",
  pago: "Pagamento aprovado! Seu pedido já está sendo preparado.",
  enviado: "Seu pedido foi enviado!",
  entregue: "Seu pedido foi entregue.",
  cancelado: "Este pedido foi cancelado.",
  rejected: "O pagamento não foi aprovado. Tente novamente ou entre em contato.",
};

export default function StatusPedido({
  numero,
  statusInicial,
}: {
  numero: string;
  statusInicial: string;
}) {
  const [status, setStatus] = useState(statusInicial);

  useEffect(() => {
    if (status !== "aguardando_pagamento") return;

    const intervalo = setInterval(() => {
      fetch(`/api/pedido/${numero}/status`)
        .then((resposta) => (resposta.ok ? resposta.json() : null))
        .then((dados) => {
          if (dados?.status && dados.status !== "aguardando_pagamento") {
            setStatus(dados.status);
          }
        })
        .catch(() => {
          // Falha pontual de rede: só tenta de novo no próximo tick.
        });
    }, 5000);

    return () => clearInterval(intervalo);
  }, [status, numero]);

  const mensagem = MENSAGENS_STATUS[status] ?? `Status do pedido: ${status}`;

  return (
    <p className="mt-2 rounded border border-yellow-500/30 bg-yellow-400/10 px-4 py-3 text-yellow-200">
      {mensagem}
    </p>
  );
}
