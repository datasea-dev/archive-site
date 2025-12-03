import { NextResponse } from 'next/server';
import { getPeralatanFiles } from '@/lib/googleDrive';
export const dynamic = 'force-dynamic'; 
export async function GET() {
  const data = await getPeralatanFiles();
  return NextResponse.json({ success: true, data });
}