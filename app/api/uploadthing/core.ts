import { createUploadthing, type FileRouter } from "uploadthing/next";
 
const f = createUploadthing();
 
export const ourFileRouter = {
  // Rute upload khusus PDF Jurnal
  jurnalUploader: f({ 
      pdf: { maxFileSize: "64MB", maxFileCount: 1 } // Batas 64MB aman!
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload selesai:", file.url);
      // PENTING: Kita return Key-nya biar bisa disimpan di database (untuk dihapus nanti)
      return { fileUrl: file.url, fileKey: file.key };
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;