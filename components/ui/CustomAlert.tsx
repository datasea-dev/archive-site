"use client";

import { AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface CustomAlertProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: "danger" | "warning" | "success";
  loading?: boolean;
  isSingleButton?: boolean; // <--- INI YANG DITAMBAHKAN
}

export default function CustomAlert({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "warning",
  loading = false,
  isSingleButton = false, // <--- DEFAULTNYA FALSE
}: CustomAlertProps) {
  if (!isOpen) return null;

  // Variasi Warna
  const colors = {
    danger: {
      bg: "bg-red-50",
      text: "text-red-800",
      icon: "text-red-600",
      btn: "bg-red-600 hover:bg-red-700",
      border: "border-red-100",
    },
    warning: {
      bg: "bg-yellow-50",
      text: "text-yellow-800",
      icon: "text-yellow-600",
      btn: "bg-yellow-600 hover:bg-yellow-700",
      border: "border-yellow-100",
    },
    success: {
      bg: "bg-green-50",
      text: "text-green-800",
      icon: "text-green-600",
      btn: "bg-green-600 hover:bg-green-700",
      border: "border-green-100",
    },
  };

  const style = colors[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={!loading && !isSingleButton ? onClose : undefined}
      ></div>

      {/* Modal Box */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100 border border-gray-100">
        <div className="flex gap-4">
          
          {/* Icon */}
          <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${style.bg} ${style.icon}`}>
            {type === "danger" && <XCircle size={24} />}
            {type === "warning" && <AlertTriangle size={24} />}
            {type === "success" && <CheckCircle size={24} />}
          </div>

          {/* Text Content */}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {title}
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex justify-end gap-3">
          
          {/* TOMBOL BATAL (Hanya muncul jika BUKAN Single Button) */}
          {!isSingleButton && (
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none transition-colors disabled:opacity-50"
            >
              Batal
            </button>
          )}
          
          {/* TOMBOL UTAMA */}
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm focus:outline-none transition-colors flex items-center gap-2 disabled:opacity-70 ${style.btn}`}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Memproses...
              </>
            ) : (
              // Teks tombol berubah tergantung mode
              isSingleButton ? "Oke, Mengerti" : "Ya, Lanjutkan"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}