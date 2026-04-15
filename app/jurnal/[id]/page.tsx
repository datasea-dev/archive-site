"use client";

import { useState, useEffect, use } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { ArrowLeft, User, Calendar, BookOpen, Download, Loader2, X, ChevronLeft, FileText, Info } from "lucide-react";
import Link from "next/link";
import PDFViewer from "@/components/ui/PDFViewer";

interface JurnalData {
  id: string;
  judul: string;
  nama: string;
  nim: string;
  abstrak: string;
  kategori?: string;
  tahun?: string;
  fileKey?: string;
  downloadLink?: string;
}

export default function JurnalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [data, setData] = useState<JurnalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPdf, setShowPdf] = useState(false); 

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const docRef = doc(db, "submissions", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setData({ id: docSnap.id, ...docSnap.data() } as JurnalData);
        }
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const getGoogleDriveId = (url: string) => {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-800">Jurnal tidak ditemukan</h1>
        <Link href="/jurnal" className="text-blue-600 mt-4 hover:underline">Kembali ke Arsip</Link>
      </div>
    );
  }

  const directDownloadUrl = data.fileKey 
    ? `/api/view?key=${encodeURIComponent(data.fileKey)}` 
    : data.downloadLink || "#";

  return (
    <>
      {/* --- MODE 1: PDF VIEWER FULL SCREEN --- */}
      {showPdf && (
        <div className="fixed inset-0 z-[99999] flex flex-col bg-gray-100 animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-3 md:px-4 py-3 bg-white border-b shadow-sm shrink-0 z-10">
             <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                <button onClick={() => setShowPdf(false)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors shrink-0">
                   <ChevronLeft size={24} className="md:w-7 md:h-7" />
                </button>
                <h3 className="font-semibold text-gray-800 truncate text-sm md:text-lg flex-1 min-w-0">{data.judul}</h3>
             </div>
             <button onClick={() => setShowPdf(false)} className="p-2 ml-2 hover:bg-red-50 hover:text-red-600 rounded-full text-gray-500 transition-colors shrink-0">
                <X size={20} className="md:w-6 md:h-6" />
             </button>
          </div>
          <div className="flex-1 w-full h-full overflow-hidden relative">
             <PDFViewer 
               type={data.fileKey ? "jurnal" : "materi"} 
               fileIdOrKey={data.fileKey || getGoogleDriveId(data.downloadLink || "") || ""} 
               fileName={data.judul} 
             />
          </div>
        </div>
      )}

      {/* --- MODE 2: HALAMAN DETAIL JURNAL --- */}
      <div className="min-h-screen bg-gray-50 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          <Link href="/jurnal" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 mb-6 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
            <ArrowLeft size={16} className="mr-2" /> Kembali ke Daftar Jurnal
          </Link>

          {/* Bagian Atas: Header Jurnal */}
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-200 mb-8 relative overflow-hidden">
            {/* Aksen background agar tidak terlalu polos */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none"></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 tracking-wide uppercase">
                    {data.kategori || "Skripsi"}
                  </span>
                  <span className="text-gray-500 text-sm flex items-center gap-1.5 font-medium">
                    <Calendar size={16} /> Dipublikasikan {data.tahun || new Date().getFullYear()}
                  </span>
                </div>
                
                <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-8 max-w-4xl">
                  {data.judul}
                </h1>

                <div className="flex items-center gap-4 text-gray-600">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                      <User size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{data.nama}</p>
                    <p className="text-sm text-gray-500">NIM: {data.nim} • Universitas Teknologi Yogyakarta</p>
                  </div>
                </div>
            </div>
          </div>

          {/* Bagian Bawah: Grid 2 Kolom (Kiri Abstrak, Kanan Meta Info) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* KOLOM KIRI: Konten Abstrak */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-4">
                  <FileText className="text-blue-600" size={24} /> Abstrak Penelitian
                </h2>
                
                {/* 🔴 PERBAIKAN ABSTRAK: Menggunakan text-justify dan whitespace-pre-line agar rapat dan rata kiri-kanan */}
                <p className="text-gray-700 leading-loose text-justify whitespace-pre-line">
                  {data.abstrak}
                </p>
              </div>
            </div>

            {/* KOLOM KANAN: Sidebar Meta Info & Aksi */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Card Tombol Aksi */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 flex flex-col gap-3">
                <button 
                  onClick={() => setShowPdf(true)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-95"
                >
                  <BookOpen size={20} /> Baca Full Jurnal
                </button>
                <a 
                  href={directDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gray-50 border-2 border-gray-200 text-gray-700 rounded-xl hover:border-gray-300 hover:bg-gray-100 font-bold transition-all active:scale-95"
                >
                  <Download size={20} /> Download PDF
                </a>
              </div>

              {/* Card Informasi Dokumen */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Info size={18} className="text-gray-400" /> Detail Informasi
                </h3>
                
                <ul className="space-y-4 text-sm">
                  <li className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-gray-500">Format File</span>
                    <span className="font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded">PDF Document</span>
                  </li>
                  <li className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-gray-500">Kategori</span>
                    <span className="font-medium text-gray-800">{data.kategori || "Skripsi"}</span>
                  </li>
                  <li className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-gray-500">Tahun Terbit</span>
                    <span className="font-medium text-gray-800">{data.tahun || new Date().getFullYear()}</span>
                  </li>
                  <li className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-gray-500">Server Arsip</span>
                    <span className="font-medium text-gray-800">{data.fileKey ? "Datasea Cloud (R2)" : "Google Drive"}</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-gray-500">Hak Akses</span>
                    <span className="font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Open Access</span>
                  </li>
                </ul>
              </div>

            </div>

          </div>
        </div>
      </div>
    </>
  );
}