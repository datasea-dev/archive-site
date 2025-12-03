import { google } from 'googleapis';
import { unstable_cache } from 'next/cache';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/drive.metadata.readonly'],
});

const drive = google.drive({ version: 'v3', auth });

export interface DriveFile {
  id: string;
  title: string;
  type: "PDF" | "Folder" | "Excel" | "Image" | "Link";
  date: string;
  year: string;
  category: string;
  subject: string;
  downloadLink: string;
  source: "Materi" | "Jurnal" | "Peralatan"; // Penanda asal file
}

// --- FUNGSI SCANNER GENERIK (Bisa dipakai untuk Materi, Jurnal, Tools) ---
async function scanDriveFolder(rootId: string, sourceLabel: "Materi" | "Jurnal" | "Peralatan") {
  if (!rootId) return [];
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) console.log(`🚧 [DEV] Scanning ${sourceLabel}...`);

  // Helper scan recursive
  const scanRecursive = async (folderId: string, yearName: string, currentSubject: string): Promise<DriveFile[]> => {
    let results: DriveFile[] = [];
    try {
      const items = await drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'files(id, name, mimeType, createdTime, webViewLink)',
        pageSize: 100,
      });
      const files = items.data.files || [];

      const promises = files.map(async (item) => {
        const name = item.name || "Tanpa Nama";
        const isFolder = item.mimeType === 'application/vnd.google-apps.folder';

        if (isFolder && item.id) {
          let nextSubject = name;
          // Logic khusus: Folder UTS/UAS/Semester tidak mengubah nama subject
          if (name.toUpperCase().includes("UTS") || name.toUpperCase().includes("UAS") || name.toUpperCase().includes("SEMESTER")) {
             nextSubject = currentSubject; 
          }
          return await scanRecursive(item.id, yearName, nextSubject);
        } else {
          // Logic Kategori
          let category = "Umum";
          if (sourceLabel === "Materi") category = "Mata Kuliah"; // Default materi
          if (name.toUpperCase().includes("UTS")) category = "UTS";
          if (name.toUpperCase().includes("UAS")) category = "UAS";
          
          return [{
            id: item.id || "",
            title: name,
            type: determineFileType(item.mimeType),
            date: formatDate(item.createdTime),
            year: yearName,
            category: category,
            subject: currentSubject,
            downloadLink: item.webViewLink || "#",
            source: sourceLabel
          } as DriveFile];
        }
      });

      const nested = await Promise.all(promises);
      results = nested.flat();
    } catch (e) { console.error(`Error scanning ${folderId}:`, e); }
    return results;
  };

  try {
    // Start scanning from Root
    const years = await getFoldersInFolder(rootId);
    const promises = years.map(async (yearFolder) => {
      return await scanRecursive(yearFolder.id || "", yearFolder.name || "Umum", "Umum");
    });
    const results = await Promise.all(promises);
    return results.flat();
  } catch (e) { return []; }
}

// --- CONFIG CACHE ---
const CACHE_TIME = process.env.NODE_ENV === 'development' ? 1 : 86400;

// 1. GET MATERI
export const getMateriFiles = unstable_cache(
  async () => scanDriveFolder(process.env.GOOGLE_DRIVE_MATERI_ID || "", "Materi"),
  ['cache-materi'], { revalidate: CACHE_TIME, tags: ['materi'] }
);

// 2. GET JURNAL
export const getJurnalFiles = unstable_cache(
  async () => scanDriveFolder(process.env.GOOGLE_DRIVE_JURNAL_ID || "", "Jurnal"),
  ['cache-jurnal'], { revalidate: CACHE_TIME, tags: ['jurnal'] }
);

// 3. GET PERALATAN
export const getPeralatanFiles = unstable_cache(
  async () => scanDriveFolder(process.env.GOOGLE_DRIVE_PERALATAN_ID || "", "Peralatan"),
  ['cache-peralatan'], { revalidate: CACHE_TIME, tags: ['peralatan'] }
);


// --- HELPER LAIN ---
async function getFoldersInFolder(parentId: string) {
  try {
    const res = await drive.files.list({
      q: `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name)',
      pageSize: 100,
    });
    return res.data.files || [];
  } catch (e) { return []; }
}

function determineFileType(mime?: string | null): any {
  if (!mime) return "Link";
  if (mime.includes("pdf")) return "PDF";
  if (mime.includes("sheet") || mime.includes("excel") || mime.includes("csv")) return "Excel";
  if (mime.includes("image")) return "Image";
  if (mime.includes("folder")) return "Folder";
  if (mime.includes("word") || mime.includes("document")) return "PDF"; 
  if (mime.includes("presentation") || mime.includes("powerpoint")) return "PDF"; 
  return "Link"; 
}

function formatDate(isoString?: string | null) {
  if (!isoString) return "-";
  return new Date(isoString).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}