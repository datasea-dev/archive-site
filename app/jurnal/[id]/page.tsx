import { Metadata } from "next";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import JurnalDetailClient from "./JurnalDetailClient";

// 1. FUNGSI GENERATE METADATA UNTUK GOOGLE SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const docRef = doc(db, "submissions", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        title: `${data.judul}`, // Otomatis ditambah "| DATASEA Archive" dari layout
        description: data.abstrak 
          ? `${data.abstrak.substring(0, 150)}...` 
          : `Baca jurnal karya ${data.nama} di Repositori DATASEA.`,
        openGraph: {
          title: data.judul,
          description: `Karya: ${data.nama} | Kategori: ${data.kategori || 'Skripsi'}`,
        }
      };
    }
  } catch (error) {
    console.error("Gagal load metadata:", error);
  }

  // Fallback jika jurnal tidak ditemukan
  return {
    title: "Jurnal Tidak Ditemukan",
    description: "Arsip jurnal tidak tersedia atau telah dihapus."
  };
}

// 2. FUNGSI RENDER HALAMAN UTAMA
export default async function JurnalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Panggil komponen UI client dan lempar ID-nya
  return <JurnalDetailClient id={id} />;
}