import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    // 1. Validasi keberadaan token
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token tidak ditemukan" },
        { status: 400 }
      );
    }

    // 2. Kirim permintaan verifikasi ke server Cloudflare
    // Kita menggunakan Secret Key yang tersimpan aman di environment variable
    const verifyRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${token}`,
      }
    );

    const verifyData = await verifyRes.json();

    // 3. Kembalikan hasil verifikasi ke frontend
    if (verifyData.success) {
      return NextResponse.json({ 
        success: true, 
        message: "Verifikasi integritas jaringan berhasil" 
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Validasi keamanan gagal" },
        { status: 403 }
      );
    }
  } catch (error) {
    console.error("Internal Server Error pada Verify Gate:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}