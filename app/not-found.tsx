import Link from "next/link";
import { FileQuestion, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[80vh] text-center p-4 overflow-hidden animate-in fade-in zoom-in duration-500">
      
      {/* 0. BACKGROUND GRID (Sama seperti Beranda) */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_3rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_50%_200px,#d5c5ff00,transparent)]"></div>
      </div>

      {/* 1. IKON BESAR (Animasi) */}
      <div className="relative mb-6 group">
        {/* Efek Glow di belakang */}
        <div className="absolute -inset-4 bg-red-100 rounded-full opacity-50 blur-xl group-hover:opacity-70 transition-opacity"></div>
        
        <div className="relative bg-white p-6 rounded-3xl shadow-xl border border-red-100 group-hover:scale-110 transition-transform duration-300">
          <FileQuestion className="w-20 h-20 text-red-500" strokeWidth={1.5} />
        </div>
      </div>

      {/* 2. TEKS UTAMA */}
      <div className="space-y-3 max-w-md mx-auto">
        <h1 className="text-6xl font-extrabold text-datasea-main tracking-tight">
          404
        </h1>
        <h2 className="text-2xl font-bold text-gray-800">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-gray-500 leading-relaxed">
          Maaf, halaman atau file yang kamu cari mungkin sudah dihapus, dipindahkan, atau link-nya belum tersedia.
        </p>
      </div>

      {/* 3. TOMBOL AKSI */}
      <div className="flex flex-col sm:flex-row gap-3 mt-10">
        <Link 
          href="/" 
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-datasea-main hover:bg-[#1a243d] text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-900/20 active:scale-95"
        >
          <Home size={18} />
          Kembali ke Beranda
        </Link>
        
        {/* Tombol Back Browser */}
        {/* Catatan: Di Next.js kita pakai tag 'a' atau button biasa untuk 'window.history.back()' */}
        <Link
            href="/materi"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-all active:scale-95"
        >
            <ArrowLeft size={18} />
            Cari di Materi
        </Link>
      </div>

    </div>
  );
}