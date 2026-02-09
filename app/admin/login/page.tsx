"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Lock, User, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // --- 1. VALIDASI MANUAL ---
    if (!email || !password) {
        setError("Email dan Password wajib diisi!");
        setLoading(false);
        return;
    }

    try {
      // --- 2. KIRIM DATA KE FIREBASE ---
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;
      
      // === LOGIKA BARU: SIMPAN SESI LENGKAP ===
      // Kita WAJIB menyimpan 'email' agar Dashboard bisa menampilkan nama "Halo, [Nama]"
      const sessionData = {
        uid: user.uid,
        email: user.email, // <--- PENTING: Jangan lupa ini!
        accessToken: await user.getIdToken(),
        lastActivity: Date.now() // Untuk fitur auto-logout
      };
      
      // Simpan ke localStorage
      localStorage.setItem("adminSession", JSON.stringify(sessionData));
      // ============================================

      router.push("/admin/dashboard");
      
    } catch (err: any) {
      console.error("Login gagal:", err);
      
      // Error Handling yang rapi
      if (err.code === 'auth/invalid-email') {
        setError("Format email salah (pastikan pakai @ dan domain)."); 
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError("Email atau password salah.");
      } else if (err.code === 'auth/user-not-found') {
        setError("Akun tidak ditemukan.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Terlalu banyak percobaan. Tunggu sebentar.");
      } else {
        setError("Terjadi kesalahan sistem (" + err.code + ").");
      }
      
      setLoading(false);
    }
  };

  // Styling Dinamis untuk Input (Merah jika error)
  const inputClass = error 
    ? "w-full pl-10 pr-4 py-2.5 bg-red-50 border border-red-500 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 text-red-900 placeholder-red-300 outline-none transition-all text-sm"
    : "w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm";

  const iconClass = error ? "text-red-400" : "text-gray-400";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 relative overflow-hidden">
       {/* Background Grid Pattern */}
       <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_3rem]"></div>

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-gray-200 animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Portal</h1>
          <p className="text-sm text-gray-500">Masuk untuk mengelola arsip jurnal.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5" noValidate>
          
          {error && (
            <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg text-center font-bold border border-red-100 animate-pulse">
              {error}
            </div>
          )}

          {/* INPUT EMAIL */}
          <div>
            <label className={`block text-xs font-bold uppercase mb-1 ${error ? "text-red-500" : "text-gray-500"}`}>Email</label>
            <div className="relative">
              <User size={18} className={`absolute left-3 top-3 ${iconClass}`} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => {
                    setEmail(e.target.value);
                    if(error) setError("");
                }}
                className={inputClass}
                placeholder="admin@datasea.id"
              />
            </div>
          </div>

          {/* INPUT PASSWORD */}
          <div>
            <label className={`block text-xs font-bold uppercase mb-1 ${error ? "text-red-500" : "text-gray-500"}`}>Password</label>
            <div className="relative">
              <Lock size={18} className={`absolute left-3 top-3 ${iconClass}`} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => {
                    setPassword(e.target.value);
                    if(error) setError("");
                }}
                className={inputClass}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg 
              ${loading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30 hover:-translate-y-1"
              }`}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <>Masuk Dashboard <ArrowRight size={18} /></>}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400">© 2026 Datasea Archive System</p>
        </div>

      </div>
    </div>
  );
}