import { NextResponse } from "next/server";
import { createConnection } from "@/lib/db"; // atau connectDB, sesuai yang kamu pakai

// GET: Ambil semua user
export async function GET() {
  const db = await createConnection();
  const [rows] = await db.execute("SELECT id, username, email, role FROM users");
  return NextResponse.json(rows);
}

// POST: Tambah user baru
export async function POST(req) {
  const { name, email, password, role } = await req.json();

  const db = await createConnection();
  await db.execute(
    "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
    [name, email, password, role || 'user']
  );

  return NextResponse.json({ message: "User berhasil ditambahkan" });
}
