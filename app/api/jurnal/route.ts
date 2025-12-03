import { NextResponse } from 'next/server';
import { getJurnalFiles } from '@/lib/googleDrive';
export const dynamic = 'force-dynamic'; 
export async function GET() {
  const data = await getJurnalFiles();
  return NextResponse.json({ success: true, data });
}