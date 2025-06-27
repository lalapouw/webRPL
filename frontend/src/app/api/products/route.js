import { createConnection } from "@/lib/db.js";
import { NextResponse } from "next/server";

export async function GET() {
  const db = await createConnection();
  const [products] = await db.execute("SELECT * FROM products");
  return Response.json(products);
}

export async function POST(req) {
  const body = await req.json();
  const { name, description, price, stock, image } = body;

  const db = await createConnection();
  await db.execute(
    "INSERT INTO products (name, description, price, stock, image) VALUES (?, ?, ?, ?, ?)",
    [name, description, price, stock, image]
  );

  return Response.json({ message: "Produk ditambahkan" });
}
