import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { google } from "googleapis";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

// 1. SETUP OAUTH DRIVE (Sama seperti Publish)
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const drive = google.drive({ version: "v3", auth: oauth2Client });

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) return NextResponse.json({ success: false, message: "ID Kosong" }, { status: 400 });

    // 2. AMBIL DATA DULU (Untuk dapat ID File Drive)
    const docRef = doc(db, "submissions", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
       return NextResponse.json({ success: false, message: "Data tidak ditemukan" }, { status: 404 });
    }

    const data = docSnap.data();

    // 3. HAPUS FILE DI GOOGLE DRIVE (Jika ada)
    if (data.driveFileId) {
      try {
        await drive.files.delete({ fileId: data.driveFileId });
        console.log("File Drive terhapus:", data.driveFileId);
      } catch (err) {
        console.error("Gagal hapus file Drive (Mungkin sudah hilang):", err);
        // Kita lanjut saja, jangan error, biar data database tetap terhapus
      }
    }

    // 4. HAPUS FILE DI UPLOADTHING (Bersih-bersih file mentah)
    if (data.fileKey) {
        try {
            await utapi.deleteFiles(data.fileKey);
            console.log("File UploadThing terhapus");
        } catch (err) {
            console.error("Gagal hapus UploadThing:", err);
        }
    }

    // 5. TERAKHIR: HAPUS DOKUMEN FIREBASE
    await deleteDoc(docRef);

    return NextResponse.json({ success: true, message: "Data dan File berhasil dihapus total." });

  } catch (error: any) {
    console.error("Delete Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}