import { NextRequest, NextResponse } from 'next/server';
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2Client } from "@/lib/r2";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key'); 

  if (!key) {
    return NextResponse.json({ error: 'Key (path file) tidak ditemukan' }, { status: 400 });
  }

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    });

    const response = await r2Client.send(command);

    if (!response.Body) {
      return NextResponse.json({ error: 'File tidak ada di dalam Bucket R2' }, { status: 404 });
    }

    const byteArray = await response.Body.transformToByteArray();
    const fileBuffer = Buffer.from(byteArray);

    // 1. DINAMIS: Ambil tipe konten asli dari Cloudflare R2 (jaga-jaga jika bukan PDF)
    const contentType = response.ContentType || 'application/pdf';

    // 2. NAMA FILE: Ambil nama file dari ujung Key agar rapi saat didownload/ditampilkan
    const fileName = key.split('/').pop() || 'jurnal-datasea.pdf';

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    
    // 3. INLINE: Memaksa browser/HP untuk "Membaca", bukan "Mendownload"
    headers.set('Content-Disposition', `inline; filename="${fileName}"`); 
    headers.set('Cache-Control', 'public, max-age=31536000, immutable'); 

    // 4. CORS: Mencegah error "Cross-Origin" saat diakses via Iframe atau Adobe SDK
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');

    return new NextResponse(fileBuffer, { headers });

  } catch (error) {
    console.error("Gagal mengambil file dari R2:", error);
    return NextResponse.json({ error: 'Gagal memuat file dari server' }, { status: 500 });
  }
}