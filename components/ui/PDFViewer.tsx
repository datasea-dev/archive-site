// components/PDFViewer.tsx
"use client";

import { useEffect, useRef } from "react";

interface PDFViewerProps {
  url: string;      // Link PDF yang akan ditampilkan
  fileName: string; // Nama file untuk header PDF
}

export default function PDFViewer({ url, fileName }: PDFViewerProps) {
  const viewerDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Cek apakah script Adobe SDK sudah ada di halaman
    // Tujuannya agar script tidak didownload berkali-kali (efisiensi)
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

    // 2. Fungsi Utama untuk Menampilkan PDF
    function initAdobe() {
      const clientId = process.env.NEXT_PUBLIC_ADOBE_CLIENT_ID;

      // Cek apakah API Key sudah terbaca
      if (!clientId) {
        console.error("❌ Adobe Client ID belum dipasang di .env.local!");
        return;
      }

      // Pastikan div wadah sudah siap dan window.AdobeDC tersedia
      if (window.AdobeDC && viewerDiv.current) {
        
        // Hapus konten lama di dalam div (untuk mencegah tumpukan PDF saat ganti halaman)
        viewerDiv.current.innerHTML = ""; 

        // Inisialisasi Adobe View
        const adobeDCView = new window.AdobeDC.View({
          clientId: clientId,
          divId: "adobe-pdf-container", // Harus sama dengan ID di return div bawah
        });

        // Tampilkan File
        adobeDCView.previewFile(
          {
            content: { location: { url: url } }, // URL file PDF
            metaData: { fileName: fileName },    // Nama file
          },
          {
            embedMode: "SIZED_CONTAINER", // Mode kotak (bukan full screen)
            showAnnotationTools: false,     // Mematikan fitur coret-coret
            showDownloadPDF: true,          // Tombol download
            showPrintPDF: true,             // Tombol print
          }
        );
      }
    }
  }, [url, fileName]); // Efek ini jalan ulang jika URL atau Nama File berubah

  return (
    // Wadah Luar (Styling Tailwind)
    <div className="w-full h-[600px] border border-gray-300 rounded-lg shadow-lg overflow-hidden bg-gray-100">
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