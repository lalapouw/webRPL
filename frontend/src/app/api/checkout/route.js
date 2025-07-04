import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "SECRET";

// POST /api/checkout — Finalisasi pesanan
export async function POST() {
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

  const db = pool;

  try {
    // 1. Cek apakah ada order pending
    const [orders] = await db.execute(
      `SELECT id FROM orders WHERE user_id = ? AND status = 'pending' ORDER BY id DESC LIMIT 1`,
      [userId]
    );

    if (orders.length === 0) {
      return NextResponse.json({ message: "Tidak ada order yang bisa diproses" }, { status: 404 });
    }

    const orderId = orders[0].id;

    // 2. Ambil item dari keranjang
    const [cartItems] = await db.execute(`
      SELECT product_id, quantity, p.price
      FROM cart_items c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [userId]);

    if (cartItems.length === 0) {
      return NextResponse.json({ message: "Keranjang kosong" }, { status: 400 });
    }

    // 3. Simpan ke order_items
    for (const item of cartItems) {
      await db.execute(`
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?)
      `, [orderId, item.product_id, item.quantity, item.price]);
    }

    // 4. Update order jadi 'paid'
    await db.execute(`
      UPDATE orders SET status = 'paid', updated_at = NOW() WHERE id = ?
    `, [orderId]);

    // 5. Kosongkan keranjang
    await db.execute(`DELETE FROM cart_items WHERE user_id = ?`, [userId]);

    return NextResponse.json({ message: "Checkout berhasil", orderId });
  } catch (err) {
    console.error("❌ Error saat checkout:", err);
    return NextResponse.json({ message: "Checkout gagal" }, { status: 500 });
  }
}
