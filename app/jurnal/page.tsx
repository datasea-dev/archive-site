"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { Search, FileText, User, Calendar, BookOpen, ChevronLeft, X, Loader2 } from "lucide-react";
import Link from "next/link";
// Import PDF Viewer
import PDFViewer from "@/components/ui/PDFViewer";

// Tipe data
interface Jurnal {
  id: string;
  judul: string;
  nama: string;
  abstrak: string;
  kategori?: string;
  tahun?: string;
  downloadLink?: string; // Link Google Drive
  publishedAt?: string;
}

export default function JurnalPage() {
  const [jurnals, setJurnals] = useState<Jurnal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // STATE PDF VIEWER
  const [selectedPdf, setSelectedPdf] = useState<{ url: string; title: string } | null>(null);

  // 1. FETCH DATA DARI FIREBASE
  useEffect(() => {
    const fetchJurnals = async () => {
      try {
        const q = query(
          collection(db, "submissions"),
          where("status", "==", "PUBLISHED"), 
          orderBy("publishedAt", "desc") 
        );

        const querySnapshot = await getDocs(q);
        
        const data: Jurnal[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Jurnal));

        setJurnals(data);
      } catch (error) {
        console.error("Gagal mengambil data jurnal:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJurnals();
  }, []);

  // 2. HELPER: EKSTRAK FILE ID DARI LINK GOOGLE DRIVE
  // Link biasanya: https://drive.google.com/file/d/FILE_ID_DISINI/view?usp=sharing
  const getGoogleDriveId = (url: string) => {
    const regex = /\/d\/([a-zA-Z0-9_-]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // 3. HANDLER KLIK FILE
  const handleOpenPdf = (jurnal: Jurnal) => {
    if (!jurnal.downloadLink) return;

    const fileId = getGoogleDriveId(jurnal.downloadLink);

    if (fileId) {
      // Jika berhasil dapat ID, buka lewat Proxy Viewer
      const proxyUrl = `/api/pdf?id=${fileId}`;
      setSelectedPdf({ url: proxyUrl, title: jurnal.judul });
    } else {
      // Jika bukan link drive standar, buka di tab baru biasa
      window.open(jurnal.downloadLink, "_blank");
    }
  };

  // 4. LOGIKA PENCARIAN
  const filteredJurnals = jurnals.filter((jurnal) =>
    jurnal.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jurnal.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* --- MODE 1: PDF VIEWER FULL SCREEN --- */}
      {selectedPdf && (
        <div className="fixed inset-0 z-[99999] flex flex-col bg-gray-100 animate-in fade-in duration-200">
            
            {/* Header Viewer */}
            <div className="flex items-center justify-between px-3 md:px-4 py-3 bg-white border-b shadow-sm shrink-0 z-10">
               <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                  {/* Tombol Back */}
                  <button 
                    onClick={() => setSelectedPdf(null)} 
                    className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors shrink-0"
                    title="Kembali"
                  >
                     <ChevronLeft size={24} className="md:w-7 md:h-7" />
                  </button>
                  
                  {/* Judul File */}
                  <h3 className="font-semibold text-gray-800 truncate text-sm md:text-lg flex-1 min-w-0">
                    {selectedPdf.title}
                  </h3>
               </div>

               {/* Tombol Close */}
               <button 
                 onClick={() => setSelectedPdf(null)} 
                 className="p-2 ml-2 hover:bg-red-50 hover:text-red-600 rounded-full text-gray-500 transition-colors shrink-0"
               >
                  <X size={20} className="md:w-6 md:h-6" />
               </button>
            </div>

            {/* Area PDF */}
            <div className="flex-1 w-full h-full overflow-hidden relative">
               <PDFViewer url={selectedPdf.url} fileName={selectedPdf.title} />
            </div>
        </div>
      )}

      {/* --- MODE 2: MAIN CONTENT --- */}
      {!selectedPdf && (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          
          {/* Header Section */}
          <div className="max-w-7xl mx-auto mb-12 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Arsip Jurnal & Riset
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Kumpulan publikasi ilmiah, skripsi, dan laporan riset dari komunitas DATASEA. 
              Sumber referensi terpercaya untuk pengembangan ilmu data.
            </p>

            {/* Tombol Upload & Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center max-w-5xl mx-auto">
              
              {/* Search Bar */}
              <div className="relative w-full md:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Cari judul jurnal atau nama penulis..."
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Tombol Upload */}
              <Link 
                href="/jurnal/upload"
                className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 md:w-auto w-full shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
              >
                <span className="mr-2">☁️</span> Upload Jurnal Saya
              </Link>
            </div>
          </div>

          {/* Content Grid */}
          <div className="max-w-7xl mx-auto">
            
            {loading ? (
              // SKELETON LOADING
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : filteredJurnals.length > 0 ? (
              // DATA DITEMUKAN
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJurnals.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 flex flex-col group">
                    
                    {/* Badge Kategori */}
                    <div className="flex justify-between items-start mb-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {item.kategori || "Skripsi"}
                      </span>
                      <span className="text-gray-400 text-xs flex items-center gap-1">
                        <Calendar size={12} /> {item.tahun || "2024"}
                      </span>
                    </div>

                    {/* Judul & Penulis */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {item.judul}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-4 text-gray-500 text-sm">
                      <User size={14} className="text-gray-400" />
                      <span className="truncate">{item.nama}</span>
                    </div>

                    {/* Abstrak Pendek */}
                    <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1">
                      {item.abstrak}
                    </p>

                    {/* Tombol Aksi (DIUBAH MENJADI BUTTON HANDLE CLICK) */}
                    <div className="mt-auto pt-4 border-t border-gray-50">
                      <button 
                        onClick={() => handleOpenPdf(item)}
                        className="flex items-center justify-center w-full gap-2 px-4 py-2.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-blue-600 hover:text-white font-medium text-sm transition-all group/btn"
                      >
                        <BookOpen size={16} className="group-hover/btn:scale-110 transition-transform" />
                        Baca / Download PDF
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              // DATA KOSONG
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Belum ada jurnal ditemukan</h3>
                <p className="text-gray-500 mt-1">
                  {searchTerm ? `Tidak ada hasil untuk "${searchTerm}"` : "Jadilah yang pertama mempublikasikan karya!"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}