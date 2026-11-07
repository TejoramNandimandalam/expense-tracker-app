import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

// GET /api/summary -> total and count per category + grand total (release 3)
export async function GET() {
  const result = await pool.query(
    "SELECT category, SUM(amount)::float AS total, COUNT(*)::int AS count FROM expenses GROUP BY category ORDER BY category"
  );
  const categories = result.rows;
  const total = Math.round(categories.reduce((s, r) => s + r.total, 0) * 100) / 100;
  return NextResponse.json({ total, categories });
}
