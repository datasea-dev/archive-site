"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import PDFViewer from "@/components/ui/PDFViewer"; // Sesuaikan path jika lokasi file PDFViewer Mas berbeda
import { Loader2, CheckCircle, XCircle, FileText, User } from "lucide-react";

// Struktur Data Jurnal dari Firebase
interface JurnalSubmission {
  id: string;
  nama: string;
  nim: string;
  judul: string;
  fileKey: string;
  status: string;
}

export default function ReviewAdminPage() {
  const [submissions, setSubmissions] = useState<JurnalSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJurnal, setSelectedJurnal] = useState<JurnalSubmission | null>(null);

  // Mengambil data dari Firestore saat halaman dimuat
  useEffect(() => {
    fetchPendingSubmissions();
  }, []);

  const fetchPendingSubmissions = async () => {
    setLoading(true);
    try {
      // Hanya ambil data yang statusnya masih PENDING_CHECK
      const q = query(collection(db, "submissions"), where("status", "==", "PENDING_CHECK"));
      const querySnapshot = await getDocs(q);
      
      const data: JurnalSubmission[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as JurnalSubmission);
      });
      
      setSubmissions(data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Review Jurnal</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* KOLOM KIRI: Daftar Antrean */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[700px]">
            <div className="p-5 border-b border-gray-100 bg-gray-50">
              <h2 className="font-bold text-gray-700 flex items-center gap-2">
                <FileText size={18} /> Antrean Review ({submissions.length})
              </h2>
            </div>
            
            <div className="overflow-y-auto p-4 space-y-3 flex-1">
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" /></div>
              ) : submissions.length === 0 ? (
                <p className="text-center text-gray-500 text-sm py-10">Tidak ada jurnal baru yang perlu direview. Santai dulu, Mas! ☕</p>
              ) : (
                submissions.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedJurnal(item)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedJurnal?.id === item.id 
                      ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" 
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                    }`}
                  >
                    <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">{item.judul}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
                      <User size={12} /> {item.nama} ({item.nim})
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* KOLOM KANAN: Preview PDF & Aksi */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-[700px] flex flex-col">
            {selectedJurnal ? (
              <>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{selectedJurnal.judul}</h2>
                    <p className="text-sm text-gray-500 mt-1">Oleh: {selectedJurnal.nama} | NIM: {selectedJurnal.nim}</p>
                  </div>
                  
                  {/* Tombol Aksi (Nanti kita buatkan fungsinya di tahap berikutnya) */}
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-semibold rounded-lg text-sm transition-colors">
                      <XCircle size={16} /> Tolak
                    </button>
                    <button className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-sm">
                      <CheckCircle size={16} /> Terima & Publikasi
                    </button>
                  </div>
                </div>

                {/* Komponen Adobe PDF Viewer */}
                <div className="flex-1 rounded-xl overflow-hidden border border-gray-200">
                  <PDFViewer 
                    type="jurnal" // Memastikan ini mengambil jalur R2
                    fileIdOrKey={selectedJurnal.fileKey} 
                    fileName={selectedJurnal.judul}
                  />
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <FileText size={48} className="mb-4 opacity-50" />
                <p>Pilih jurnal dari daftar di sebelah kiri untuk mulai mereview.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}