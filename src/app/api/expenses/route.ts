import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { validateExpense } from "@/lib/expenses";

// GET /api/expenses            -> all expenses, newest first
// GET /api/expenses?category=Food -> only that category (release 2)
export async function GET(request: Request) {
  const category = new URL(request.url).searchParams.get("category");
  const result = category
    ? await pool.query(
        "SELECT id, title, amount, category, date FROM expenses WHERE category = $1 ORDER BY date DESC, id DESC",
        [category]
      )
    : await pool.query(
        "SELECT id, title, amount, category, date FROM expenses ORDER BY date DESC, id DESC"
      );
  return NextResponse.json(result.rows);
}

// POST /api/expenses -> add one expense
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const error = validateExpense(body);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const { title, amount, category, date } = body;
  // $1,$2... are placeholders: stops SQL injection
  const result = await pool.query(
    "INSERT INTO expenses (title, amount, category, date) VALUES ($1, $2, $3, $4) RETURNING *",
    [title.trim(), amount, category, date]
  );
  return NextResponse.json(result.rows[0], { status: 201 });
}
