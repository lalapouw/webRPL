import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;

// POST: Tambah atau update data pembeli
export async function POST(req) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const decoded = jwt.verify(token, JWT_SECRET);
  const userId = decoded.userId;
  const { name, address, phone } = await req.json();

  try {
    const [existing] = await pool.execute(
      "SELECT id FROM orders WHERE user_id = ?",
      [userId]
    );

    if (existing.length > 0) {
      await pool.execute(
        `UPDATE orders SET name = ?, address = ?, phone = ?, updated_at = NOW() WHERE user_id = ?`,
        [name, address, phone, userId]
      );
    } else {
      await pool.execute(
        `INSERT INTO orders (user_id, name, address, phone, total_amount, status, created_at)
         VALUES (?, ?, ?, ?, 0.00, 'pending', NOW())`,
        [userId, name, address, phone]
      );
    }

    return NextResponse.json({ message: "Data pembeli berhasil disimpan" });
  } catch (err) {
    console.error("❌ Gagal simpan:", err);
    return NextResponse.json({ message: "Gagal simpan data" }, { status: 500 });
  }
}

// GET: Ambil data pembeli terakhir
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const [rows] = await pool.execute(
      `SELECT name, address, phone FROM orders WHERE user_id = ? ORDER BY id DESC LIMIT 1`,
      [userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Belum ada data' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('❌ Gagal ambil data order:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update data pembeli
export async function PUT(req) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const decoded = jwt.verify(token, JWT_SECRET);
  const userId = decoded.userId;
  const { name, address, phone } = await req.json();

  try {
    const [existing] = await pool.execute(
      'SELECT id FROM orders WHERE user_id = ?',
      [userId]
    );

    if (existing.length === 0) {
      return NextResponse.json({ message: 'Data tidak ditemukan' }, { status: 404 });
    }

    await pool.execute(
      `UPDATE orders SET name = ?, address = ?, phone = ? WHERE user_id = ?`,
      [name, address, phone, userId]
    );

    return NextResponse.json({ message: 'Berhasil diupdate' });
  } catch (err) {
    console.error('❌ Gagal update order:', err);
    return NextResponse.json({ message: 'Gagal update data' }, { status: 500 });
  }
}
