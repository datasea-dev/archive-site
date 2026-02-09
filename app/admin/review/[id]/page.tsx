"use client";

import { useState, useEffect, use } from "react"; 
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { ArrowLeft, Save, CheckCircle, XCircle, ExternalLink, Loader2, AlertTriangle, FileText } from "lucide-react";
import Link from "next/link";
// 1. Import CustomAlert
import CustomAlert from "@/components/ui/CustomAlert"; 

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrapping params untuk Next.js terbaru
  const { id } = use(params);
  
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // State Form Edit
  const [formData, setFormData] = useState({
    judul: "",
    nama: "",
    nim: "",
    abstrak: "",
    tahun: new Date().getFullYear().toString(),
    kategori: "Skripsi"
  });

  // --- STATE ALERT CONFIG ---
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "warning" as "warning" | "success" | "danger",
    onConfirm: () => {},
    isLoading: false,
    isSingleButton: false, 
  });

  // 1. FETCH DATA DETAIL
  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "submissions", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const docData = docSnap.data();
            setData(docData);
            setFormData({
                judul: docData.judul || "",
                nama: docData.nama || "",
                nim: docData.nim || "",
                abstrak: docData.abstrak || "",
                tahun: new Date().getFullYear().toString(),
                kategori: "Skripsi"
            });
        } else {
            setAlertConfig({
                isOpen: true,
                title: "Data Tidak Ditemukan",
                message: "Data jurnal yang Anda cari tidak ada atau sudah dihapus.",
                type: "danger",
                isSingleButton: true,
                onConfirm: () => router.push("/admin/dashboard"),
                isLoading: false
            });
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  // 2. LOGIC SIMPAN PERUBAHAN
  const handleSaveClick = () => { processSave(); };

  const processSave = async () => {
    try {
        const docRef = doc(db, "submissions", id);
        await updateDoc(docRef, {
            judul: formData.judul,
            nama: formData.nama,
            nim: formData.nim,
            abstrak: formData.abstrak,
            tahun: formData.tahun,
            kategori: formData.kategori
        });
        
        setAlertConfig({
            isOpen: true,
            title: "Perubahan Disimpan",
            message: "Data jurnal berhasil diperbarui.",
            type: "success",
            isSingleButton: true,
            onConfirm: () => setAlertConfig(prev => ({...prev, isOpen: false})),
            isLoading: false
        });
    } catch (error) {
        setAlertConfig({
            isOpen: true,
            title: "Gagal Menyimpan",
            message: "Terjadi kesalahan saat menyimpan perubahan.",
            type: "danger",
            isSingleButton: true,
            onConfirm: () => setAlertConfig(prev => ({...prev, isOpen: false})),
            isLoading: false
        });
    }
  };

  // 3. LOGIC PUBLISH (DENGAN PROGRESS ALERT)
  const handlePublishClick = () => {
    setAlertConfig({
        isOpen: true,
        title: "Konfirmasi Publikasi",
        message: "Sistem akan menambahkan watermark 'DATASEA' dan mengupload jurnal ini ke Google Drive Resmi. Lanjutkan?",
        type: "success", 
        isSingleButton: false,
        isLoading: false,
        onConfirm: processPublish, 
    });
  };

  const processPublish = async () => {
    // A. UBAH TAMPILAN ALERT JADI LOADING
    setAlertConfig(prev => ({ 
        ...prev, 
        isLoading: true,
        title: "Sedang Memproses...", // Judul berubah
        message: "Mohon tunggu. Sistem sedang memberi watermark dan mengupload ke Google Drive. Jangan tutup halaman ini." // Pesan berubah
    }));

    try {
        const res = await fetch("/api/admin/publish", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: id }),
        });

        const result = await res.json();

        if (result.success) {
            // B. SUKSES: UBAH ALERT JADI SUKSES
            setAlertConfig({
                isOpen: true,
                title: "Publikasi Berhasil! 🎉",
                message: "Jurnal telah berhasil diterbitkan ke Google Drive dan status diperbarui.",
                type: "success",
                isSingleButton: true, 
                isLoading: false,
                onConfirm: () => router.push("/admin/dashboard"),
            });
        } else {
            throw new Error(result.message);
        }

    } catch (error: any) {
        // C. GAGAL: UBAH ALERT JADI ERROR
        setAlertConfig({
            isOpen: true,
            title: "Gagal Mempublikasikan",
            message: error.message || "Terjadi kesalahan sistem saat menghubungi server.",
            type: "danger",
            isSingleButton: true,
            isLoading: false,
            onConfirm: () => setAlertConfig(prev => ({...prev, isOpen: false})),
        });
    }
  };

  // 4. LOGIC REJECT
  const handleRejectClick = () => {
    setAlertConfig({
        isOpen: true,
        title: "Tolak & Hapus Jurnal?",
        message: "Tindakan ini akan menghapus data pengajuan ini secara permanen dari sistem. Mahasiswa harus mengupload ulang.",
        type: "danger",
        isSingleButton: false,
        isLoading: false,
        onConfirm: processReject,
    });
  };

  const processReject = async () => {
    setAlertConfig(prev => ({ ...prev, isLoading: true, title: "Menghapus Data...", message: "Sedang menghapus data dari database..." }));
    
    try {
        await deleteDoc(doc(db, "submissions", id));
        
        setAlertConfig({
            isOpen: true,
            title: "Data Dihapus",
            message: "Pengajuan jurnal telah ditolak dan dihapus dari database.",
            type: "success",
            isSingleButton: true,
            isLoading: false,
            onConfirm: () => router.push("/admin/dashboard"),
        });
    } catch (error) {
        setAlertConfig({
            isOpen: true,
            title: "Gagal Menghapus",
            message: "Terjadi kesalahan saat menghapus data.",
            type: "danger",
            isSingleButton: true,
            isLoading: false,
            onConfirm: () => setAlertConfig(prev => ({...prev, isOpen: false})),
        });
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      
      {/* HEADER NAV */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                <ArrowLeft size={20} />
            </Link>
            <div>
                <h1 className="text-lg font-bold text-gray-800">Review Jurnal</h1>
                <p className="text-xs text-gray-500">ID: {id}</p>
            </div>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={handleRejectClick} 
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium text-sm flex items-center gap-2 transition-colors border border-red-200"
            >
                <XCircle size={16} /> Tolak
            </button>
            <button 
                onClick={handlePublishClick} 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-transform active:scale-95"
            >
                <CheckCircle size={16} /> Approve & Publish
            </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-73px)] overflow-hidden">
        
        {/* KIRI: PDF PREVIEW */}
        <div className="w-full md:w-1/2 bg-gray-800 h-full relative border-r border-gray-300">
            {data?.fileURL ? (
                <iframe 
                    src={data.fileURL} 
                    className="w-full h-full"
                    title="PDF Preview"
                />
            ) : (
                <div className="flex items-center justify-center h-full text-white">
                    <p>File tidak ditemukan.</p>
                </div>
            )}
            
            <a 
                href={data?.fileURL} 
                target="_blank" 
                rel="noreferrer"
                className="absolute bottom-6 right-6 bg-black/70 text-white px-4 py-2 rounded-full text-sm hover:bg-black flex items-center gap-2 backdrop-blur-sm"
            >
                <ExternalLink size={14} /> Buka Full PDF
            </a>
        </div>

        {/* KANAN: FORM DATA */}
        <div className="w-full md:w-1/2 bg-white h-full overflow-y-auto p-6 md:p-8">
            <div className="max-w-xl mx-auto space-y-6">
                
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="text-blue-600 mt-0.5" size={20} />
                    <div className="text-sm text-blue-800">
                        <p className="font-bold">Mode Edit Admin</p>
                        <p>Anda bisa memperbaiki Typo data mahasiswa sebelum dipublikasikan.</p>
                    </div>
                </div>

                {/* Form Inputs */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Judul Jurnal</label>
                        <input type="text" value={formData.judul} onChange={(e) => setFormData({...formData, judul: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Nama Mahasiswa</label>
                            <input type="text" value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">NIM</label>
                            <input type="text" value={formData.nim} onChange={(e) => setFormData({...formData, nim: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Tahun Terbit</label>
                            <input type="number" value={formData.tahun} onChange={(e) => setFormData({...formData, tahun: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Kategori</label>
                            <select value={formData.kategori} onChange={(e) => setFormData({...formData, kategori: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                <option>Skripsi</option>
                                <option>Kerja Praktik</option>
                                <option>Tugas Akhir</option>
                                <option>Jurnal Penelitian</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Abstrak</label>
                        <textarea rows={6} value={formData.abstrak} onChange={(e) => setFormData({...formData, abstrak: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm leading-relaxed" />
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button 
                        onClick={handleSaveClick} 
                        className="flex items-center gap-2 px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                    >
                        <Save size={18} /> Simpan Perubahan
                    </button>
                </div>

            </div>
        </div>
      </div>

      {/* --- KOMPONEN ALERT DINAMIS --- */}
      <CustomAlert
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={alertConfig.onConfirm}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        loading={alertConfig.isLoading}
        isSingleButton={alertConfig.isSingleButton}
      />

    </div>
  );
}