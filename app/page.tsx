"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowRight, BookOpen, Database, Wrench, Search, ArrowUpRight, X, ChevronLeft } from "lucide-react";
// Pastikan path ini benar
import PDFViewer from "@/components/ui/DocumentViewer";

interface SearchResult {
  id: string;
  title: string;
  judul?: string; // Jurnal biasanya menggunakan field 'judul'
  category: string;
  subject: string;
  downloadLink: string;
  fileKey?: string; // Kunci R2 untuk Jurnal
  type: any;
  source: "Materi" | "Jurnal" | "Peralatan"; 
}

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  
  const [allData, setAllData] = useState<SearchResult[]>([]); 
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [trendingTags, setTrendingTags] = useState<string[]>([]);

  // 1. UPDATE STATE PDF VIEWER (Menyimpan ID dan Tipe)
  const [selectedPdf, setSelectedPdf] = useState<{ id: string; type: "materi" | "jurnal"; title: string } | null>(null);

  // AMBIL DATA DARI 3 SUMBER
  useEffect(() => {
    async function fetchGlobalData() {
      try {
        const [resMateri, resJurnal, resTools] = await Promise.all([
          fetch('/api/materi'),
          fetch('/api/jurnal'),
          fetch('/api/peralatan')
        ]);

        const [jsonMateri, jsonJurnal, jsonTools] = await Promise.all([
          resMateri.json(),
          resJurnal.json(),
          resTools.json()
        ]);

        // Mapping agar setiap sumber memiliki penanda 'source'
        const combinedData = [
          ...(jsonMateri.success ? jsonMateri.data.map((i: any) => ({ ...i, source: "Materi" })) : []),
          ...(jsonJurnal.success ? jsonJurnal.data.map((i: any) => ({ ...i, source: "Jurnal", title: i.judul })) : []),
          ...(jsonTools.success ? jsonTools.data.map((i: any) => ({ ...i, source: "Peralatan" })) : [])
        ];

        setAllData(combinedData);

        const subjectCounts: Record<string, number> = {};
        combinedData.forEach((file: SearchResult) => {
          if (file.subject && file.subject !== "Umum" && file.subject !== "Tanpa Nama") {
            subjectCounts[file.subject] = (subjectCounts[file.subject] || 0) + 1;
          }
        });

        const sortedSubjects = Object.keys(subjectCounts).sort((a, b) => subjectCounts[b] - subjectCounts[a]);
        const top5 = sortedSubjects.slice(0, 5);
        setTrendingTags(top5.length > 0 ? top5 : ["Python", "Statistika", "Data Mining", "Machine Learning"]);

      } catch (err) {
        console.error("Gagal memuat data global");
      }
    }
    fetchGlobalData();
  }, []);

  // LOGIKA FILTERING
  useEffect(() => {
    if (query.trim().length > 0) {
      const lowerQ = query.toLowerCase();
      const results = allData.filter(item => 
        (item.title || "").toLowerCase().includes(lowerQ) || 
        (item.subject || "").toLowerCase().includes(lowerQ)
      ).slice(0, 10);
      setFilteredResults(results);
    } else {
      setFilteredResults([]);
    }
  }, [query, allData]);

  const handleSearch = (term: string, targetPage: string = "/materi") => {
    if (term.trim()) {
      router.push(`${targetPage}?q=${encodeURIComponent(term)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch(query, "/materi");
  };

  // --- 2. UPDATE FUNGSI KLIK HASIL PENCARIAN ---
  const handleResultClick = (file: SearchResult) => {
    const isPdf = file.type === "PDF" || file.title.toLowerCase().endsWith(".pdf");

    if (isPdf) {
       // Jika dari Jurnal, gunakan fileKey (R2). Jika Materi, gunakan id (Drive).
       const idToUse = file.source === "Jurnal" ? (file.fileKey || file.id) : file.id;
       const typeToUse = file.source === "Jurnal" ? "jurnal" : "materi";

       setSelectedPdf({ 
         id: idToUse, 
         type: typeToUse, 
         title: file.title 
       });
       setIsFocused(false);
    } else {
       window.open(file.downloadLink, "_blank");
    }
  };

  return (
    <>
      {/* --- MODAL PDF VIEWER --- */}
      {selectedPdf && (
        <div className="fixed inset-0 z-[99999] flex flex-col bg-gray-100 animate-in fade-in duration-200">
            <div className="flex items-center justify-between px-3 md:px-4 py-3 bg-white border-b shadow-sm shrink-0 z-10">
               <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                  <button onClick={() => setSelectedPdf(null)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors shrink-0">
                     <ChevronLeft size={24} className="md:w-7 md:h-7" />
                  </button>
                  <h3 className="font-semibold text-gray-800 truncate text-sm md:text-lg flex-1 min-w-0">{selectedPdf.title}</h3>
               </div>
               <button onClick={() => setSelectedPdf(null)} className="p-2 ml-2 hover:bg-red-50 hover:text-red-600 rounded-full text-gray-500 transition-colors shrink-0">
                  <X size={20} className="md:w-6 md:h-6" />
               </button>
            </div>

            {/* --- 3. FIX PEMANGGILAN PDFVIEWER --- */}
            <div className="flex-1 w-full h-full overflow-hidden relative">
               <PDFViewer 
                  type={selectedPdf.type} 
                  fileIdOrKey={selectedPdf.id} 
                  fileName={selectedPdf.title} 
               />
            </div>
        </div>
      )}

      {/* --- MAIN CONTENT (Render jika PDF tertutup) --- */}
      {!selectedPdf && (
        <div className="relative flex flex-col items-center justify-center min-h-screen text-center space-y-10 md:space-y-16 pt-24 pb-12 md:pt-32 md:pb-20 overflow-hidden" 
          onClick={() => setIsFocused(false)} 
        >
          {/* Background Grid */}
          <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_3rem] md:bg-[size:6rem_4rem]"></div>

          {/* HERO SECTION */}
          <section className="max-w-4xl w-full space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 px-4">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-datasea-main leading-[1.1]">
              Satu Pintu untuk <br/>
              <span className="relative inline-block">
                <span className="relative z-10">Ilmu Sains Data.</span>
                <span className="absolute bottom-1 md:bottom-2 left-0 w-full h-2 md:h-3 bg-yellow-200/50 -z-10 -rotate-1"></span>
              </span>
            </h1>
            <p className="text-base md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed px-2">
              Platform terpusat untuk menyimpan materi praktikum, jurnal riset, dan peralatan pendukung komunitas DATASEA UTY.
            </p>

            {/* SEARCH BAR */}
            <div className="max-w-xl mx-auto w-full relative z-50" onClick={(e) => e.stopPropagation()}>
              <div className="relative group mx-auto w-full max-w-md md:max-w-full">
                <div className={`absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl opacity-20 transition duration-500 ${isFocused ? "blur opacity-40" : "blur-sm"}`}></div>
                <div className="relative flex items-center bg-white rounded-2xl shadow-sm border border-gray-200 p-1.5 md:p-2">
                  <div className="pl-3 md:pl-4 text-gray-400"><Search className="w-4 h-4 md:w-5 md:h-5" /></div>
                  <input 
                    type="text" 
                    placeholder="Cari materi, jurnal, atau dataset..." 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onKeyDown={handleKeyDown} 
                    className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base text-gray-700 bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              {/* DROPDOWN HASIL */}
              {isFocused && query.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden text-left z-50 max-h-[60vh] overflow-y-auto">
                  <div className="p-2">
                    <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Hasil Pencarian Global</div>
                    {filteredResults.length > 0 ? (
                      filteredResults.map((file) => (
                        <div key={file.id} onClick={() => handleResultClick(file)} className="flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 rounded-xl cursor-pointer group transition-colors">
                          <div className={`p-2 rounded-lg ${file.source === "Materi" ? "bg-blue-100 text-blue-600" : file.source === "Jurnal" ? "bg-purple-100 text-purple-600" : "bg-orange-100 text-orange-600"}`}>
                            {file.source === "Materi" ? <BookOpen size={16} /> : file.source === "Jurnal" ? <Database size={16} /> : <Wrench size={16} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate">{file.title}</p>
                            <p className="text-[10px] text-gray-400">{file.source} • {file.subject}</p>
                          </div>
                          <ArrowUpRight size={14} className="text-gray-300 group-hover:text-blue-500" />
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-4 text-center text-sm text-gray-500 italic">Tidak ada file yang cocok.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* TRENDING TAGS */}
            <div className="flex flex-wrap justify-center items-center gap-2 text-sm text-gray-500 px-2 relative z-10">
                <span className="hidden md:inline mr-1">Trending:</span>
                {trendingTags.map((tag) => (
                  <button key={tag} onClick={() => { setQuery(tag); setIsFocused(true); }} className="px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-datasea-main hover:text-datasea-main transition-all text-[10px] md:text-xs font-medium">
                    {tag}
                  </button>
                ))}
            </div>
          </section>

          {/* NAVIGATION CARDS */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full max-w-6xl px-4 z-10 pb-8">
            <Link href="/materi" className="group bg-white p-6 md:p-8 rounded-3xl border border-gray-100 hover:border-datasea-main/20 hover:shadow-2xl transition-all text-left">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-datasea-main mb-6 group-hover:scale-110 transition-transform"><BookOpen size={24} /></div>
              <h3 className="text-xl md:text-2xl font-bold text-datasea-main mb-2">Arsip Materi</h3>
              <p className="text-gray-500 mb-6 text-xs md:text-sm">Akses modul praktikum Python, Statistik, dan Machine Learning.</p>
              <span className="text-datasea-main font-semibold text-xs md:text-sm flex items-center gap-2">Buka Materi <ArrowRight size={16} /></span>
            </Link>

            <Link href="/jurnal" className="group bg-white p-6 md:p-8 rounded-3xl border border-gray-100 hover:border-datasea-main/20 hover:shadow-2xl transition-all text-left">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform"><Database size={24} /></div>
              <h3 className="text-xl md:text-2xl font-bold text-datasea-main mb-2">Arsip Jurnal</h3>
              <p className="text-gray-500 mb-6 text-xs md:text-sm">Kumpulan publikasi riset dan studi kasus anggota komunitas.</p>
              <span className="text-purple-600 font-semibold text-xs md:text-sm flex items-center gap-2">Baca Jurnal <ArrowRight size={16} /></span>
            </Link>

            <Link href="/peralatan" className="group bg-white p-6 md:p-8 rounded-3xl border border-gray-100 hover:border-datasea-main/20 hover:shadow-2xl transition-all text-left">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-6 group-hover:scale-110 transition-transform"><Wrench size={24} /></div>
              <h3 className="text-xl md:text-2xl font-bold text-datasea-main mb-2">Peralatan</h3>
              <p className="text-gray-500 mb-6 text-xs md:text-sm">Download dataset latihan dan software pendukung.</p>
              <span className="text-orange-600 font-semibold text-xs md:text-sm flex items-center gap-2">Lihat Tools <ArrowRight size={16} /></span>
            </Link>
          </section>
        </div>
      )}
    </>
  );
}