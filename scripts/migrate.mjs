// Connects to Neon and creates the expenses table
import pg from "pg";

// Connection string comes from .env (loaded by the run command below)
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

await client.connect();

// IF NOT EXISTS = safe to run many times
await client.query(`
  CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,          -- auto number 1,2,3...
    title TEXT NOT NULL,            -- e.g. "Lunch"
    amount NUMERIC(10,2) NOT NULL,  -- e.g. 250.50
    category TEXT NOT NULL,         -- e.g. "Food"
    date DATE NOT NULL              -- e.g. 2026-10-06
  );
`);

console.log("expenses table is ready");
await client.end();