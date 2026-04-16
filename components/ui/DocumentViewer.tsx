"use client";

import { ExternalLink } from "lucide-react";

interface DocumentViewerProps {
  fileIdOrKey: string;
  type: "materi" | "jurnal";
  fileName: string;
}

export default function DocumentViewer({ fileIdOrKey, type, fileName }: DocumentViewerProps) {
  // 1. Tentukan URL dasar berdasarkan sumber
  const rawUrl = type === "materi" 
    ? `/api/pdf?id=${fileIdOrKey}` 
    : `/api/view?key=${encodeURIComponent(fileIdOrKey)}`;

  // 2. Deteksi otomatis format Office
  const isOffice = fileName.toLowerCase().match(/\.(docx|doc|pptx|ppt)$/);
  
  // 3. Tentukan URL untuk Iframe
  const viewerUrl = isOffice 
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(window.location.origin + rawUrl)}&embedded=true`
    : rawUrl;

  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Container Iframe Utama */}
      <iframe 
        src={viewerUrl} 
        className="w-full h-full flex-1 border-none"
        title={fileName}
      />
      
      {/* Footer Bantuan (Selalu tampil di bawah dokumen) */}
      <div className="p-3 bg-gray-50 border-t flex justify-between items-center px-4 md:px-6 shrink-0">
        <span className="text-[10px] md:text-xs text-gray-500 font-medium truncate max-w-[150px] md:max-w-[300px]">
          {fileName}
        </span>
        <a 
          href={rawUrl} 
          target="_blank" 
          rel="noreferrer"
          className="text-[10px] md:text-xs font-bold text-blue-600 flex items-center gap-1 hover:text-blue-800 transition-colors"
        >
          <ExternalLink size={14} /> Buka Tab Baru
        </a>
      </div>
    </div>
  );
}