import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

// GET: Ambil 1 produk berdasarkan ID
export async function GET(request, { params }) {
  try {
    const id = params.id;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ success: false, message: "Invalid product ID" }, { status: 400 });
    }

    const [rows] = await pool.execute("SELECT * FROM products WHERE id = ?", [id]);

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    const product = rows[0];
    let images = [];

    try {
      images = product.images ? JSON.parse(product.images) : [];
    } catch (e) {
      console.error("Error parsing images:", e);
    }

    return NextResponse.json({
      id: product.id,
      name: product.name || "",
      brand: product.brand || "",
      brand_slug: product.brand_slug || "",
      price: product.price || 0,
      stock: product.stock || 0,
      description: product.description || "",
      images,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    });
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// PUT: Update 1 produk
export async function PUT(request, { params }) {
  const { id } = params;

  try {
    const formData = await request.formData();
    const name = formData.get("name");
    const brand = formData.get("brand") || "";
    const brand_slug = formData.get("brand_slug") || "";
    const stock = formData.get("stock");
    const price = formData.get("price");
    const description = formData.get("description") || "";
    const existingImages = JSON.parse(formData.get("existingImages") || "[]");
    const deletedImages = JSON.parse(formData.get("deletedImages") || "[]");

    const newImages = [];
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Upload maksimal 3 gambar baru
    for (let i = 0; i < 3; i++) {
      const file = formData.get(`image${i}`);
      if (file && file.name) {
        const fileExt = path.extname(file.name);
        const filename = `${uuidv4()}${fileExt}`;
        const filePath = path.join(uploadDir, filename);

        const buffer = await file.arrayBuffer();
        await fs.promises.writeFile(filePath, Buffer.from(buffer));
        newImages.push(`/uploads/${filename}`);
      }
    }

    // Hapus gambar yang didelete
    for (const imgPath of deletedImages) {
      const fullPath = path.join(process.cwd(), "public", imgPath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    const updatedImages = existingImages
      .filter((img) => !deletedImages.includes(img))
      .concat(newImages);

    await pool.execute(
      "UPDATE products SET name = ?, stock = ?, price = ?, description = ?, brand = ?, brand_slug = ?, images = ? WHERE id = ?",
      [name, stock, price, description, brand, brand_slug, JSON.stringify(updatedImages), id]
    );


    const [updatedRows] = await pool.execute("SELECT * FROM products WHERE id = ?", [id]);

    return NextResponse.json({
      success: true,
      message: "Produk berhasil diupdate",
      product: {
        ...updatedRows[0],
        images: updatedRows[0].images ? JSON.parse(updatedRows[0].images) : [],
      },
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal update produk",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE: Hapus produk
export async function DELETE(request, { params }) {
  const { id } = params;

  try {
    const [result] = await pool.execute("SELECT images FROM products WHERE id = ?", [id]);

    if (result.length > 0) {
      const images = result[0].images ? JSON.parse(result[0].images) : [];
      for (const imagePath of images) {
        const fullPath = path.join(process.cwd(), "public", imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
    }

    await pool.execute("DELETE FROM products WHERE id = ?", [id]);

    return NextResponse.json({ success: true, message: "Produk berhasil dihapus" });
  } catch (error) {
    console.error("Gagal menghapus produk:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus produk",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
