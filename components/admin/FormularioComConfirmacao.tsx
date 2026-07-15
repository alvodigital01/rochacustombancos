"use client";

import type { ReactNode } from "react";

export default function FormularioComConfirmacao({
  action,
  numero,
  mensagemConfirmacao,
  children,
  className,
}: {
  action: (formData: FormData) => void;
  numero: string;
  mensagemConfirmacao: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={(evento) => {
        if (!confirm(mensagemConfirmacao)) evento.preventDefault();
      }}
    >
      <input type="hidden" name="numero" value={numero} />
      {children}
    </form>
  );
}
