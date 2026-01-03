import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; 
import Footer from "@/components/Footer"; 

const inter = Inter({ subsets: ["latin"] });

// --- SETTING SEO & METADATA ---
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://archive.datasea.id'),
  title: {
    default: "DATASEA Archive | Pusat Materi Sains Data UTY",
    template: "%s | DATASEA Archive"
  },
  description: "Platform arsip digital terintegrasi untuk mahasiswa Sains Data UTY. Akses bank soal, modul praktikum, dan materi kuliah lintas angkatan dengan mudah.",
  keywords: ["DATASEA", "Sains Data UTY", "Bank Soal UTY", "Materi Kuliah", "Arsip Digital", "Universitas Teknologi Yogyakarta", "Gudang Soal"],
  authors: [{ name: "Divisi IT DATASEA" }],
  creator: "DATASEA UTY",
  publisher: "DATASEA UTY",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "DATASEA Archive | Pusat Materi Sains Data UTY",
    description: "Akses ribuan materi kuliah dan bank soal Sains Data UTY dalam satu pintu.",
    url: 'https://archive.datasea.id',
    siteName: 'DATASEA Archive',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'DATASEA Archive Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "DATASEA Archive",
    description: "Pusat Materi & Bank Soal Sains Data UTY.",
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // SCHEMA JSON-LD: Konfigurasi Sosial Media Resmi
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "DATASEA Archive",
    "url": "https://archive.datasea.id",
    "sameAs": [
      "https://www.instagram.com/dataseauty",  
      "https://www.linkedin.com/company/datasea-uty", 
      "https://www.tiktok.com/@dataseauty" 
    ]
  };

  return (
    <html lang="id">
      <body className={inter.className}>
        {/* Script Structured Data untuk SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        <Navbar />

        {/* Konten Utama */}
        <main className="min-h-screen">
           {children}
        </main>
        
        <Footer />
      </body>
    </html>
  );
}