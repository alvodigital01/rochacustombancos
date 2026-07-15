import type { Metadata } from "next";
import { Inter, Oswald, Space_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Rocha Custom — Capas de banco sob medida para moto",
  description:
    "Capas de banco custom pra sua moto, começando pela Honda Fan 160. Pronta entrega, você mesmo instala em minutos, envio para todo o Brasil.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${oswald.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-bg font-sans text-foreground">
        {children}
      </body>
    </html>
  );
}
