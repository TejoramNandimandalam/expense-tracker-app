import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

// GET /api/health -> checks the app and the database are working
export async function GET() {
  try {
    await pool.query("SELECT 1"); // simplest possible DB query
    return NextResponse.json({ status: "ok" });
  } catch {
    // 500 = server error, DB not reachable
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}