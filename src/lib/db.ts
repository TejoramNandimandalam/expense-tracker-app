import { Pool, types } from "pg";

// By default pg turns a DATE into a JS Date object (timezone problems).
// 1082 = DATE type. This keeps it as a plain string like "2026-10-06".
types.setTypeParser(1082, (value: string) => value);

// NUMERIC (amount) also comes back as a string by default.
// 1700 = NUMERIC type. Convert it to a real number.
types.setTypeParser(1700, (value: string) => parseFloat(value));

// A pool = a set of reusable DB connections (faster than reconnecting each time)
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1, // on Vercel each function instance needs only one connection
  idleTimeoutMillis: 5000, // close idle connections quickly, Neon closes them anyway
  connectionTimeoutMillis: 10000, // give up with an error instead of hanging
});

// Neon can close an idle connection. Without this handler that error is unhandled
// and crashes the function, which shows up as "ECONNRESET" for the caller.
pool.on("error", (err) => {
  console.error("Database pool error:", err.message);
});
