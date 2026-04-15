"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { Search, FileText, User, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link"; // Gunakan Link dari Next.js

interface Jurnal {
  id: string;
  judul: string;
  nama: string;
  abstrak: string;
  kategori?: string;
  tahun?: string;
}

export default function JurnalPage() {
  const [jurnals, setJurnals] = useState<Jurnal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchJurnals = async () => {
      try {
        const q = query(
          collection(db, "submissions"),
          where("status", "==", "PUBLISHED")
        );
        const querySnapshot = await getDocs(q);
        const data: Jurnal[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as Jurnal));
        setJurnals(data);
      } catch (error) {
        console.error("Gagal mengambil data jurnal:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJurnals();
  }, []);

  const filteredJurnals = jurnals.filter((jurnal) =>
    jurnal.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jurnal.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Arsip Jurnal & Riset</h1>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          Kumpulan publikasi ilmiah dan laporan riset. Sumber referensi terpercaya untuk pengembangan ilmu data.
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-between items-center max-w-5xl mx-auto">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari judul atau penulis..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link href="/jurnal/upload" className="px-6 py-3 rounded-xl text-white bg-blue-600 hover:bg-blue-700 md:w-auto w-full shadow-lg shadow-blue-500/30 transition-all font-medium">
            ☁️ Upload Jurnal Saya
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <div key={i} className="h-64 bg-gray-200 rounded-2xl animate-pulse"></div>)}
          </div>
        ) : filteredJurnals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJurnals.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 flex flex-col group">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{item.kategori || "Skripsi"}</span>
                  <span className="text-gray-400 text-xs flex items-center gap-1"><Calendar size={12} /> {item.tahun || new Date().getFullYear()}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">{item.judul}</h3>
                <div className="flex items-center gap-2 mb-4 text-gray-500 text-sm">
                  <User size={14} /> <span className="truncate">{item.nama}</span>
                </div>
                <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1">{item.abstrak}</p>
                
                {/* 🔴 INI YANG BERUBAH: Sekarang pakai tag <Link> untuk pindah halaman */}
                <div className="mt-auto pt-4 border-t border-gray-50">
                  <Link href={`/jurnal/${item.id}`} className="flex items-center justify-center w-full gap-2 px-4 py-2.5 bg-gray-50 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold text-sm transition-all group/btn">
                    Lihat Detail <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <FileText className="h-10 w-10 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Belum ada jurnal ditemukan</h3>
          </div>
        )}
      </div>
    </div>
  );
}