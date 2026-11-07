import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { validateExpense } from "@/lib/expenses";

// GET /api/expenses                 -> all expenses, newest first
// GET /api/expenses?category=Food   -> only that category (release 2)
// GET /api/expenses?q=lun&sort=amount-desc -> search by title + sort (release 3)
const ORDERS: Record<string, string> = {
  "date-desc": "date DESC, id DESC",
  "amount-desc": "amount DESC, id DESC",
  "amount-asc": "amount ASC, id ASC",
};

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const category = params.get("category");
  const q = params.get("q");
  const sort = params.get("sort") ?? "date-desc";
  if (!ORDERS[sort]) {
    return NextResponse.json({ error: "Invalid sort" }, { status: 400 });
  }

  // Build the WHERE part only from fixed text; values go in as $1,$2 placeholders
  const where: string[] = [];
  const values: string[] = [];
  if (category) { values.push(category); where.push(`category = $${values.length}`); }
  if (q) { values.push(`%${q}%`); where.push(`title ILIKE $${values.length}`); }

  const sql =
    "SELECT id, title, amount, category, date FROM expenses" +
    (where.length ? " WHERE " + where.join(" AND ") : "") +
    " ORDER BY " + ORDERS[sort];
  const result = await pool.query(sql, values);
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
