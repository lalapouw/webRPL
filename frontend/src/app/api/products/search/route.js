import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get('keyword');

  if (!keyword) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    const [rows] = await pool.execute(
      "SELECT * FROM products WHERE name LIKE ? OR description LIKE ?",
      [`%${keyword}%`, `%${keyword}%`]
    );

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
