import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2Client } from "@/lib/r2"; 

// 1. UBAH KE POST AGAR COCOK DENGAN FRONTEND
export async function POST(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      // 2. SESUAIKAN FORMAT ERROR (Pakai success: false dan message)
      return NextResponse.json({ success: false, message: "ID Jurnal tidak ditemukan" }, { status: 400 });
    }

    // 3. Ambil data dari Firestore untuk mendapatkan fileKey
    const docRef = doc(db, "submissions", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ success: false, message: "Data tidak ditemukan" }, { status: 404 });
    }

    const data = docSnap.data();
    const fileKey = data.fileKey;

    // 4. Hapus file dari Cloudflare R2 
    if (fileKey) {
      try {
        await r2Client.send(new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: fileKey,
        }));
        console.log(`File ${fileKey} berhasil dihapus dari R2`);
      } catch (r2Error) {
        console.error("Gagal menghapus file di R2:", r2Error);
      }
    }

    await deleteDoc(docRef);

    return NextResponse.json({ success: true, message: "Jurnal dan file berhasil dihapus!" });

  } catch (error: any) {
    console.error("Error Delete Process:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}