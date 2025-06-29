import { NextResponse } from "next/server";
import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";
import { createConnection } from "@/lib/db";

export const config = {
  api: {
    bodyParser: false, // ⛔️ penting: jangan parse body
  },
};

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", chunk => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", err => reject(err));
  });
}

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get("image");
  const name = formData.get("name");
  const stock = formData.get("stock");
  const price = formData.get("price");

  if (!file || typeof file === "string") {
    return NextResponse.json({ message: "File tidak valid" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const filename = `${Date.now()}-${file.name}`;
  const filepath = path.join(uploadDir, filename);

  // pastikan folder ada
  fs.mkdirSync(uploadDir, { recursive: true });
  fs.writeFileSync(filepath, buffer);

  const imagePath = `/uploads/${filename}`;

  // Simpan ke DB
  const db = await createConnection();
  await db.execute(
    "INSERT INTO products (name, stock, price, image) VALUES (?, ?, ?, ?)",
    [name, stock, price, imagePath]
  );

  return NextResponse.json({ message: "Produk berhasil ditambahkan" });
}

export async function GET() {
  const db = await createConnection();
  const [rows] = await db.execute("SELECT * FROM products");
  return NextResponse.json(rows);
}
