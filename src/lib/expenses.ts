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
