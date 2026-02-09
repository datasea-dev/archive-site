"use client";

import { useState } from "react";
import { db } from "@/lib/firebase"; // Hapus 'storage' karena tidak dipakai di sini
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Upload, CheckCircle, AlertCircle, FileText, Loader2, ArrowLeft, ShieldCheck, X } from "lucide-react";
import Link from "next/link";

// --- IMPORT UPLOADTHING ---
import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";

export default function UploadPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  // State Form Data
  const [formData, setFormData] = useState({
    nama: "",
    nim: "",
    email: "",
    judul: "",
    abstrak: "",
  });

  // State File dari UploadThing (URL & Key)
  const [uploadedFile, setUploadedFile] = useState<{url: string, key: string, name: string} | null>(null);

  // Handle Perubahan Input Teks
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Submit ke Firebase (Hanya Data Teks & Link)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi: Pastikan file sudah diupload ke UploadThing
    if (!uploadedFile) {
      setError("Silakan upload file PDF jurnal terlebih dahulu!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Simpan Data ke Firestore
      await addDoc(collection(db, "submissions"), {
        nama: formData.nama,
        nim: formData.nim,
        email: formData.email,
        judul: formData.judul,
        abstrak: formData.abstrak,
        
        // DATA DARI UPLOADTHING
        fileURL: uploadedFile.url,   
        fileKey: uploadedFile.key, // PENTING: Disimpan untuk fitur hapus otomatis nanti
        fileName: uploadedFile.name,
        storageProvider: "uploadthing", // Penanda sistem
        
        status: "PENDING_CHECK",  
        createdAt: serverTimestamp(),
      });

      // Sukses!
      setSuccess(true);
      setFormData({ nama: "", nim: "", email: "", judul: "", abstrak: "" });
      setUploadedFile(null); // Reset file

    } catch (err: any) {
      console.error("Error submit:", err);
      setError("Terjadi kesalahan saat menyimpan data. Cek koneksi internet.");
    } finally {
      setLoading(false);
    }
  };

  // --- TAMPILAN SUKSES ---
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
        {/* Background Grid */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_3rem]"></div>
        
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-4 border border-green-100 animate-in zoom-in duration-300">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Berhasil Terkirim!</h2>
          <p className="text-gray-600 leading-relaxed">
            Jurnal kamu sudah masuk ke antrian sistem. Admin akan melakukan validasi biodata & konten sebelum dipublikasikan.
          </p>
          {formData.email && (
             <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700 mt-2">
                Pantau email <b>{formData.email}</b> untuk notifikasi.
             </div>
          )}
          <div className="flex flex-col gap-3 mt-6">
            <button 
              onClick={() => setSuccess(false)}
              className="w-full px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
            >
              Upload Jurnal Lain
            </button>
            <Link href="/" className="text-blue-600 hover:underline text-sm font-medium">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- TAMPILAN FORM ---
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden pt-24 md:pt-32">
      
      {/* Background Grid */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_3rem] md:bg-[size:6rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_50%_200px,#d5c5ff00,transparent)]"></div>
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        
        <Link href="/" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors font-medium">
          <ArrowLeft size={18} className="mr-2" /> Kembali
        </Link>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header Form */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-10 md:px-10 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-white/10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 to-transparent opacity-30"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                 <Upload className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Upload Karya Ilmiah</h1>
              <p className="text-blue-100 text-sm md:text-base max-w-lg mx-auto">
                Berkontribusi untuk komunitas DATASEA. Dokumen akan divalidasi dan diberi watermark otomatis.
              </p>
            </div>
          </div>

          {/* Form Input */}
          <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-6 md:space-y-8">
            
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start text-sm border border-red-100">
                <AlertCircle size={18} className="mr-3 flex-shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Bagian Biodata */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <UserIcon /> 
                    <h3 className="text-lg font-bold text-gray-800">Identitas Penulis</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap</label>
                    <input 
                    type="text" name="nama" required
                    value={formData.nama} onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Contoh: Budi Santoso"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor Mahasiswa (NIM)</label>
                    <input 
                    type="text" name="nim" required
                    value={formData.nim} onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Contoh: 5200411xxx"
                    />
                </div>
                </div>

                <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Kampus / Aktif</label>
                <input 
                    type="email" name="email" required
                    value={formData.email} onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="email@student.uty.ac.id"
                />
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <ShieldCheck size={12} /> Email ini digunakan untuk mengirim status validasi.
                </p>
                </div>
            </div>

            {/* Bagian Dokumen */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <FileIcon />
                    <h3 className="text-lg font-bold text-gray-800">Dokumen Jurnal</h3>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Judul Jurnal / Karya</label>
                    <input 
                        type="text" name="judul" required
                        value={formData.judul} onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="Judul lengkap sesuai dokumen"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Abstrak (Singkat)</label>
                    <textarea 
                        name="abstrak" required rows={4}
                        value={formData.abstrak} onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                        placeholder="Salin abstrak dari jurnal Anda di sini..."
                    />
                </div>

                {/* File Upload Area (UPLOADTHING) */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">File PDF (Max 64MB)</label>
                    
                    {!uploadedFile ? (
                        // 1. TAMPILAN BELUM UPLOAD (Tombol UploadThing)
                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 bg-gray-50 hover:bg-white transition-all flex flex-col items-center justify-center">
                            <UploadButton<OurFileRouter, "jurnalUploader">
                                endpoint="jurnalUploader"
                                appearance={{
                                    button: "bg-blue-600 text-white font-bold py-2 px-6 rounded-lg w-full hover:bg-blue-700 transition-colors",
                                    allowedContent: "text-xs text-gray-500 mt-2"
                                }}
                                onClientUploadComplete={(res) => {
                                    if (res && res[0]) {
                                        setUploadedFile({ 
                                            url: res[0].url, 
                                            key: res[0].key, 
                                            name: res[0].name 
                                        });
                                        // Hapus error jika ada
                                        if(error) setError("");
                                    }
                                }}
                                onUploadError={(error: Error) => {
                                    alert(`Error Upload: ${error.message}`);
                                }}
                            />
                        </div>
                    ) : (
                        // 2. TAMPILAN SUDAH UPLOAD (Card File)
                        <div className="relative border-2 border-blue-500 bg-blue-50/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                            <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-3">
                                <FileText className="h-8 w-8 text-blue-600" />
                            </div>
                            <p className="text-base font-semibold text-gray-800 truncate max-w-[250px] mx-auto">
                                {uploadedFile.name}
                            </p>
                            <p className="text-xs text-green-600 font-bold mb-3 bg-green-100 px-2 py-1 rounded-full mt-1">
                                Upload Berhasil
                            </p>
                            
                            <button 
                                type="button" 
                                onClick={() => setUploadedFile(null)}
                                className="flex items-center gap-2 px-4 py-1.5 bg-white border border-red-200 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-50 transition-colors"
                            >
                                <X size={14} /> Ganti File
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
                <button
                type="submit"
                disabled={loading || !uploadedFile}
                className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-xl transition-all transform hover:-translate-y-1 ${
                    (loading || !uploadedFile)
                    ? "bg-gray-400 cursor-not-allowed shadow-none translate-y-0" 
                    : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-blue-500/30 active:scale-95"
                }`}
                >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" /> Sedang Mengirim...
                    </span>
                ) : (
                    "Kirim Jurnal Sekarang"
                )}
                </button>
                <p className="text-center text-xs text-gray-400 mt-4">
                    Dengan mengirim, Anda menyetujui karya ini untuk diarsipkan di database DATASEA UTY.
                </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

// Komponen Ikon
function UserIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}
function FileIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
}