import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'SECRET';

// GET: Ambil semua item keranjang
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  let userId;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    userId = decoded.userId;
  } catch (err) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  const [rows] = await pool.execute(
    `SELECT c.id AS cart_id, c.quantity, c.product_id, p.* 
     FROM cart_items c 
     JOIN products p ON p.id = c.product_id 
     WHERE c.user_id = ?`,
    [userId]
  );

  const cartItems = rows.map(item => ({
    ...item,
    images: item.images ? JSON.parse(item.images) : [],
  }));

  return NextResponse.json(cartItems);
}

// POST: Tambah item ke keranjang
export async function POST(req) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  let userId;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    userId = decoded.userId;
  } catch (err) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  const { productId, quantity } = await req.json();

  if (typeof productId !== 'number' || typeof quantity !== 'number') {
    return NextResponse.json({ message: 'Data tidak valid' }, { status: 400 });
  }

  if (quantity < 1) {
    return NextResponse.json({ message: 'Jumlah harus minimal 1' }, { status: 400 });
  }

  await pool.execute(
    'INSERT INTO cart_items (user_id, product_id, quantity, created_at) VALUES (?, ?, ?, NOW())',
    [userId, productId, quantity]
  );

  return NextResponse.json({ message: 'Berhasil ditambahkan ke keranjang' });
}

// PUT: Update jumlah item keranjang
export async function PUT(req) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  let userId;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    userId = decoded.userId;
  } catch (err) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  const { productId, quantity } = await req.json();

  if (!productId || !quantity) {
    return NextResponse.json({ message: 'Data tidak lengkap' }, { status: 400 });
  }

  const [products] = await pool.execute(
    'SELECT stock FROM products WHERE id = ?',
    [productId]
  );

  if (products.length === 0) {
    return NextResponse.json({ message: 'Produk tidak ditemukan' }, { status: 404 });
  }

  const stock = products[0].stock;
  if (quantity > stock) {
    return NextResponse.json({ message: 'Jumlah melebihi stok' }, { status: 400 });
  }

  await pool.execute(
    `INSERT INTO cart_items (user_id, product_id, quantity, created_at)
     VALUES (?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE quantity = ?`,
    [userId, productId, quantity, quantity]
  );

  return NextResponse.json({ success: true });
}

// DELETE: Hapus item dari keranjang
export async function DELETE(req) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let userId;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    userId = decoded.userId;
  } catch (err) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const { productId } = await req.json();

  if (!productId) {
    return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
  }

  await pool.execute(
    'DELETE FROM cart_items WHERE product_id = ? AND user_id = ?',
    [productId, userId]
  );

  return NextResponse.json({ success: true });
}
