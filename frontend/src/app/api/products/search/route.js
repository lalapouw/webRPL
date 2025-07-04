import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get('keyword') || '';
  const brand = searchParams.get('brand') || '';

  let query = "SELECT * FROM products";
  const params = [];

  // Filter kondisi berdasarkan input
  const conditions = [];

  if (keyword) {
    conditions.push("(name LIKE ? OR description LIKE ?)");
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  if (brand) {
    conditions.push("brand = ?");
    params.push(brand);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  try {
    const [rows] = await pool.execute(query, params);

    const products = rows.map((p) => {
      let parsedImages = [];

      try {
        if (typeof p.images === 'string') {
          parsedImages = JSON.parse(p.images);
        } else if (Array.isArray(p.images)) {
          parsedImages = p.images;
        }
      } catch (e) {
        console.warn('Gagal parse images:', p.images);
      }

      return {
        id: p.id,
        name: p.name,
        price: p.price,
        stock: p.stock,
        description: p.description || '',
        brand: p.brand || '',
        images: parsedImages,
      };
    });

    return NextResponse.json(products);
  } catch (err) {
    console.error('❌ Error saat mencari produk:', err);
    return NextResponse.json(
      { message: 'Gagal mencari produk' },
      { status: 500 }
    );
  }
}
