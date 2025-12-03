import { NextResponse } from 'next/server';
import { getMateriFiles } from '@/lib/googleDrive'; // <-- NAMA BARU

// Kita tidak perlu revalidate di sini lagi karena sudah dihandle oleh unstable_cache di lib
export const dynamic = 'force-dynamic'; 

export async function GET() {
  try {
    // Panggil fungsi dengan nama yang baru
    const data = await getMateriFiles();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal mengambil data' }, { status: 500 });
  }
}