# 📂 DATASEA Archive (Private Repository)

Platform arsip digital terintegrasi untuk komunitas Sains Data UTY. Website ini dibangun untuk memusatkan materi perkuliahan, jurnal riset, dan peralatan pendukung (tools/dataset) yang bersumber langsung dari **Google Drive**.

## 🚀 Tech Stack

* **Framework:** [Next.js 14/15](https://nextjs.org/) (App Router)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Database/Storage:** Google Drive API (v3)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Deployment:** Netlify
* **Automation:** GitHub Actions (Cron Job)

---

## 🛠️ Cara Menjalankan di Lokal (Development)

1.  **Clone Repository** (jika belum):
    ```bash
    git clone [https://github.com/USERNAME/datasea-archive.git](https://github.com/USERNAME/datasea-archive.git)
    cd datasea-archive
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables:**
    Buat file `.env.local` di root folder. **JANGAN COMMIT FILE INI KE GITHUB!**
    Isi dengan kredensial berikut (Minta akses ke Admin Utama jika hilang):

    ```env
    # Service Account Google Cloud
    GOOGLE_CLIENT_EMAIL=nama-service-account@project-id.iam.gserviceaccount.com
    GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nIsi_Key_Panjang_Disini...\n-----END PRIVATE KEY-----\n"

    # ID Folder Google Drive
    GOOGLE_DRIVE_MATERI_ID=1xxxxxxxxxxxxxxxxxxxxxxx
    GOOGLE_DRIVE_JURNAL_ID=1xxxxxxxxxxxxxxxxxxxxxxx
    GOOGLE_DRIVE_PERALATAN_ID=1xxxxxxxxxxxxxxxxxxxxxxx
    ```

4.  **Jalankan Server:**
    ```bash
    npm run dev
    ```
    Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 🧠 Arsitektur & Logika Unik

Website ini menggunakan sistem **Smart Caching** untuk menghindari limit API Google Drive dan mempercepat loading.

### 1. Mode Update (Caching Strategy)
Logika ini diatur di file `lib/googleDrive.ts`:

* **Mode Development (Laptop):**
    * Cache time: **1 detik**.
    * Perubahan di Google Drive akan muncul hampir instan saat refresh.
    * Log Terminal: `🚧 [DEV - LAPTOP] Deep Scanning...`

* **Mode Production (Netlify):**
    * Cache time: **86400 detik (24 Jam)**.
    * Website **TIDAK AKAN** menghubungi Google Drive saat user berkunjung (Sangat Cepat & Aman).
    * Update data hanya terjadi saat proses *Build/Revalidate* otomatis.
    * Log Build: `🔄 [PROD - NETLIFY] Scheduled Deep Scan...`

### 2. Otomatisasi Update (Jam 03.00 WIB)
Agar data di website tetap *fresh* tanpa perlu deploy manual, sistem menggunakan **GitHub Actions**:

1.  File `.github/workflows/daily-update.yml` berjalan setiap jam **03.00 WIB**.
2.  Script tersebut mengirim perintah ("Trigger") ke **Netlify Build Hook**.
3.  Netlify melakukan *Rebuild* ulang website.
4.  Data baru dari Google Drive diambil dan disimpan sebagai Cache statis selama 24 jam ke depan.

---

## 📂 Struktur Folder Google Drive

Agar sistem otomatis mendeteksi kategori, folder di Google Drive **WAJIB** mengikuti struktur ini:

**Materi (`GOOGLE_DRIVE_MATERI_ID`):**
```text
ROOT
 ├── 2025 (Tahun Angkatan)
 │    ├── Data Mining (Nama Matkul)
 │    │    ├── Materi 1.pdf
 │    │    └── Slide.pptx
 │    ├── UTS
 │    │    └── Soal UTS Aljabar.pdf
 │    └── UAS
 │         └── Soal UAS Statistika.pdf
 ├── 2024
 └── ...