import { NextResponse } from "next/server";
import { pool } from "@/lib/db"; // gunakan getConnection bukan pool langsung
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "SECRET";

// POST: Simpan data pembeli (sementara sebelum order final)
// POST: Simpan data pembeli (sementara sebelum order final)
export async function POST(req) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let userId;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    userId = decoded.userId;
  } catch {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ message: "Request body kosong atau bukan JSON" }, { status: 400 });
  }

  const { name, address, phone } = body || {};
  if (!name || !address || !phone) {
    return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
  }

  const db = pool;

  try {
    const [items] = await db.execute(`
      SELECT c.product_id, c.quantity, p.price
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [userId]);

    if (items.length === 0) {
      return NextResponse.json({ message: "Keranjang kosong" }, { status: 400 });
    }

    const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

    const [existing] = await db.execute(
      `SELECT id FROM orders WHERE user_id = ? AND status = 'pending' ORDER BY id DESC LIMIT 1`,
      [userId]
    );

    if (existing.length > 0) {
      const orderId = existing[0].id;
      await db.execute(`
        UPDATE orders
        SET name = ?, address = ?, phone = ?, total_amount = ?, updated_at = NOW()
        WHERE id = ?
      `, [name, address, phone, total, orderId]);

      return NextResponse.json({ message: "Data pembeli diperbarui", orderId });
    } else {
      const [result] = await db.execute(`
        INSERT INTO orders (user_id, name, address, phone, total_amount, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
      `, [userId, name, address, phone, total]);

      return NextResponse.json({ message: "Data pembeli disimpan", orderId: result.insertId });
    }
  } catch (err) {
    console.error("❌ Error simpan data pembeli:", err);
    return NextResponse.json({ message: "Gagal simpan data pembeli" }, { status: 500 });
  }
}

// GET: Ambil data pembeli (dari order pending terakhir)
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  let userId;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    userId = decoded.userId;
  } catch {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  const db = pool;

  try {
    const [rows] = await db.execute(
      `SELECT name, address, phone FROM orders WHERE user_id = ? AND status = 'pending' ORDER BY id DESC LIMIT 1`,
      [userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: "Belum ada data" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("❌ Gagal ambil data:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// PUT: Update data pembeli sementara
export async function PUT(req) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  let userId;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    userId = decoded.userId;
  } catch {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  const { name, address, phone } = await req.json();
  const db = pool;

  try {
    const [existing] = await db.execute(
      `SELECT id FROM orders WHERE user_id = ? AND status = 'pending'`,
      [userId]
    );

    if (existing.length === 0) {
      return NextResponse.json({ message: "Data belum ada" }, { status: 404 });
    }

    await db.execute(
      `UPDATE orders SET name = ?, address = ?, phone = ?, updated_at = NOW() WHERE user_id = ? AND status = 'pending'`,
      [name, address, phone, userId]
    );

    return NextResponse.json({ message: "Data pembeli berhasil diupdate" });
  } catch (err) {
    console.error("❌ Error update:", err);
    return NextResponse.json({ message: "Gagal update data" }, { status: 500 });
  }
}
