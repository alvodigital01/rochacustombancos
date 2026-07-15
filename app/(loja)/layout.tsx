import { CarrinhoProvider } from "@/components/CarrinhoContext";
import Header from "@/components/Header";

export default function LojaLayout({ children }: { children: React.ReactNode }) {
  return (
    <CarrinhoProvider>
      <Header />
      {children}
    </CarrinhoProvider>
  );
}
