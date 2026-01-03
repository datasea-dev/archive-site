import { Metadata } from "next";
import MateriClient from "./MateriClient"; // Kita panggil file logic yang tadi

// --- INI METADATA YANG KAMU MAU ---
export const metadata: Metadata = {
  title: "Arsip Materi",
  description: "Jelajahi koleksi lengkap materi kuliah, slide dosen, dan rekaman per semester dan angkatan.",
};

// Halaman ini jadi Server Component (ringan & SEO friendly)
export default function MateriPage() {
  return <MateriClient />;
}