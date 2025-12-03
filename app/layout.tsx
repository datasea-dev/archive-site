import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ui/ScrollToTop";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DATASEA Archive",
  description: "Pusat Arsip Materi dan Jurnal Komunitas Sains Data UTY",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      {/* PERHATIKAN DISINI: Class bg-datasea-surface kita taruh langsung di className */}
      <body className={`${inter.className} bg-datasea-surface text-gray-900 antialiased min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-grow pt-24 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          {children}
        </main>
        <Footer />
        {/* 2. Pasang Komponen disini (Paling bawah agar floating di atas segalanya) */}
        <ScrollToTop />
      </body>
    </html>
  );
}