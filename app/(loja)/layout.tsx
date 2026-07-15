import { CarrinhoProvider } from "@/components/CarrinhoContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function LojaLayout({ children }: { children: React.ReactNode }) {
  return (
    <CarrinhoProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
    </CarrinhoProvider>
  );
}
