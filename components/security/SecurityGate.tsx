"use client";

import { useState, useEffect } from "react";
import Turnstile from "react-turnstile";
import { Lock, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";

export default function SecurityGate({ children }: { children: React.ReactNode }) {
  const [isVerified, setIsVerified] = useState(false);
  const [checking, setChecking] = useState(true);
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");

  // Waktu kadaluarsa sesi keamanan: 15 Menit
  const GATE_TIMEOUT = 15 * 60 * 1000; 

  useEffect(() => {
    const lastVerified = localStorage.getItem("ds_gate_verified_at");
    const currentTime = Date.now();

    if (lastVerified && currentTime - parseInt(lastVerified) < GATE_TIMEOUT) {
      setIsVerified(true);
      setChecking(false);
    } else {
      setIsVerified(false);
      setChecking(false);
    }
  }, []);

  const handleTurnstileSuccess = async (token: string) => {
    try {
      const res = await fetch("/api/verify-gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setTimeout(() => {
          localStorage.setItem("ds_gate_verified_at", Date.now().toString());
          setIsVerified(true);
        }, 1000);
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Gagal verifikasi:", error);
      setStatus("error");
    }
  };

  if (isVerified) return <>{children}</>;
  if (checking) return null;

  return (
    <>
      {/* Konten website di latar belakang (terkunci) */}
      <div className="pointer-events-none select-none overflow-hidden h-screen w-screen fixed inset-0 z-0">
        {children}
      </div>

      <div className="fixed inset-0 z-[999999] flex items-center justify-center overflow-hidden px-4">
        {/* Background Overlay: Agak gelap sedikit agar modal putihnya menonjol */}
        <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-700"></div>

        {/* Modal Verifikasi (Tema Terang) */}
        <div className="relative z-10 w-full max-w-md text-center animate-in zoom-in-95 duration-500">
          <div className="bg-white/95 border border-white rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-blue-900/10 backdrop-blur-xl">
            
            {/* Icon Section */}
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className={`absolute inset-0 rounded-full blur-xl transition-all duration-1000 ${status === 'success' ? 'bg-green-400/40' : 'bg-blue-400/40 animate-pulse'}`}></div>
              <div className="relative w-full h-full bg-white border border-gray-100 shadow-sm rounded-2xl flex items-center justify-center">
                {status === "success" ? (
                  <CheckCircle2 className="text-green-500 w-10 h-10 animate-in zoom-in duration-300" />
                ) : (
                  <Lock className="text-blue-600 w-9 h-9" />
                )}
              </div>
            </div>

            {/* Text Section */}
            <h2 className="text-gray-900 text-xl font-extrabold mb-2 tracking-tight">
              Keamanan Jaringan
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Harap tunggu, sistem sedang memeriksa integritas koneksi Anda sebelum masuk ke repositori Datasea.
            </p>

            {/* Status Bar / Turnstile Area */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-col items-center gap-4 transition-all">
              {status === "verifying" && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Loader2 className="animate-spin w-5 h-5 text-blue-600" />
                  <span className="text-sm font-semibold">Memverifikasi koneksi...</span>
                </div>
              )}
              
              {status === "success" && (
                <div className="flex items-center gap-2 text-green-600 animate-in fade-in">
                  <ShieldCheck size={20} />
                  <span className="text-sm font-bold uppercase tracking-wider">Koneksi Aman</span>
                </div>
              )}

              {/* Widget Turnstile (Tema Diubah Menjadi Light) */}
              <div className={status === "success" ? "hidden" : "block"}>
                <Turnstile
                  sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                  onVerify={handleTurnstileSuccess}
                  appearance="always"
                  theme="light" // <-- Ini yang paling penting, diubah ke light
                />
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 opacity-60">
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">Cloudflare Verified Network</span>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
}