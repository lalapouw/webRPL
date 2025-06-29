import { createConnection } from "@/lib/db";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import formidable from "formidable";
import { Readable } from "stream";

export const config = {
  api: {
    bodyParser: false,
  },
};

// DELETE produk
export async function DELETE(request, { params }) {
  const db = await createConnection();
  const { id } = params;

  try {
    await db.execute("DELETE FROM products WHERE id = ?", [id]);
    return NextResponse.json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    console.error("Gagal menghapus produk:", error);
    return NextResponse.json({ message: "Gagal menghapus produk" }, { status: 500 });
  }
}

// UPDATE produk
export async function PUT(req, { params }) {
  const { id } = params;
  const contentType = req.headers.get("content-type");
  const contentLength = req.headers.get("content-length") || "0";

  const form = formidable({ multiples: false });

  const formData = await new Promise((resolve, reject) => {
    const stream = Readable.fromWeb(req.body);
    stream.headers = {
      "content-type": contentType,
      "content-length": contentLength,
    };

    form.parse(stream, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

  const { name, stock, price } = formData.fields;
  const imageFile = formData.files?.image;

  const cleanName = String(name);
  const cleanStock = parseInt(stock);
  const cleanPrice = parseInt(price);

  if (!cleanName || isNaN(cleanStock) || isNaN(cleanPrice)) {
    return NextResponse.json({ message: "Data tidak valid" }, { status: 400 });
  }

  let imagePath = null;

  if (imageFile && imageFile.originalFilename) {
    const fileExt = path.extname(imageFile.originalFilename);
    const filename = `${uuidv4()}${fileExt}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const filePath = path.join(uploadDir, filename);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    await writeFile(filePath, await fs.promises.readFile(imageFile.filepath));
    imagePath = `/uploads/${filename}`;
  }

  const db = await createConnection();

  try {
    if (imagePath) {
      await db.execute(
        "UPDATE products SET name = ?, stock = ?, price = ?, image = ? WHERE id = ?",
        [cleanName, cleanStock, cleanPrice, imagePath, id]
      );
    } else {
      await db.execute(
        "UPDATE products SET name = ?, stock = ?, price = ? WHERE id = ?",
        [cleanName, cleanStock, cleanPrice, id]
      );
    }

    return NextResponse.json({ message: "Produk berhasil diupdate" });
  } catch (error) {
    console.error("Gagal update produk:", error);
    return NextResponse.json({ message: "Gagal update produk" }, { status: 500 });
  }
}