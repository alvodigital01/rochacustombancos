"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, PackageCheck, Truck, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";

const STATUS_CONFIG: Record<
  string,
  { mensagem: string; Icone: typeof Clock; className: string }
> = {
  aguardando_pagamento: {
    mensagem: "Estamos aguardando a confirmação do seu pagamento.",
    Icone: Clock,
    className: "border-accent/30 bg-accent/10 text-accent",
  },
  pago: {
    mensagem: "Pagamento aprovado! Seu pedido já está sendo preparado.",
    Icone: CheckCircle2,
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  },
  enviado: {
    mensagem: "Seu pedido foi enviado!",
    Icone: Truck,
    className: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  },
  entregue: {
    mensagem: "Seu pedido foi entregue.",
    Icone: PackageCheck,
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  },
  cancelado: {
    mensagem: "Este pedido foi cancelado.",
    Icone: XCircle,
    className: "border-danger/30 bg-danger/10 text-danger",
  },
  rejected: {
    mensagem: "O pagamento não foi aprovado. Tente novamente ou entre em contato.",
    Icone: XCircle,
    className: "border-danger/30 bg-danger/10 text-danger",
  },
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

  const config = STATUS_CONFIG[status] ?? {
    mensagem: `Status do pedido: ${status}`,
    Icone: Clock,
    className: "border-border bg-surface text-muted",
  };
  const Icone = config.Icone;

  return (
    <div className={cn("mt-4 flex items-center gap-3 rounded-2xl border p-4", config.className)}>
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-bg/40">
        <Icone className="h-5 w-5" aria-hidden />
      </div>
      <p className="font-medium">{config.mensagem}</p>
    </div>
  );
}
