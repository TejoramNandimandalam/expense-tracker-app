import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

// DELETE /api/expenses/5 -> delete expense with id 5
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // In Next.js 15, params must be awaited
  const { id } = await params;

  // RETURNING id tells us if a row was actually deleted
  const result = await pool.query("DELETE FROM expenses WHERE id = $1 RETURNING id", [id]);

  // No row deleted = that id doesn't exist
  if (result.rowCount === 0) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Deleted" });
}