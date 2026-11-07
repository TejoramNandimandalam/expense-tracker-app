// Pure logic: no database, no React. Easy to test.

export type Expense = {
  id: number;
  title: string;
  amount: number;
  category: string;
  date: string;
};

// Allowed categories (used by the form, the filter and the API check)
export const CATEGORIES = ["Food", "Travel", "Bills", "Other"] as const;

// Add up all amounts (rounded to 2 decimals so 0.1 + 0.2 = 0.3)
export function calculateTotal(expenses: Expense[]): number {
  const sum = expenses.reduce((acc, x) => acc + x.amount, 0);
  return Math.round(sum * 100) / 100;
}

// Release 1 check: every field must be filled. Returns true/false.
export function hasAllFields(input: {
  title?: string;
  amount?: string | number;
  category?: string;
  date?: string;
}): boolean {
  return Boolean(input.title && input.amount && input.category && input.date);
}

// Release 2: strict validation. Returns an error message, or null if valid.
export function validateExpense(input: {
  title?: unknown;
  amount?: unknown;
  category?: unknown;
  date?: unknown;
}): string | null {
  const title = typeof input.title === "string" ? input.title.trim() : "";
  if (!title) return "Title is required";
  if (title.length > 50) return "Title must be 50 characters or less";

  const amount = Number(input.amount);
  if (input.amount === "" || input.amount == null || Number.isNaN(amount)) {
    return "Amount is required";
  }
  if (amount <= 0) return "Amount must be greater than 0";
  if (amount > 1000000) return "Amount must be 1,000,000 or less";

  if (!CATEGORIES.includes(input.category as (typeof CATEGORIES)[number])) {
    return "Invalid category";
  }

  const date = typeof input.date === "string" ? input.date : "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
    return "Invalid date";
  }
  return null;
}

// Release 2: keep only expenses of one category ("All" keeps everything)
export function filterByCategory(expenses: Expense[], category: string): Expense[] {
  if (category === "All") return expenses;
  return expenses.filter((x) => x.category === category);
}

// ---------- Release 3 ----------

export type SortOption = "date-desc" | "amount-desc" | "amount-asc";

// Keep expenses whose title contains the text (ignores upper/lower case)
export function searchExpenses(expenses: Expense[], text: string): Expense[] {
  const q = text.trim().toLowerCase();
  if (!q) return expenses;
  return expenses.filter((x) => x.title.toLowerCase().includes(q));
}

// Return a new sorted list (the original list is not changed)
export function sortExpenses(expenses: Expense[], sort: SortOption): Expense[] {
  const copy = [...expenses];
  if (sort === "amount-desc") return copy.sort((a, b) => b.amount - a.amount);
  if (sort === "amount-asc") return copy.sort((a, b) => a.amount - b.amount);
  // date-desc: newest first (ISO dates sort correctly as text)
  return copy.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id));
}

// Total and count per category, e.g. [{category:"Food", total:300, count:2}]
export function summarizeByCategory(expenses: Expense[]) {
  return CATEGORIES.map((category) => {
    const rows = expenses.filter((x) => x.category === category);
    return { category, total: calculateTotal(rows), count: rows.length };
  }).filter((s) => s.count > 0);
}
