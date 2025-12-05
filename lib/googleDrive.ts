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
  semester: string; 
  category: string;
  subject: string;
  downloadLink: string;
  source: "Materi" | "Jurnal" | "Peralatan";
}

// --- FUNGSI SCANNER ---
async function scanDriveFolder(rootId: string, sourceLabel: "Materi" | "Jurnal" | "Peralatan") {
  if (!rootId) return [];
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) console.log(`🚧 [DEV] Scanning ${sourceLabel}...`);

  const scanRecursive = async (folderId: string, yearName: string, currentSubject: string, currentSemester: string): Promise<DriveFile[]> => {
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
          // --- LOGIKA DETEKSI BARU YANG LEBIH PINTAR ---
          let nextSemester = currentSemester;
          let nextSubject = currentSubject;

          const upperName = name.toUpperCase().trim();

          // Regex: Mendeteksi "Semester", "Sem", "Smt" (tanpa peduli spasi)
          const isSemesterKeyword = /(semester|smt|sem|ganjil|genap)/i.test(name);
          
          // Regex: Mendeteksi angka romawi (I, II, III...) atau angka (1, 2) KHUSUS di level Semester
          const isRomanOrNumber = /^([IVX]+|\d)$/i.test(name);

          // LEVEL 1: Kita berada di dalam Folder Tahun (currentSemester masih "Semua Semester")
          if (currentSemester === "Semua Semester") {
             // Jika nama folder mengandung "Semester" ATAU cuma angka/romawi (1, 2, I, II)
             // Maka kita anggap ini ADALAH folder Semester.
             if (isSemesterKeyword || isRomanOrNumber) {
                nextSemester = name; 
                if (isDev) console.log(`   📂 Semester Detected: ${name}`);
             } 
             // Jika folder khusus UTS/UAS, jangan jadikan subject
             else if (upperName.includes("UTS") || upperName.includes("UAS")) {
                // Pass
             }
             // Sisanya dianggap Nama Mata Kuliah
             else {
                nextSubject = name;
             }
          } 
          // LEVEL 2: Kita sudah di dalam Semester
          else {
             if (!upperName.includes("UTS") && !upperName.includes("UAS")) {
                nextSubject = name; // Ini pasti Matkul
             }
          }

          return await scanRecursive(item.id, yearName, nextSubject, nextSemester);
        } else {
          // FILE FOUND
          let category = "Umum";
          if (sourceLabel === "Materi") category = "Mata Kuliah"; 
          if (name.toUpperCase().includes("UTS")) category = "UTS";
          if (name.toUpperCase().includes("UAS")) category = "UAS";
          
          return [{
            id: item.id || "",
            title: name,
            type: determineFileType(item.mimeType),
            date: formatDate(item.createdTime),
            year: yearName,
            semester: currentSemester,
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
    const years = await getFoldersInFolder(rootId);
    const promises = years.map(async (yearFolder) => {
      // Masuk ke folder tahun, set default semester ke "Semua Semester"
      return await scanRecursive(yearFolder.id || "", yearFolder.name || "Umum", "Umum", "Semua Semester");
    });
    const results = await Promise.all(promises);
    return results.flat();
  } catch (e) { return []; }
}

const CACHE_TIME = process.env.NODE_ENV === 'development' ? 1 : 86400;

export const getMateriFiles = unstable_cache(
  async () => scanDriveFolder(process.env.GOOGLE_DRIVE_MATERI_ID || "", "Materi"),
  ['cache-materi'], { revalidate: CACHE_TIME, tags: ['materi'] }
);
export const getJurnalFiles = unstable_cache(
  async () => scanDriveFolder(process.env.GOOGLE_DRIVE_JURNAL_ID || "", "Jurnal"),
  ['cache-jurnal'], { revalidate: CACHE_TIME, tags: ['jurnal'] }
);
export const getPeralatanFiles = unstable_cache(
  async () => scanDriveFolder(process.env.GOOGLE_DRIVE_PERALATAN_ID || "", "Peralatan"),
  ['cache-peralatan'], { revalidate: CACHE_TIME, tags: ['peralatan'] }
);

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