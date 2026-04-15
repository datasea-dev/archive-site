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

    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', 'inline'); 
    headers.set('Cache-Control', 'public, max-age=31536000, immutable'); 

    return new NextResponse(fileBuffer, { headers });

  } catch (error) {
    console.error("Gagal mengambil file PDF:", error);
    return NextResponse.json({ error: 'Gagal memuat PDF dari server' }, { status: 500 });
  }
}