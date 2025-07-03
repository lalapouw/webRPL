import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers"; // ✅

const JWT_SECRET = process.env.JWT_SECRET || "SECRET";

export async function POST(req) {
  const { email, password } = await req.json();

  const db = pool;
  const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);

  if (rows.length === 0) {
    return NextResponse.json({ message: "Email tidak ditemukan" }, { status: 404 });
  }

  const user = rows[0];
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return NextResponse.json({ message: "Password salah" }, { status: 401 });
  }

  // 🔐 Buat JWT token
  const token = jwt.sign(
    {
      userId: user.id, // 👈 harus "userId" biar konsisten dengan route profile
      email: user.email,
      username: user.username,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  // ✅ Simpan token ke cookie
const cookieStore = await cookies();
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return NextResponse.json({
    message: "Login berhasil",
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
}
