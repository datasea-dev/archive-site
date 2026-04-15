import { NextResponse } from "next/server";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; 
import { CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2Client } from "@/lib/r2"; 

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      throw new Error("ID Jurnal tidak ditemukan.");
    }

    // 1. Ambil data jurnal saat ini dari Firestore
    const docRef = doc(db, "submissions", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("Data pengajuan tidak ditemukan di database.");
    }
    
    const data = docSnap.data();
    const oldKey = data.fileKey; 

    // Validasi apakah file masih di folder temporary
    if (!oldKey || !oldKey.startsWith("temp-review/")) {
      throw new Error("File tidak valid atau sudah pernah dipublikasikan.");
    }

    // 2. Siapkan path baru untuk folder Arsip Publik
    // Contoh: temp-review/123-jurnal.pdf -> arsip-publik/123-jurnal.pdf
    const fileName = oldKey.replace("temp-review/", ""); 
    const newKey = `arsip-publik/${fileName}`;

    // 3. Pindahkan file di Cloudflare R2 (Proses Copy lalu Delete)
    // A. Gandakan file ke folder arsip-publik
    await r2Client.send(new CopyObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      // Syarat AWS SDK: CopySource formatnya harus "nama-bucket/path-file"
      CopySource: encodeURI(`${process.env.R2_BUCKET_NAME}/${oldKey}`), 
      Key: newKey,
    }));

    // B. Hapus file lama di folder temp-review agar hemat kuota
    await r2Client.send(new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: oldKey,
    }));

    // 4. Update data di Firestore
    const publicBaseUrl = "https://archive.datasea.my.id/api/view?key="; // URL API Viewer
    
    await updateDoc(docRef, {
      status: "PUBLISHED",      // Ubah status agar hilang dari antrean admin
      fileKey: newKey,          // Update lokasi file terbaru
      fileURL: `${publicBaseUrl}${newKey}` // Update link untuk diakses publik
    });

    return NextResponse.json({ 
      success: true, 
      message: "Jurnal berhasil dipindahkan dan dipublikasikan!" 
    });

  } catch (error: any) {
    console.error("Gagal Publish R2:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || "Terjadi kesalahan pada server." 
    }, { status: 500 });
  }
}