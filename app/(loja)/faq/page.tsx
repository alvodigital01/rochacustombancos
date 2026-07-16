import type { Metadata } from "next";
import Badge from "@/components/ui/Badge";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Perguntas frequentes — Rocha Custom",
  description: "Tire suas dúvidas sobre prazo, instalação, pagamento e trocas.",
};

// TODO: revisar as respostas com o time antes de publicar em produção.
const PERGUNTAS = [
  {
    pergunta: "A capa serve pra qualquer moto?",
    resposta:
      "Trabalhamos com capas sob medida por modelo, começando pela Honda Fan 160. Novos modelos chegam em breve — fica de olho nas nossas redes.",
  },
  {
    pergunta: "Quanto tempo leva pra instalar?",
    resposta:
      "Na maioria dos casos, menos de 10 minutos, sem ferramenta especial e sem precisar de oficina. Veja o passo a passo completo em Como instalar.",
  },
  {
    pergunta: "Qual o prazo de entrega?",
    resposta:
      "Trabalhamos com pronta entrega — o pedido sai do nosso estoque assim que o pagamento é confirmado. O prazo de envio varia por região e é calculado no checkout.",
  },
  {
    pergunta: "Quais formas de pagamento vocês aceitam?",
    resposta: "Pix e cartão, processados com segurança pelo Mercado Pago.",
  },
  {
    pergunta: "Posso trocar se não gostar da cor?",
    resposta:
      "Sim! Você tem até 7 dias corridos após o recebimento pra solicitar troca. Veja os detalhes na página de Trocas.",
  },
];

export default function FaqPage() {
  return (
    <Section className="pb-16 pt-10 sm:pb-20 sm:pt-14">
      <Container className="max-w-2xl">
        <Badge variant="accent">Ajuda</Badge>
        <h1 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
          Perguntas frequentes
        </h1>
        <p className="mt-3 text-muted">
          Não achou o que precisava? Fala com a gente pelo WhatsApp na página
          de Contato.
        </p>

        <div className="mt-10 space-y-4">
          {PERGUNTAS.map((item) => (
            <div key={item.pergunta} className="rounded-2xl border border-border bg-surface p-5">
              <p className="font-display text-sm font-semibold uppercase tracking-wide">
                {item.pergunta}
              </p>
              <p className="mt-2 text-sm text-muted">{item.resposta}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
