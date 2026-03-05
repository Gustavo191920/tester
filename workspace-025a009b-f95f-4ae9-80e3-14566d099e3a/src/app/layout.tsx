import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zenith - Código Protegido",
  description: "Serviço de paste de código com proteção por senha. Compartilhe código de forma segura.",
  keywords: ["paste", "código", "code", "protegido", "senha", "syntax highlighting"],
  authors: [{ name: "Zenith Team" }],
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "Zenith - Código Protegido",
    description: "Serviço de paste de código com proteção por senha",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
