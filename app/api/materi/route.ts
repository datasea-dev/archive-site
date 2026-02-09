import { NextResponse } from 'next/server';
import { getMateriFiles } from '@/lib/googleDrive'; 

export const dynamic = 'force-dynamic'; 

export async function GET() {
  try {
    const data = await getMateriFiles();

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal mengambil data' }, 
      { status: 500 }
    );
  }
}