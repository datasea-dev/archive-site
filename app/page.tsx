"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowRight, BookOpen, Database, Wrench, Search, FileText, ArrowUpRight } from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  category: string;
  subject: string;
  downloadLink: string;
  type: any;
  source: "Materi" | "Jurnal" | "Peralatan"; // Penanda asal
}

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  
  const [allData, setAllData] = useState<SearchResult[]>([]); // Gabungan semua data
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [trendingTags, setTrendingTags] = useState<string[]>([]);

  // 1. AMBIL DATA DARI 3 SUMBER SEKALIGUS
  useEffect(() => {
    async function fetchGlobalData() {
      try {
        // Panggil 3 API secara paralel
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

        // Gabungkan semua data
        const combinedData = [
          ...(jsonMateri.success ? jsonMateri.data : []),
          ...(jsonJurnal.success ? jsonJurnal.data : []),
          ...(jsonTools.success ? jsonTools.data : [])
        ];

        setAllData(combinedData);

        // --- HITUNG TRENDING (GLOBAL) ---
        const subjectCounts: Record<string, number> = {};
        combinedData.forEach((file: SearchResult) => {
          if (file.subject && file.subject !== "Umum" && file.subject !== "Tanpa Nama") {
            subjectCounts[file.subject] = (subjectCounts[file.subject] || 0) + 1;
          }
        });

        const sortedSubjects = Object.keys(subjectCounts).sort(
          (a, b) => subjectCounts[b] - subjectCounts[a]
        );

        const top5 = sortedSubjects.slice(0, 5);
        if (top5.length > 0) {
          setTrendingTags(top5);
        } else {
          setTrendingTags(["Python", "Statistika", "Data Mining", "Machine Learning"]);
        }

      } catch (err) {
        console.error("Gagal memuat data global");
      }
    }
    fetchGlobalData();
  }, []);

  // 2. LOGIKA FILTERING (Cari di semua kategori)
  useEffect(() => {
    if (query.trim().length > 0) {
      const lowerQ = query.toLowerCase();
      const results = allData.filter(item => 
        item.title.toLowerCase().includes(lowerQ) || 
        item.subject.toLowerCase().includes(lowerQ)
      ).slice(0, 10);
      setFilteredResults(results);
    } else {
      setFilteredResults([]);
    }
  }, [query, allData]);

  // Fungsi Submit
  const handleSearch = (term: string, targetPage: string = "/materi") => {
    if (term.trim()) {
      router.push(`${targetPage}?q=${encodeURIComponent(term)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // Default cari di Materi dulu jika enter
      handleSearch(query, "/materi");
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[85vh] text-center space-y-10 md:space-y-16 py-8 md:py-12 overflow-hidden" 
      onClick={() => setIsFocused(false)} 
    >
      
      {/* 0. BACKGROUND GRID */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_3rem] md:bg-[size:6rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_50%_200px,#d5c5ff00,transparent)]"></div>
      </div>

      {/* 1. HERO SECTION */}
      <section className="max-w-4xl w-full space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 px-4">
        
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-datasea-main leading-[1.1] md:leading-[1.1]">
          Satu Pintu untuk <br/>
          <span className="relative inline-block">
            <span className="relative z-10">Ilmu Sains Data.</span>
            <span className="absolute bottom-1 md:bottom-2 left-0 w-full h-2 md:h-3 bg-yellow-200/50 -z-10 -rotate-1"></span>
          </span>
        </h1>
        
        <p className="text-base md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed px-2">
          Platform terpusat untuk menyimpan materi praktikum, jurnal riset, 
          dan peralatan pendukung komunitas DATASEA UTY.
        </p>

        {/* --- SEARCH BAR --- */}
        <div className="max-w-xl mx-auto w-full relative z-50" onClick={(e) => e.stopPropagation()}>
          
          <div className="relative group mx-auto w-full max-w-md md:max-w-full">
            <div className={`absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl opacity-20 transition duration-500 ${isFocused ? "blur opacity-40" : "blur-sm"}`}></div>
            
            <div className="relative flex items-center bg-white rounded-2xl shadow-sm border border-gray-200 p-1.5 md:p-2">
              <div className="pl-3 md:pl-4 text-gray-400">
                <Search className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <input 
                type="text" 
                placeholder="Cari materi, jurnal, atau dataset..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onKeyDown={handleKeyDown} 
                className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base text-gray-700 bg-transparent focus:outline-none placeholder-gray-400"
              />
              {query && (
                <button onClick={() => setQuery("")} className="mr-2 text-gray-400 hover:text-gray-600">
                  <span className="sr-only">Clear</span>
                  &#10005;
                </button>
              )}
            </div>
          </div>

          {/* DROPDOWN HASIL (GLOBAL) */}
          {isFocused && query.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden text-left animate-in slide-in-from-top-2 duration-200 z-50 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="p-2">
                <div className="flex justify-between items-center px-3 py-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Hasil Pencarian Global
                  </span>
                  {filteredResults.length > 0 && (
                    <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      {filteredResults.length} Ditemukan
                    </span>
                  )}
                </div>
                
                {filteredResults.length > 0 ? (
                  <>
                    {filteredResults.slice(0, 5).map((file) => (
                      <div 
                        key={file.id} 
                        onClick={() => window.open(file.downloadLink, "_blank")}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 rounded-xl cursor-pointer group transition-colors"
                      >
                        {/* Ikon Berdasarkan Sumber (Materi/Jurnal/Tools) */}
                        <div className={`p-2 rounded-lg transition-colors shrink-0 ${
                            file.source === "Materi" ? "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white" :
                            file.source === "Jurnal" ? "bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white" :
                            "bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white"
                        }`}>
                          {file.source === "Materi" ? <BookOpen size={16} /> : 
                           file.source === "Jurnal" ? <Database size={16} /> : 
                           <Wrench size={16} />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate group-hover:text-blue-700">{file.title}</p>
                          <div className="flex items-center gap-2">
                             {/* Badge Sumber Kecil */}
                             <span className={`text-[10px] px-1.5 rounded ${
                                file.source === "Materi" ? "bg-blue-50 text-blue-600" :
                                file.source === "Jurnal" ? "bg-purple-50 text-purple-600" :
                                "bg-orange-50 text-orange-600"
                             }`}>
                                {file.source}
                             </span>
                             <p className="text-xs text-gray-400 truncate">{file.subject}</p>
                          </div>
                        </div>
                        <ArrowUpRight size={14} className="text-gray-300 group-hover:text-blue-500 shrink-0" />
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="px-3 py-4 text-center">
                    <p className="text-sm text-gray-500 italic">Tidak ada file yang cocok.</p>
                  </div>
                )}
              </div>
              <div className="h-px bg-gray-100 my-1"></div>
              <div className="p-2 bg-gray-50/50">
                <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Telusuri "{query}" lebih lanjut di:
                </div>
                <div className="space-y-1">
                  <button onClick={() => handleSearch(query, "/materi")} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 rounded-xl transition-all text-left group">
                    <div className="p-1.5 bg-blue-100 text-datasea-main rounded-lg group-hover:scale-110 transition-transform shrink-0"><BookOpen size={14} /></div>
                    <span className="text-sm text-gray-600 font-medium group-hover:text-datasea-main">Arsip Materi</span>
                  </button>
                  <button onClick={() => handleSearch(query, "/jurnal")} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 rounded-xl transition-all text-left group">
                    <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg group-hover:scale-110 transition-transform shrink-0"><Database size={14} /></div>
                    <span className="text-sm text-gray-600 font-medium group-hover:text-purple-700">Arsip Jurnal</span>
                  </button>
                  <button onClick={() => handleSearch(query, "/peralatan")} className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 rounded-xl transition-all text-left group">
                    <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg group-hover:scale-110 transition-transform shrink-0"><Wrench size={14} /></div>
                    <span className="text-sm text-gray-600 font-medium group-hover:text-orange-700">Peralatan</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- TRENDING TAGS OTOMATIS --- */}
        <div className="flex flex-wrap justify-center items-center gap-2 text-sm text-gray-500 px-2 relative z-10">
            <span className="hidden md:inline mr-1">Trending:</span>
            {trendingTags.length === 0 && (
               <span className="text-xs text-gray-300 animate-pulse">Memuat...</span>
            )}
            {trendingTags.map((tag) => (
              <button 
                key={tag} 
                onClick={() => { setQuery(tag); setIsFocused(true); }}
                className="px-2.5 py-1 md:px-3 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-datasea-main hover:text-datasea-main hover:bg-blue-50 cursor-pointer transition-all shadow-sm text-[10px] md:text-xs font-medium"
              >
                {tag}
              </button>
            ))}
        </div>

      </section>

      {/* 2. NAVIGATION CARDS (Sama seperti sebelumnya) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full max-w-6xl px-4 z-10 pb-8">
        <Link href="/materi" className="group relative overflow-hidden bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-gray-100 hover:border-datasea-main/20 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-300 text-left">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-50 rounded-xl md:rounded-2xl flex items-center justify-center text-datasea-main mb-4 md:mb-6 group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6 md:w-7 md:h-7" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-datasea-main mb-2">Arsip Materi</h3>
          <p className="text-gray-500 mb-4 md:mb-6 leading-relaxed text-xs md:text-sm">Akses modul praktikum Python, Statistik, dan Machine Learning.</p>
          <span className="text-datasea-main font-semibold text-xs md:text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
            Buka Materi <ArrowRight size={16} />
          </span>
        </Link>

        <Link href="/jurnal" className="group relative overflow-hidden bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-gray-100 hover:border-datasea-main/20 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-300 text-left">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-purple-50 rounded-xl md:rounded-2xl flex items-center justify-center text-purple-600 mb-4 md:mb-6 group-hover:scale-110 transition-transform">
            <Database className="w-6 h-6 md:w-7 md:h-7" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-datasea-main mb-2">Arsip Jurnal</h3>
          <p className="text-gray-500 mb-4 md:mb-6 leading-relaxed text-xs md:text-sm">Kumpulan publikasi riset dan studi kasus anggota komunitas.</p>
          <span className="text-purple-600 font-semibold text-xs md:text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
            Baca Jurnal <ArrowRight size={16} />
          </span>
        </Link>

        <Link href="/peralatan" className="group relative overflow-hidden bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-gray-100 hover:border-datasea-main/20 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-300 text-left">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-orange-50 rounded-xl md:rounded-2xl flex items-center justify-center text-orange-600 mb-4 md:mb-6 group-hover:scale-110 transition-transform">
            <Wrench className="w-6 h-6 md:w-7 md:h-7" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-datasea-main mb-2">Peralatan</h3>
          <p className="text-gray-500 mb-4 md:mb-6 leading-relaxed text-xs md:text-sm">Download dataset latihan dan software pendukung.</p>
          <span className="text-orange-600 font-semibold text-xs md:text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
            Lihat Tools <ArrowRight size={16} />
          </span>
        </Link>
      </section>
    </div>
  );
}