import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { toCsv } from "@/lib/expenses";

// GET /api/export                 -> all expenses as a CSV file (release 4)
// GET /api/export?category=Food   -> only that category
export async function GET(request: Request) {
  const category = new URL(request.url).searchParams.get("category");
  const result = category
    ? await pool.query(
        "SELECT id, title, amount, category, date FROM expenses WHERE category = $1 ORDER BY date DESC, id DESC",
        [category]
      )
    : await pool.query("SELECT id, title, amount, category, date FROM expenses ORDER BY date DESC, id DESC");

  // Content-Disposition: attachment makes the browser download it as a file
  return new NextResponse(toCsv(result.rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="expenses.csv"',
    },
  });
}
