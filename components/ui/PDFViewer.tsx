// components/PDFViewer.tsx
"use client";

import { useEffect, useRef } from "react";

// 1. UPDATE PROPS: Ganti 'url' dengan 'fileIdOrKey' dan 'type'
interface PDFViewerProps {
  fileIdOrKey: string;       // Bisa berisi ID Drive ATAU Key Cloudflare R2
  type: "materi" | "jurnal"; // Penanda sumber file
  fileName: string;          // Nama file untuk header PDF
}

export default function PDFViewer({ fileIdOrKey, type, fileName }: PDFViewerProps) {
  const viewerDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Cek apakah script Adobe SDK sudah ada di halaman
    if (!window.AdobeDC) {
      const script = document.createElement("script");
      script.src = "https://documentcloud.adobe.com/view-sdk/viewer.js";
      script.id = "adobe-dc-view-sdk";
      script.async = true;
      script.onload = () => initAdobe(); // Jalankan inisialisasi setelah script selesai load
      document.body.appendChild(script);
    } else {
      initAdobe(); // Jika script sudah ada, langsung jalankan
    }

    // Fungsi Utama untuk Menampilkan PDF
    function initAdobe() {
      const clientId = process.env.NEXT_PUBLIC_ADOBE_CLIENT_ID;

      // Cek apakah API Key sudah terbaca
      if (!clientId) {
        console.error("❌ Adobe Client ID belum dipasang di .env.local!");
        return;
      }

      // Pastikan div wadah sudah siap dan window.AdobeDC tersedia
      if (window.AdobeDC && viewerDiv.current) {
        
        // Hapus konten lama di dalam div 
        viewerDiv.current.innerHTML = ""; 

        // Inisialisasi Adobe View
        const adobeDCView = new window.AdobeDC.View({
          clientId: clientId,
          divId: "adobe-pdf-container", 
        });

        // 2. LOGIKA PEMILIHAN URL BERDASARKAN TIPE (DENGAN FIX ANTI-SPASI)
        const pdfUrl = type === "materi" 
          ? `/api/pdf?id=${fileIdOrKey}`                           // Google Drive
          : `/api/view?key=${encodeURIComponent(fileIdOrKey)}`;    // Cloudflare R2 (Fix: encodeURIComponent)

        // Tampilkan File
        adobeDCView.previewFile(
          {
            content: { location: { url: pdfUrl } }, // 👈 Gunakan URL dinamis
            metaData: { fileName: fileName },
          },
          {
            embedMode: "SIZED_CONTAINER", 
            showAnnotationTools: false,    
            showDownloadPDF: true,         
            showPrintPDF: true,            
          }
        );
      }
    }
  }, [fileIdOrKey, type, fileName]); 

  return (
    // Wadah Luar (Styling Tailwind) - Ganti h-[600px] menjadi h-full, hapus border/shadow agar menyatu dengan layar
    <div className="w-full h-full overflow-hidden bg-gray-100">
      {/* Wadah Dalam (Target Adobe) */}
      <div id="adobe-pdf-container" ref={viewerDiv} className="w-full h-full" />
    </div>
  );
}

// Deklarasi global agar TypeScript tidak error saat akses window.AdobeDC
declare global {
  interface Window {
    AdobeDC: any;
  }
}