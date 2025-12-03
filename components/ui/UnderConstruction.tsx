import Link from "next/link";
import { Construction, ArrowLeft, HardHat } from "lucide-react";

interface Props {
  pageName: string;
}

export default function UnderConstruction({ pageName }: Props) {
  return (
    // PERBAIKAN: 
    // 1. min-h-[60vh]: Saya kurangi sedikit agar vertikal centering lebih naik (tidak terlalu bawah).
    // 2. pb-20 md:pb-32: Memberikan bantalan empuk di bawah agar tidak nabrak footer.
    <div className="relative flex flex-col items-center justify-center min-h-[60vh] text-center p-4 pb-20 md:pb-20 overflow-hidden animate-in fade-in zoom-in duration-500">
      
      {/* Background Grid */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_3rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_50%_200px,#d5c5ff00,transparent)]"></div>
      </div>

      {/* Icon Animasi */}
      <div className="relative mb-8">
        <div className="absolute -inset-4 bg-blue-100 rounded-full opacity-50 blur-xl animate-pulse"></div>
        <div className="relative bg-white p-6 rounded-3xl shadow-xl border border-blue-50">
          <Construction className="w-16 h-16 text-datasea-main animate-bounce" strokeWidth={1.5} />
        </div>
        <div className="absolute -right-2 -bottom-2 bg-yellow-400 p-2 rounded-full text-white shadow-lg rotate-12">
            <HardHat size={20} />
        </div>
      </div>

      {/* Teks Utama */}
      <div className="space-y-4 max-w-lg mx-auto">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-600 mb-2">
          🚀 Segera Hadir
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-datasea-main">
          Halaman {pageName} <br />
          <span className="text-gray-400">Sedang Dibangun</span>
        </h1>
        
        <p className="text-gray-500 leading-relaxed">
          Tim IT DATASEA sedang bekerja keras menyiapkan konten terbaik untuk halaman ini. 
          Silakan cek kembali secara berkala.
        </p>
      </div>

      {/* Tombol Kembali */}
      <div className="mt-12">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-datasea-main hover:bg-[#1a243d] text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-900/20 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}