import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

// GET: Ambil user by id
export async function GET(_, { params }) {
  try {
    const [rows] = await pool.execute(
      "SELECT id, username, email, role FROM users WHERE id = ?",
      [params.id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("❌ Gagal mengambil user:", error);
    return NextResponse.json(
      { message: "Gagal mengambil user", error: error.message },
      { status: 500 }
    );
  }
}

// PUT: Update user
export async function PUT(req, { params }) {
  try {
    const { username, email, password, role } = await req.json();

    if (!username || !email || !password || !role) {
      return NextResponse.json(
        { message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    await pool.execute(
      "UPDATE users SET username = ?, email = ?, password = ?, role = ? WHERE id = ?",
      [username, email, password, role, params.id]
    );

    return NextResponse.json({ message: "User berhasil diupdate" });
  } catch (error) {
    console.error("❌ Gagal update user:", error);
    return NextResponse.json(
      { message: "Gagal update user", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Hapus user
export async function DELETE(_, { params }) {
  try {
    await pool.execute("DELETE FROM users WHERE id = ?", [params.id]);
    return NextResponse.json({ message: "User berhasil dihapus" });
  } catch (error) {
    console.error("❌ Gagal menghapus user:", error);
    return NextResponse.json(
      { message: "Gagal menghapus user", error: error.message },
      { status: 500 }
    );
  }
}
