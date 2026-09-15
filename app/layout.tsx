import type { Metadata } from "next";
import "./globals.css";
import "./login.css";
import AuthBridge from "./auth-bridge";

export const metadata: Metadata = {
  title: "Matos Advocacia | Portal Administrativo",
  description: "Gestão de clientes, processos, documentos e contratos da Matos Advocacia.",
  robots: { index: false, follow: false },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased"><AuthBridge/>{children}</body>
    </html>
  );
}
