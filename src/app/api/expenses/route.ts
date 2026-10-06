import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

// GET /api/expenses -> list all expenses, newest first
export async function GET() {
  const result = await pool.query(
    "SELECT id, title, amount, category, date FROM expenses ORDER BY date DESC, id DESC"
  );
  return NextResponse.json(result.rows);
}

// POST /api/expenses -> add one expense
export async function POST(request: Request) {
  const body = await request.json();
  const { title, amount, category, date } = body;

  // Basic check only (strict validation comes in release 2)
  if (!title || !amount || !category || !date) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  // $1,$2... are placeholders: stops SQL injection
  const result = await pool.query(
    "INSERT INTO expenses (title, amount, category, date) VALUES ($1, $2, $3, $4) RETURNING *",
    [title, amount, category, date]
  );

  // 201 = "created"
  return NextResponse.json(result.rows[0], { status: 201 });
}