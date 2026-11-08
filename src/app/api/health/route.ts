import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

// GET /api/health -> checks the app and the database are working
export async function GET() {
  try {
    await pool.query("SELECT 1"); // simplest possible DB query
    // commit = the git commit this deployment was built from (Vercel sets it).
    // The e2e trigger uses it to know when qa is running the new code.
    return NextResponse.json({ status: "ok", commit: process.env.VERCEL_GIT_COMMIT_SHA ?? "local" });
  } catch {
    // 500 = server error, DB not reachable
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}