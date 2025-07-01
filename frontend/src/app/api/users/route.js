import { NextResponse } from "next/server";
import { pool } from "@/lib/db"; // Sudah pakai pool untuk koneksi efisien

// GET: Ambil semua user
export async function GET() {
  try {
    const [rows] = await pool.execute(
      "SELECT id, username, email, role FROM users"
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("❌ Gagal ambil user:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data user", error: error.message },
      { status: 500 }
    );
  }
}

// POST: Tambah user baru
export async function POST(req) {
  try {
    const { username, email, password, role } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    await pool.execute(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
      [username, email, password, role || "user"]
    );

    return NextResponse.json({ message: "User berhasil ditambahkan" });
  } catch (error) {
    console.error("❌ Gagal tambah user:", error);
    return NextResponse.json(
      { message: "Gagal menambahkan user", error: error.message },
      { status: 500 }
    );
  }
}
