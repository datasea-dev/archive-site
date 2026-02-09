"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { Loader2, Eye, Trash2, FileText, RefreshCw, LogOut, Clock, Search, X } from "lucide-react";
import Link from "next/link";
// 1. IMPORT CUSTOM ALERT
import CustomAlert from "@/components/ui/CustomAlert"; 

interface Submission {
  id: string;
  nama: string;
  nim: string;
  judul: string;
  fileURL: string;
  status: string;
  createdAt: any;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // STATE NAMA ADMIN (Default "Admin")
  const [adminName, setAdminName] = useState("Admin");

  // --- STATE ALERT ---
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- 1. FUNGSI LOGOUT (CORE) ---
  const handleLogout = useCallback(() => {
    localStorage.removeItem("adminSession");
    router.push("/admin/login");
  }, [router]);

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    handleLogout();
  };

  // --- 2. SISTEM SESI PINTAR & AMBIL NAMA ---
  useEffect(() => {
    // A. Cek sesi saat pertama load
    const checkInitialSession = () => {
        const sessionStr = localStorage.getItem("adminSession");
        if (!sessionStr) {
            handleLogout();
            return null;
        }
        return JSON.parse(sessionStr);
    };

    const session = checkInitialSession();
    if (!session) return;

    // --- LOGIKA BARU: AMBIL NAMA DARI EMAIL ---
    if (session.email) {
        // Contoh: hartono@datasea.com -> Diambil "hartono"
        const namePart = session.email.split("@")[0];
        // Ubah huruf depan jadi Kapital: "Hartono"
        const cleanName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        setAdminName(cleanName);
    }

    // B. Fungsi Reset Timer (Dipanggil saat user aktif)
    const resetTimer = () => {
        const currentSessionStr = localStorage.getItem("adminSession");
        if (currentSessionStr) {
            const currentSession = JSON.parse(currentSessionStr);
            currentSession.lastActivity = Date.now();
            localStorage.setItem("adminSession", JSON.stringify(currentSession));
        }
    };

    // C. Pasang "Mata-mata" aktivitas user
    window.addEventListener("click", resetTimer);
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keypress", resetTimer);
    window.addEventListener("scroll", resetTimer);

    // D. Interval Pengecekan
    const interval = setInterval(() => {
        const sessionStr = localStorage.getItem("adminSession");
        if (sessionStr) {
            const sess = JSON.parse(sessionStr);
            const now = Date.now();
            const maxIdleTime = 10 * 60 * 1000; // 10 Menit

            if (now - sess.lastActivity > maxIdleTime) {
                alert("Sesi berakhir karena tidak ada aktivitas selama 10 menit.");
                handleLogout();
            }
        } else {
            handleLogout();
        }
    }, 60000); 

    return () => {
        window.removeEventListener("click", resetTimer);
        window.removeEventListener("mousemove", resetTimer);
        window.removeEventListener("keypress", resetTimer);
        window.removeEventListener("scroll", resetTimer);
        clearInterval(interval);
    };
  }, [handleLogout]);

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "submissions"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data: Submission[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Submission);
      });
      setSubmissions(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 3. LOGIKA HAPUS (PAKAI API) ---
  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id); 
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch("/api/admin/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteTargetId }),
      });

      const result = await res.json();

      if (!result.success) throw new Error(result.message);

      await fetchData(); 
      setDeleteTargetId(null); 

    } catch (error: any) {
      console.error(error);
      alert("Gagal menghapus data: " + error.message); 
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredData = submissions.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
        item.nama.toLowerCase().includes(term) ||
        item.nim.toLowerCase().includes(term) ||
        item.judul.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      
      {/* HEADER DASHBOARD */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          {/* JUDUL DINAMIS SESUAI NAMA */}
          <h1 className="text-3xl font-bold text-gray-800">
            Halo, {adminName} 👋
          </h1>
          <p className="text-gray-500 flex items-center gap-2 mt-1">
            <Clock size={14} /> Selamat datang di panel admin. Sesi aktif 10 menit.
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
            <button 
            onClick={fetchData} 
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 shadow-sm transition-all text-sm font-medium"
            >
            <RefreshCw size={16} /> Refresh
            </button>
            
            <button 
            onClick={() => setShowLogoutAlert(true)} 
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 hover:bg-red-100 shadow-sm transition-all text-sm font-medium"
            >
            <LogOut size={16} /> Keluar
            </button>
        </div>
      </div>

      {/* STATS CARD */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Perlu Review</h3>
            <p className="text-4xl font-extrabold text-orange-500 mt-2">
                {submissions.filter(s => s.status === 'PENDING_CHECK').length}
            </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Siap Publish</h3>
            <p className="text-4xl font-extrabold text-blue-600 mt-2">
                {submissions.filter(s => s.status === 'BIODATA_OK' || s.status === 'WATERMARK_READY').length}
            </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Masuk</h3>
            <p className="text-4xl font-extrabold text-gray-800 mt-2">{submissions.length}</p>
        </div>
      </div>

      {/* SEARCH BAR & TABLE */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* BAGIAN SEARCH BAR */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Cari NIM, Nama, atau Judul..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
                />
                {searchTerm && (
                    <button 
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>
            
            <div className="text-sm text-gray-500">
                Menampilkan <b>{filteredData.length}</b> dari {submissions.length} data
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Mahasiswa</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Judul Jurnal</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <Loader2 className="animate-spin mx-auto mb-2 text-blue-500" /> Memuat data...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                    {searchTerm ? `Tidak ditemukan data dengan kata kunci "${searchTerm}"` : "Belum ada data masuk."}
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString("id-ID") : "-"}
                      <div className="text-xs text-gray-400">
                        {item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleTimeString("id-ID", {hour: '2-digit', minute:'2-digit'}) : ""}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-800">{item.nama}</p>
                        <p className="text-xs text-gray-500 font-mono">{item.nim}</p>
                    </td>

                    <td className="px-6 py-4 max-w-xs">
                        <p className="text-sm text-gray-700 font-medium line-clamp-2 leading-relaxed" title={item.judul}>
                            {item.judul}
                        </p>
                        <a href={item.fileURL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-blue-600 hover:text-blue-800 mt-1.5 bg-blue-50 px-2 py-0.5 rounded-md">
                            <FileText size={10} /> PDF Asli
                        </a>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            item.status === 'PENDING_CHECK' 
                                ? 'bg-orange-100 text-orange-700' 
                            : item.status === 'BIODATA_OK' || item.status === 'WATERMARK_READY'
                                ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                            {item.status === 'PENDING_CHECK' && "🟠 Perlu Review"}
                            {(item.status === 'BIODATA_OK' || item.status === 'WATERMARK_READY') && "🔵 Siap Publish"}
                            {item.status === 'PUBLISHED' && "🟢 Terbit"}
                        </span>
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2 opacity-100">
                            <Link 
                                href={`/admin/review/${item.id}`}
                                className="p-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-all"
                                title="Proses Data Ini"
                            >
                                <Eye size={16} />
                            </Link>
                            
                            {/* TOMBOL HAPUS */}
                            <button 
                                onClick={() => handleDeleteClick(item.id)}
                                className="p-2 text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-all border border-red-200 hover:border-red-500"
                                title="Hapus Permanen"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ALERT LOGOUT */}
      <CustomAlert
        isOpen={showLogoutAlert}
        onClose={() => setShowLogoutAlert(false)}
        onConfirm={confirmLogout}
        title="Konfirmasi Keluar"
        message="Apakah Anda yakin ingin mengakhiri sesi admin ini? Anda harus login kembali untuk mengakses halaman ini."
        type="danger"
        loading={isLoggingOut}
      />

      {/* ALERT HAPUS DATA */}
      <CustomAlert
        isOpen={!!deleteTargetId} 
        onClose={() => setDeleteTargetId(null)} // Tombol Batal
        onConfirm={confirmDelete} // Tombol Ya: Eksekusi Hapus via API
        title="Hapus Data Permanen?"
        message="Tindakan ini tidak dapat dibatalkan. Data jurnal dan file terkait (di Google Drive & UploadThing) akan dihapus total dari sistem."
        type="danger" 
        loading={isDeleting}
      />

    </div>
  );
}