"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import FileCard from "@/components/ui/FileCard";
import { Search, Calendar, Filter, FolderGit2, Loader2, AlertCircle, ChevronLeft, ChevronRight, Layers, X } from "lucide-react";
// Import PDFViewer
import PDFViewer from "@/components/ui/PDFViewer";

interface MateriFile {
  id: string;
  title: string;
  type: any;
  date: string;
  year: string;
  semester: string;
  category: string;
  subject: string;
  downloadLink: string;
}

const ITEMS_PER_PAGE = 8; // Limit 8 item per halaman

// --- 💡 CACHING: Variabel di luar komponen agar data persisten saat navigasi ---
let globalMateriCache: MateriFile[] | null = null;

function MateriContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  // STATE DATA
  const [allFiles, setAllFiles] = useState<MateriFile[]>(globalMateriCache || []);
  const [isLoading, setIsLoading] = useState(!globalMateriCache); // Loading hanya jika cache kosong
  const [error, setError] = useState("");

  // STATE FILTER
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedYear, setSelectedYear] = useState(""); 
  const [selectedSemester, setSelectedSemester] = useState("Semua");
  const [activeFilter, setActiveFilter] = useState("Semua");

  // STATE PAGINATION
  const [currentPage, setCurrentPage] = useState(1);

  // STATE PDF VIEWER (MODAL)
  const [selectedPdf, setSelectedPdf] = useState<{ url: string; title: string } | null>(null);

  // --- 🛠️ HELPER: DETEKSI TIPE FILE DARI JUDUL (FIX LABEL "PDF") ---
  const getFileType = (filename: string) => {
    const lower = filename.toLowerCase();
    if (lower.endsWith(".pdf")) return "PDF";
    if (lower.endsWith(".pptx") || lower.endsWith(".ppt")) return "PPT";
    if (lower.endsWith(".docx") || lower.endsWith(".doc")) return "DOC";
    if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) return "XLS"; // Mapping ke XLS agar icon Excel muncul (jika FileCard support)
    if (lower.endsWith(".zip") || lower.endsWith(".rar")) return "ZIP";
    if (lower.endsWith(".py") || lower.endsWith(".ipynb")) return "CODE";
    return "FILE"; // Default
  };

  // FETCH DATA
  useEffect(() => {
    if (globalMateriCache) {
      setAllFiles(globalMateriCache);
      setIsLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const res = await fetch('/api/materi');
        const json = await res.json();
        
        if (json.success) {
          setAllFiles(json.data);
          globalMateriCache = json.data; // Simpan ke cache global
        } else {
          setError("Gagal memuat data dari server.");
        }
      } catch (err) {
        setError("Terjadi kesalahan koneksi.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // LOGIC TAHUN
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(allFiles.map(f => f.year))).sort().reverse();
    return years;
  }, [allFiles]);

  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  // LOGIC SEMESTER
  const filesInYear = useMemo(() => {
    return allFiles.filter(f => f.year === selectedYear);
  }, [allFiles, selectedYear]);

  const availableSemesters = useMemo(() => {
    const semesters = new Set<string>();
    filesInYear.forEach(f => {
      if (f.semester && f.semester !== "Semua Semester") {
          semesters.add(f.semester);
      }
    });
    return Array.from(semesters).sort();
  }, [filesInYear]);

  // Auto Reset Semester saat ganti tahun
  useEffect(() => {
    setSelectedSemester("Semua");
  }, [selectedYear]);

  // LOGIC FILTER BERDASARKAN SEMESTER
  const filesInSemester = useMemo(() => {
    return filesInYear.filter(f => 
        selectedSemester === "Semua" ? true : f.semester === selectedSemester
    );
  }, [filesInYear, selectedSemester]);

  // LOGIC TABS FILTER (Matkul / UTS / UAS)
  const filterTabs = useMemo(() => {
    const subjects = new Set<string>();
    let hasUTS = false;
    let hasUAS = false;

    filesInSemester.forEach(f => {
      if (f.subject !== "Umum") subjects.add(f.subject);
      if (f.category === "UTS") hasUTS = true;
      if (f.category === "UAS") hasUAS = true;
    });

    const sortedSubjects = Array.from(subjects).sort();
    const tabs = ["Semua", ...sortedSubjects];
    if (hasUTS) tabs.push("UTS");
    if (hasUAS) tabs.push("UAS");
    
    return tabs;
  }, [filesInSemester]);

  // LOGIC RESET HALAMAN
  useEffect(() => {
    if (activeFilter !== "Semua" && !filterTabs.includes(activeFilter)) {
      setActiveFilter("Semua");
    }
    setCurrentPage(1);
  }, [selectedYear, selectedSemester, activeFilter]); 

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // LOGIC PENYARINGAN FINAL (SEARCH & FILTER)
  const filteredFiles = useMemo(() => {
    return filesInSemester.filter((file) => {
      let matchFilter = false;
      if (activeFilter === "Semua") matchFilter = true;
      else if (activeFilter === "UTS") matchFilter = file.category === "UTS";
      else if (activeFilter === "UAS") matchFilter = file.category === "UAS";
      else matchFilter = file.subject === activeFilter;
      
      const lowerQuery = searchQuery.toLowerCase();
      const matchSearch = 
          file.title.toLowerCase().includes(lowerQuery) || 
          file.subject.toLowerCase().includes(lowerQuery);
      
      return matchFilter && matchSearch;
    });
  }, [filesInSemester, activeFilter, searchQuery]);

  // LOGIC POTONG HALAMAN (PAGINATION)
  const totalPages = Math.ceil(filteredFiles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedFiles = filteredFiles.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // --- FUNGSI KLIK FILE (UPDATED) ---
  const handleFileClick = (file: MateriFile) => {
    // Cek tipe file dengan fungsi helper
    const realType = getFileType(file.title);

    if (realType === "PDF") {
      // Buka lewat Proxy API Viewer (Hanya PDF)
      const proxyUrl = `/api/pdf?id=${file.id}`;
      setSelectedPdf({ url: proxyUrl, title: file.title });
    } else {
      // PPT, DOC, ZIP dll langsung download/buka link
      window.open(file.downloadLink, "_blank");
    }
  };

  return (
    <div className="min-h-screen pt-20 md:pt-28 pb-12 md:pb-20 animate-in fade-in duration-700 px-4 md:px-8 relative">
      
      {/* --- MODAL PDF VIEWER (FULL SCREEN OVERLAY) --- */}
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

      {/* PAGE TITLE */}
      <div className="relative mb-6 md:mb-10 mt-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-datasea-main flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
          <div className="p-2 md:p-3 bg-blue-100/50 rounded-xl md:rounded-2xl border border-blue-100">
            <FolderGit2 className="text-datasea-main w-6 h-6 md:w-8 md:h-8" />
          </div>
          Arsip Materi
        </h1>
        <p className="text-gray-500 max-w-2xl text-xs md:text-base leading-relaxed">
          Pusat bank soal, modul praktikum, dan materi kuliah per angkatan.
        </p>
      </div>

      {/* CONTROLS SECTION */}
      <div className="sticky top-[3.5rem] md:top-24 z-30 space-y-3 bg-datasea-surface/95 backdrop-blur-sm py-3 -mx-4 px-4 md:-mx-2 md:px-2 transition-all shadow-sm md:shadow-none border-b md:border-none border-gray-100/50">
        <div className="grid grid-cols-2 md:flex gap-2 md:gap-3">
          
          {/* Tahun */}
          <div className="relative col-span-1 md:w-40">
             <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-500"><Calendar size={14} className="md:w-4 md:h-4" /></div>
             <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} disabled={isLoading || availableYears.length === 0} className="w-full pl-8 pr-6 py-2 md:py-2.5 bg-white border border-gray-200 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold text-datasea-main focus:outline-none focus:ring-2 focus:ring-datasea-main/20 appearance-none shadow-sm cursor-pointer disabled:bg-gray-100 truncate">
                {isLoading && <option>...</option>}
                {!isLoading && availableYears.length === 0 && <option>0</option>}
                {availableYears.map((y) => <option key={y} value={y}>Angk. {y}</option>)}
             </select>
             <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-gray-400"><Filter size={10} className="md:w-3 md:h-3" /></div>
          </div>

          {/* Semester */}
          <div className="relative col-span-1 md:w-40">
             <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-500"><Layers size={14} className="md:w-4 md:h-4" /></div>
             <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} disabled={isLoading} className="w-full pl-8 pr-6 py-2 md:py-2.5 bg-white border border-gray-200 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold text-datasea-main focus:outline-none focus:ring-2 focus:ring-datasea-main/20 appearance-none shadow-sm cursor-pointer disabled:bg-gray-100 truncate">
                <option value="Semua">Semua</option>
                {availableSemesters.length > 0 ? (availableSemesters.map((s) => <option key={s} value={s}>{s}</option>)) : (!isLoading && <option disabled className="text-gray-400">-</option>)}
             </select>
             <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-gray-400"><Filter size={10} className="md:w-3 md:h-3" /></div>
          </div>

          {/* Search Bar */}
          <div className="relative col-span-2 md:flex-1">
            <input type="text" placeholder="Cari materi, UTS, UAS..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} disabled={isLoading} className="w-full pl-9 pr-4 py-2 md:py-2.5 rounded-lg md:rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-datasea-main focus:ring-1 focus:ring-datasea-main transition-all text-xs md:text-sm shadow-sm disabled:bg-gray-100" />
            <Search className="absolute left-3 top-2.5 md:top-3 text-gray-400 w-4 h-4" />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 no-scrollbar">
          <div className="flex gap-2 w-max">
            {filterTabs.map((tabName) => (
              <button key={tabName} onClick={() => setActiveFilter(tabName)} disabled={isLoading} className={`px-3 py-1.5 md:px-5 md:py-2 rounded-full text-[11px] md:text-sm font-medium whitespace-nowrap transition-all border ${activeFilter === tabName ? "bg-datasea-main text-white border-datasea-main shadow-md shadow-blue-900/10" : "bg-white text-gray-500 border-gray-200 hover:border-datasea-main hover:text-datasea-main"}`}>
                {tabName}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 animate-pulse">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-datasea-main" />
          <p className="text-sm font-medium">Sedang menghubungkan ke Google Drive...</p>
        </div>
      )}

      {!isLoading && error && (
        <div className="flex flex-col items-center justify-center py-20 text-red-500 bg-red-50 rounded-3xl border border-red-100"><AlertCircle className="w-10 h-10 mb-2" /><p className="font-semibold">{error}</p></div>
      )}

      {/* SUCCESS: DATA ADA */}
      {!isLoading && !error && filteredFiles.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 mt-4 min-h-[50vh] content-start">
            {paginatedFiles.map((file) => {
              // DETEKSI OTOMATIS TIPE FILE UNTUK LABEL
              const realType = getFileType(file.title);

              return (
                <div key={file.id} onClick={() => handleFileClick(file)} className="cursor-pointer active:scale-[0.98] transition-transform">
                    {/* @ts-ignore */}
                    <FileCard 
                      title={file.title} 
                      type={realType as any} // SOLUSI: FORCE CASTING AGAR TYPESCRIPT TIDAK REWEL
                      date={file.date} 
                      tag={activeFilter === "UTS" || activeFilter === "UAS" ? file.subject : file.category === "Mata Kuliah" ? file.subject : file.category} 
                    />
                </div>
              );
            })}
          </div>

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8 md:mt-12 py-4 pb-20 md:pb-4">
              <button 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1} 
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="flex gap-1 overflow-x-auto max-w-[180px] md:max-w-[200px] no-scrollbar">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`min-w-[36px] h-9 md:min-w-[40px] md:h-10 rounded-lg text-xs md:text-sm font-medium transition-all flex items-center justify-center ${
                      currentPage === page
                        ? "bg-datasea-main text-white shadow-md shadow-blue-900/20"
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages} 
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}

      {/* EMPTY: DATA KOSONG */}
      {!isLoading && !error && filteredFiles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 md:py-16 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50 mt-4">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400"><Search className="w-6 h-6 md:w-7 md:h-7" /></div>
          <h3 className="text-sm md:text-base font-semibold text-gray-900">Tidak ditemukan</h3>
          <p className="text-gray-500 text-xs mt-1 max-w-xs px-4">
             {searchQuery ? `Belum ada materi "${searchQuery}".` : `Folder kosong.`}
          </p>
          {(searchQuery || activeFilter !== "Semua") && <button onClick={() => {setActiveFilter("Semua"); setSearchQuery("");}} className="mt-6 px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-datasea-main hover:bg-gray-50 transition-colors shadow-sm">Reset Filter</button>}
        </div>
      )}
    </div>
  );
}

// EKSPOR UTAMA
export default function MateriClient() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm text-gray-500">Memuat Halaman...</div>}>
      <MateriContent />
    </Suspense>
  );
}