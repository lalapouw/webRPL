import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  const [rows] = await pool.execute(`
    SELECT 
      o.id AS order_id,
      o.name,
      o.phone,
      o.address,
      o.total_amount,
      o.status,
      o.created_at,
      p.name AS product_name,
      oi.quantity,
      oi.price
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    ORDER BY o.created_at DESC
  `);

  return NextResponse.json(rows);
}
