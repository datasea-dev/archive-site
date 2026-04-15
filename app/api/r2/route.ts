import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client } from "@/lib/r2";

export async function POST(request: Request) {
  try {
    const { fileName, fileType } = await request.json();

    // Tentukan lokasi folder di R2: temp-review/
    // Kita tambahkan timestamp agar nama file tidak bentrok
    const key = `temp-review/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
    });

    // Buat URL sakti yang berlaku selama 60 detik saja
    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 60 });

    return NextResponse.json({ 
      success: true, 
      uploadUrl: signedUrl,
      fileKey: key 
    });
  } catch (error) {
    console.error("R2 Error:", error);
    return NextResponse.json({ success: false, error: "Gagal membuat akses upload" }, { status: 500 });
  }
}