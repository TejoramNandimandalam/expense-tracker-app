"use client"; // this page runs in the browser (needed for state + clicks)

import { useEffect, useState } from "react";
import {
  CATEGORIES, calculateTotal, filterByCategory, searchExpenses, sortExpenses, summarizeByCategory,
  type Expense, type SortOption,
} from "@/lib/expenses";

export default function Home() {
  // state = data the page remembers; changing it re-draws the page
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All"); // release 2: category filter
  const [editingId, setEditingId] = useState<number | null>(null); // release 2: which row is being edited
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("Food");
  const [editDate, setEditDate] = useState("");
  const [editError, setEditError] = useState("");
  const [search, setSearch] = useState(""); // release 3: search by title
  const [sort, setSort] = useState<SortOption>("date-desc"); // release 3: sort order

  // Ask the API for all expenses and store them in state
  async function loadExpenses() {
    const res = await fetch("/api/expenses");
    setExpenses(await res.json());
  }

  // Runs once when the page opens: load the list
  useEffect(() => {
    loadExpenses();
  }, []);

  // Runs when the form is submitted
  async function addExpense(e: React.FormEvent) {
    e.preventDefault(); // stop the browser's default page reload
    setError("");

    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, amount, category, date }),
    });

    if (!res.ok) {
      // release 2: show the exact message sent by the API
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      return;
    }

    // Clear the form and refresh the list
    setTitle("");
    setAmount("");
    setDate("");
    loadExpenses();
  }

  // Delete one expense, then refresh the list
  async function deleteExpense(id: number) {
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    loadExpenses();
  }

  // Release 2: fill the edit form with the row's current values
  function startEdit(x: Expense) {
    setEditingId(x.id);
    setEditTitle(x.title);
    setEditAmount(String(x.amount));
    setEditCategory(x.category);
    setEditDate(x.date);
    setEditError("");
  }

  // Release 2: send the edited values to the API
  async function saveEdit(id: number) {
    const res = await fetch(`/api/expenses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle,
        amount: editAmount,
        category: editCategory,
        date: editDate,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setEditError(data.error ?? "Something went wrong");
      return;
    }
    setEditingId(null);
    loadExpenses();
  }

  // Only the rows that match the selected filter; total follows the filter
  const visible = sortExpenses(searchExpenses(filterByCategory(expenses, filter), search), sort);
  const total = calculateTotal(visible);
  // Release 3: per-category summary of ALL expenses (not affected by filter/search)
  const summary = summarizeByCategory(expenses);

  // data-testid = fixed names your Playwright tests will use to find elements
  return (
    <main style={{ maxWidth: 600, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Expense Tracker v3</h1>

      <form onSubmit={addExpense} data-testid="expense-form">
        <input data-testid="title-input" placeholder="Title" value={title}
          onChange={(e) => setTitle(e.target.value)} />
        <input data-testid="amount-input" type="number" step="0.01" placeholder="Amount" value={amount}
          onChange={(e) => setAmount(e.target.value)} />
        <select data-testid="category-select" value={category}
          onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <input data-testid="date-input" type="date" value={date}
          onChange={(e) => setDate(e.target.value)} />
        <button data-testid="add-button" type="submit">Add</button>
      </form>

      {error && <p data-testid="error-message" style={{ color: "red" }}>{error}</p>}

      <label>
        Filter:{" "}
        <select data-testid="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option>All</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>

      <input data-testid="search-input" placeholder="Search title" value={search}
        onChange={(e) => setSearch(e.target.value)} />{" "}
      <select data-testid="sort-select" value={sort} onChange={(e) => setSort(e.target.value as SortOption)}>
        <option value="date-desc">Newest first</option>
        <option value="amount-desc">Amount: high to low</option>
        <option value="amount-asc">Amount: low to high</option>
      </select>

      <h2>Total: <span data-testid="total">{total}</span></h2>
      <p>Count: <span data-testid="expense-count">{visible.length}</span></p>

      {summary.length > 0 && (
        <section data-testid="summary">
          <h3>Summary by category</h3>
          <ul>
            {summary.map((s) => (
              <li key={s.category} data-testid="summary-item">
                <span data-testid="summary-category">{s.category}</span>:{" "}
                <span data-testid="summary-total">{s.total}</span> ({s.count})
              </li>
            ))}
          </ul>
        </section>
      )}

      {visible.length === 0 ? (
        <p data-testid="empty-message">{expenses.length === 0 ? "No expenses yet" : "No matching expenses"}</p>
      ) : (
        <ul data-testid="expense-list">
          {visible.map((x) =>
            editingId === x.id ? (
              <li key={x.id} data-testid="expense-item-editing">
                <input data-testid="edit-title-input" value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)} />
                <input data-testid="edit-amount-input" type="number" step="0.01" value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)} />
                <select data-testid="edit-category-select" value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <input data-testid="edit-date-input" type="date" value={editDate}
                  onChange={(e) => setEditDate(e.target.value)} />
                <button data-testid="save-button" onClick={() => saveEdit(x.id)}>Save</button>
                <button data-testid="cancel-button" onClick={() => setEditingId(null)}>Cancel</button>
                {editError && <p data-testid="edit-error-message" style={{ color: "red" }}>{editError}</p>}
              </li>
            ) : (
              <li key={x.id} data-testid="expense-item">
                {x.date} | {x.title} | {x.category} | {x.amount}{" "}
                <button data-testid="edit-button" onClick={() => startEdit(x)}>Edit</button>{" "}
                <button data-testid="delete-button" onClick={() => deleteExpense(x.id)}>Delete</button>
              </li>
            )
          )}
        </ul>
      )}
    </main>
  );
}
