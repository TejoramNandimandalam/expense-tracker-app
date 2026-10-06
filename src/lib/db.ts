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
});