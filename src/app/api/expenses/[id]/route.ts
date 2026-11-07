import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { validateExpense } from "@/lib/expenses";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/expenses/5 -> one expense (release 2)
export async function GET(_request: Request, { params }: Ctx) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const result = await pool.query("SELECT id, title, amount, category, date FROM expenses WHERE id = $1", [id]);
  if (result.rowCount === 0) return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  return NextResponse.json(result.rows[0]);
}

// PUT /api/expenses/5 -> edit expense 5 (release 2)
export async function PUT(request: Request, { params }: Ctx) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const error = validateExpense(body);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const { title, amount, category, date } = body;
  const result = await pool.query(
    "UPDATE expenses SET title=$1, amount=$2, category=$3, date=$4 WHERE id=$5 RETURNING *",
    [title.trim(), amount, category, date, id]
  );
  if (result.rowCount === 0) return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  return NextResponse.json(result.rows[0]);
}

// DELETE /api/expenses/5 -> delete expense with id 5
export async function DELETE(_request: Request, { params }: Ctx) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const result = await pool.query("DELETE FROM expenses WHERE id = $1 RETURNING id", [id]);
  if (result.rowCount === 0) return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  return NextResponse.json({ message: "Deleted" });
}
