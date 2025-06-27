import { NextResponse } from "next/server";
import { createConnection } from "@/lib/db"; // atau connectDB, sesuaikan
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ message: "Semua field wajib diisi" }, { status: 400 });
    }

    const db = await createConnection();

    // Cek apakah email sudah terdaftar
    const [existingUser] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return NextResponse.json({ message: "Email sudah digunakan" }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user ke database
    await db.execute(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
      [username, email, hashedPassword, "user"]
    );

    return NextResponse.json({ message: "Registrasi berhasil!" });

  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
