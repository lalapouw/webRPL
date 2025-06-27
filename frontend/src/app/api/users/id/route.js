import { NextResponse } from "next/server";
import { createConnection } from "@/lib/db";

// GET: Ambil user by id
export async function GET(_, { params }) {
  const db = await createConnection();
  const [rows] = await db.execute("SELECT id, username, email, role FROM users WHERE id = ?", [params.id]);
  return NextResponse.json(rows[0]);
}

// PUT: Update user
export async function PUT(req, { params }) {
  const { name, email, password, role } = await req.json();

  const db = await createConnection();
  await db.execute(
    "UPDATE users SET username = ?, email = ?, password = ?, role = ? WHERE id = ?",
    [name, email, password, role, params.id]
  );

  return NextResponse.json({ message: "User berhasil diupdate" });
}

// DELETE: Hapus user
export async function DELETE(_, { params }) {
  const db = await createConnection();
  await db.execute("DELETE FROM users WHERE id = ?", [params.id]);
  return NextResponse.json({ message: "User berhasil dihapus" });
}
