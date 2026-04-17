"use client";

import { useState, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Upload, CheckCircle, AlertCircle, FileText, Loader2, ArrowLeft, ShieldCheck, X, FileUp, CheckCircle2 } from "lucide-react";
import Link from "next/link";
// 1. IMPORT TURNSTILE
import Turnstile from "react-turnstile";

export default function UploadPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- STATE CAPTCHA ---
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaStatus, setCaptchaStatus] = useState<"waiting" | "verifying" | "success" | "error">("waiting");
  
  // --- STATE INTERAKSI (Lazy Load Trigger) ---
  const [isFormInteracted, setIsFormInteracted] = useState(false);

  // State Form Data
  const [formData, setFormData] = useState({
    nama: "",
    nim: "",
    email: "",
    judul: "",
    abstrak: "",
  });

  // State File Mentah (untuk R2)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fungsi pembantu untuk mengaktifkan captcha
  const triggerInteraction = () => {
    if (!isFormInteracted) setIsFormInteracted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    triggerInteraction(); // Aktifkan captcha saat mengetik
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    triggerInteraction(); // Aktifkan captcha saat pilih file
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setError("Hanya file PDF yang diperbolehkan!");
        return;
      }
      if (file.size > 64 * 1024 * 1024) {
        setError("Ukuran file maksimal 64MB!");
        return;
      }
      setSelectedFile(file);
      setError("");
    }
  };

  // Handle Submit (Turnstile + R2 + Firestore)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setError("Silakan pilih file PDF jurnal terlebih dahulu!");
      return;
    }

    // 2. VALIDASI TOKEN CAPTCHA
    if (!captchaToken) {
      setError("Verifikasi keamanan belum selesai. Mohon tunggu sejenak.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 3. KIRIM TOKEN KE API UNTUK DIVALIDASI DI BACKEND
      const resSign = await fetch("/api/r2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          fileName: selectedFile.name, 
          fileType: selectedFile.type,
          captchaToken: captchaToken 
        }),
      });

      if (!resSign.ok) {
        const errData = await resSign.json();
        throw new Error(errData.error || "Gagal mendapatkan izin upload.");
      }
      
      const { uploadUrl, fileKey } = await resSign.json();

      // Upload ke R2
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: selectedFile,
        headers: { "Content-Type": selectedFile.type }
      });

      if (!uploadRes.ok) throw new Error("Gagal mengupload file ke storage.");

      const publicBaseUrl = "https://archive.datasea.my.id/api/view?key=";

      await addDoc(collection(db, "submissions"), {
        nama: formData.nama,
        nim: formData.nim,
        email: formData.email,
        judul: formData.judul,
        abstrak: formData.abstrak,
        fileKey: fileKey, 
        fileName: selectedFile.name,
        fileURL: `${publicBaseUrl}${fileKey}`, 
        storageProvider: "cloudflare_r2",
        status: "PENDING_CHECK",  
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setFormData({ nama: "", nim: "", email: "", judul: "", abstrak: "" });
      setSelectedFile(null);
      setCaptchaToken(null);
      setIsFormInteracted(false); 

    } catch (err: any) {
      console.error("Error submit:", err);
      setError(err.message || "Terjadi kesalahan saat mengirim data.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
        <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_3rem]"></div>
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-4 border border-green-100 animate-in zoom-in duration-300">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Berhasil Terkirim!</h2>
          <p className="text-gray-600 leading-relaxed">Jurnal kamu sudah masuk ke antrian sistem.</p>
          <div className="flex flex-col gap-3 mt-6">
            <button onClick={() => setSuccess(false)} className="w-full px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold">Upload Jurnal Lain</button>
            <Link href="/" className="text-blue-600 hover:underline text-sm font-medium">Kembali ke Beranda</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden pt-24 md:pt-32">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_3rem] md:bg-[size:6rem_4rem]"></div>

      <div className="max-w-3xl mx-auto relative z-10">
        <Link href="/" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors font-medium">
          <ArrowLeft size={18} className="mr-2" /> Kembali
        </Link>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-10 text-white text-center font-bold">
             <h1 className="text-2xl md:text-3xl">Upload Karya Ilmiah</h1>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start text-sm border border-red-100">
                <AlertCircle size={18} className="mr-3 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Form Inputs */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <UserIcon /> <h3 className="text-lg font-bold text-gray-800">Identitas Penulis</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input type="text" name="nama" required value={formData.nama} onChange={handleChange} placeholder="Nama Lengkap" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                    <input type="text" name="nim" required value={formData.nim} onChange={handleChange} placeholder="NIM" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="Email Institusi" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <FileIcon /> <h3 className="text-lg font-bold text-gray-800">Dokumen Jurnal</h3>
                </div>
                <input type="text" name="judul" required value={formData.judul} onChange={handleChange} placeholder="Judul Jurnal" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                <textarea name="abstrak" required rows={4} value={formData.abstrak} onChange={handleChange} placeholder="Abstrak Singkat" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none" />

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">File PDF (Max 64MB)</label>
                    <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
                    {!selectedFile ? (
                        <div onClick={() => { triggerInteraction(); fileInputRef.current?.click(); }} className="border-2 border-dashed border-gray-300 rounded-2xl p-8 bg-gray-50 hover:bg-blue-50 cursor-pointer flex flex-col items-center justify-center">
                            <FileUp className="h-10 w-10 text-gray-400 mb-2" />
                            <p className="text-gray-500">Klik untuk pilih file PDF</p>
                        </div>
                    ) : (
                        <div className="border-2 border-blue-500 bg-blue-50/50 rounded-2xl p-6 flex flex-col items-center">
                            <FileText className="h-12 w-12 text-blue-600 mb-2" />
                            <p className="text-sm font-semibold truncate max-w-[280px]">{selectedFile.name}</p>
                            <button type="button" onClick={() => setSelectedFile(null)} className="mt-4 text-red-600 text-xs font-bold">Ganti File</button>
                        </div>
                    )}
                </div>
            </div>

            {/* --- 4. TURNSTILE CUSTOM UI --- */}
            {isFormInteracted && (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 transition-all animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-3">
                      {captchaStatus === "verifying" ? (
                          <Loader2 className="animate-spin text-blue-600" size={20} />
                      ) : captchaStatus === "success" ? (
                          <CheckCircle2 className="text-green-600" size={20} />
                      ) : (
                          <ShieldCheck className="text-gray-400" size={20} />
                      )}
                      <span className="text-sm font-medium text-gray-700">
                          {captchaStatus === "verifying" ? "Memverifikasi koneksi..." : 
                           captchaStatus === "success" ? "Keamanan Terverifikasi" : 
                           "Sistem Keamanan DATASEA Aktif"}
                      </span>
                  </div>

                  <Turnstile
                      sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                      onVerify={(token) => {
                          setCaptchaToken(token);
                          setCaptchaStatus("success");
                      }}
                      onExpire={() => {
                          setCaptchaStatus("error");
                          setCaptchaToken(null);
                      }}
                      onLoad={() => setCaptchaStatus("verifying")}
                      appearance="always"
                      theme="light"
                  />
              </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={loading || !selectedFile || !captchaToken}
                className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-xl transition-all ${
                    (loading || !selectedFile || !captchaToken) ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-95"
                }`}
            >
                {loading ? "Sedang Mengirim..." : "Kirim Jurnal Sekarang"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Komponen Ikon
function UserIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> }
function FileIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg> }