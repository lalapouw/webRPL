import { connectDB } from "@/lib/db";

export async function GET(_, { params }) {
  const db = await connectDB();
  const [rows] = await db.execute("SELECT * FROM products WHERE id = ?", [params.id]);
  return Response.json(rows[0]);
}

export async function PUT(req, { params }) {
  const body = await req.json();
  const { name, description, price, stock, image } = body;

  const db = await connectDB();
  await db.execute(
    "UPDATE products SET name=?, description=?, price=?, stock=?, image=? WHERE id=?",
    [name, description, price, stock, image, params.id]
  );

  return Response.json({ message: "Produk diupdate" });
}

export async function DELETE(_, { params }) {
  const db = await connectDB();
  await db.execute("DELETE FROM products WHERE id = ?", [params.id]);

  return Response.json({ message: "Produk dihapus" });
}
