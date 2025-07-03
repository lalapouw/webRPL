import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "SECRET";

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;

  if (!token)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const db = pool;
    const [orders] = await db.execute(
      `SELECT id, total_amount, status, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    return NextResponse.json(orders);
  } catch (error) {
    console.error("❌ Error ambil orders:", error);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
