import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { pool } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export const config = {
  api: {
    bodyParser: false,
  },
};

// POST: Tambah produk baru
export async function POST(req) {
  const formData = await req.formData();
  const name = formData.get("name");
  const stock = formData.get("stock");
  const price = formData.get("price");
  const description = formData.get("description") || "";
  const brand = formData.get("brand") || "";
  const brand_slug = formData.get("brand_slug") || "";



  const imagePaths = [];
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  try {
    // Upload max 3 gambar
    for (let i = 0; i < 3; i++) {
      const file = formData.get(`image${i}`);
      if (file && typeof file !== "string") {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileExt = path.extname(file.name);
        const filename = `${uuidv4()}${fileExt}`;
        const filepath = path.join(uploadDir, filename);

        await fs.promises.writeFile(filepath, buffer);
        imagePaths.push(`/uploads/${filename}`);
      }
    }

    const imagesJson = JSON.stringify(imagePaths);

    await pool.execute(
      `INSERT INTO products (name, stock, price, description, images, brand, brand_slug) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, stock, price, description, JSON.stringify(imagePaths), brand, brand_slug]
    );

    return NextResponse.json({
      success: true,
      message: "Produk berhasil ditambahkan",
    });
  } catch (error) {
    console.error("Gagal menambahkan produk:", error);

    // Hapus gambar jika gagal insert
    imagePaths.forEach((img) => {
      const fullPath = path.join(process.cwd(), "public", img);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    });

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menambahkan produk",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// GET: Ambil semua produk
export async function GET() {
  try {
    const [rows] = await pool.execute("SELECT * FROM products");

    const products = rows.map((product) => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      description: product.description || "",
    }));

    return NextResponse.json(products);
  } catch (error) {
    console.error("Gagal mengambil produk:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil produk",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
