// Pure logic: no database, no React. Easy to test.

export type Expense = {
  id: number;
  title: string;
  amount: number;
  category: string;
  date: string;
};

// Add up all amounts
export function calculateTotal(expenses: Expense[]): number {
  return expenses.reduce((sum, x) => sum + x.amount, 0);
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