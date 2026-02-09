import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { PDFDocument, rgb, degrees } from "pdf-lib";
import { google } from "googleapis";
import { Readable } from "stream";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

// --- UPDATE: SETUP OAUTH 2.0 (INI KUNCI SUKSESNYA) ---
// Kita tidak pakai GoogleAuth lagi, tapi pakai OAuth2
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

// Masukkan Refresh Token agar server bisa login otomatis
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

// Inisialisasi Drive dengan Client OAuth yang baru
const drive = google.drive({ version: "v3", auth: oauth2Client });
const FOLDER_ID = process.env.GOOGLE_DRIVE_JURNAL_ID;

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) return NextResponse.json({ success: false, message: "ID Kosong" }, { status: 400 });

    // 1. AMBIL DATA DARI FIREBASE
    const docRef = doc(db, "submissions", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return NextResponse.json({ success: false, message: "Data 404" }, { status: 404 });
    const data = docSnap.data();

    if (!data.fileURL) throw new Error("URL File tidak ditemukan");
    
    // 2. DOWNLOAD PDF (Dari UploadThing)
    const cleanJudul = data.judul.replace(/[^a-zA-Z0-9 ]/g, "").substring(0, 50);
    const fileName = `${data.nama} - ${cleanJudul}.pdf`;

    const pdfBytes = await fetch(data.fileURL).then((res) => res.arrayBuffer());

    // 3. PROSES WATERMARK
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const { width, height } = pages[0].getSize();

    pages.forEach((page) => {
      page.drawText('Archived by DATASEA UTY', {
        x: 50, y: 30, size: 10,
        color: rgb(0.2, 0.2, 0.8), opacity: 0.6,
      });
      page.drawText('DATASEA ARCHIVE', {
        x: width / 2 - 150, y: height / 2, size: 35,
        color: rgb(0.5, 0.5, 0.5), opacity: 0.2,
        rotate: degrees(45),
      });
    });

    const modifiedPdfBytes = await pdfDoc.save();

    // 4. UPLOAD KE DRIVE (METODE BARU)
    const bufferStream = new Readable();
    bufferStream.push(Buffer.from(modifiedPdfBytes));
    bufferStream.push(null);

    const fileMetadata = {
      name: fileName,
      parents: [FOLDER_ID || ""],
    };

    const media = {
      mimeType: "application/pdf",
      body: bufferStream,
    };

    // Upload menggunakan 'drive' yang sudah di-auth pakai OAuth
    const driveResponse = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, webViewLink",
    });

    const driveLink = driveResponse.data.webViewLink;
    const driveFileId = driveResponse.data.id;

    // 5. BERSIH-BERSIH UPLOADTHING
    if (data.fileKey) {
        try {
            await utapi.deleteFiles(data.fileKey);
        } catch (e) {
            console.error("Cleanup warning:", e);
        }
    }

    // 6. UPDATE DATABASE
    await updateDoc(docRef, {
      status: "PUBLISHED",
      downloadLink: driveLink,
      driveFileId: driveFileId,
      originalFileDeleted: true,
      publishedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, driveLink });

  } catch (error: any) {
    console.error("Publish Error Detail:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}