import { NextResponse } from "next/server";
import { createConnection } from "@/lib/db";
import bcrypt from "bcryptjs";

// POST /api/auth/login
export async function POST(req) {
  const { email, password } = await req.json();

  const db = await createConnection();
  const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);

  if (rows.length === 0) {
    return NextResponse.json({ message: "Email tidak ditemukan" }, { status: 404 });
  }

  const user = rows[0];
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return NextResponse.json({ message: "Password salah" }, { status: 401 });
  }

  // TODO: Set session/cookie/token (jika pakai autentikasi lanjutan)

  return NextResponse.json({
    message: "Login berhasil",
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
}
