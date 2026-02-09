import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('id');

  if (!fileId) {
    return NextResponse.json({ error: 'File ID tidak ditemukan' }, { status: 400 });
  }

  try {
    // --- AUTH PAKAI .ENV (Sesuai dengan lib/googleDrive.ts) ---
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: privateKey
          ? privateKey.replace(/\\n/g, '\n').replace(/"/g, '') // Pembersih Super
          : undefined,
      },
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // Ambil Stream File dari Google
    const response = await drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    
    // @ts-ignore
    return new NextResponse(response.data, { headers });

  } catch (error) {
    console.error("Gagal Proxy PDF:", error);
    return NextResponse.json({ error: 'Gagal memuat file PDF' }, { status: 500 });
  }
}