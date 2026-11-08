"use client"; // this page runs in the browser (needed for state + clicks)

import { useEffect, useRef, useState } from "react";
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
  const [notice, setNotice] = useState(""); // release 4: green success message
  const [filter, setFilter] = useState("All");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("Food");
  const [editDate, setEditDate] = useState("");
  const [editError, setEditError] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("date-desc");
  const titleRef = useRef<HTMLInputElement>(null); // lets us move the cursor to the title box

  // Show a green message for 4 seconds
  function showNotice(message: string) {
    setNotice(message);
    setTimeout(() => setNotice(""), 4000);
  }

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
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      return;
    }

    // Clear the form, tell the user, refresh the list and put the cursor back in Title
    setTitle("");
    setAmount("");
    setDate("");
    showNotice("Expense added");
    titleRef.current?.focus();
    loadExpenses();
  }

  // Delete one expense, then refresh the list
  async function deleteExpense(id: number) {
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    showNotice("Expense deleted");
    loadExpenses();
  }

  // Fill the edit form with the row's current values
  function startEdit(x: Expense) {
    setEditingId(x.id);
    setEditTitle(x.title);
    setEditAmount(String(x.amount));
    setEditCategory(x.category);
    setEditDate(x.date);
    setEditError("");
  }

  // Send the edited values to the API
  async function saveEdit(id: number) {
    const res = await fetch(`/api/expenses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, amount: editAmount, category: editCategory, date: editDate }),
    });
    if (!res.ok) {
      const data = await res.json();
      setEditError(data.error ?? "Something went wrong");
      return;
    }
    setEditingId(null);
    showNotice("Expense updated");
    loadExpenses();
  }

  // Only the rows that match filter + search, in the chosen order; total follows them
  const visible = sortExpenses(searchExpenses(filterByCategory(expenses, filter), search), sort);
  const total = calculateTotal(visible);
  const summary = summarizeByCategory(expenses);
  const biggest = Math.max(...summary.map((s) => s.total), 1); // for the bar widths

  // Release 4: the export link follows the selected category
  const exportHref = filter === "All" ? "/api/export" : `/api/export?category=${encodeURIComponent(filter)}`;

  // data-testid = fixed names your Playwright tests will use to find elements
  return (
    <div className="container">
      <header className="hero">
        <h1>Expense Tracker v4</h1>
        <p>Add, edit and understand where your money goes.</p>
      </header>

      <form className="card form-grid" onSubmit={addExpense} data-testid="expense-form">
        <input ref={titleRef} data-testid="title-input" aria-label="Title" placeholder="Title" value={title}
          onChange={(e) => setTitle(e.target.value)} />
        <input data-testid="amount-input" aria-label="Amount" type="number" step="0.01" placeholder="Amount" value={amount}
          onChange={(e) => setAmount(e.target.value)} />
        <select data-testid="category-select" aria-label="Category" value={category}
          onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <input data-testid="date-input" aria-label="Date" type="date" value={date}
          onChange={(e) => setDate(e.target.value)} />
        <button className="primary" data-testid="add-button" type="submit">Add</button>
      </form>

      {error && <p className="notice error" data-testid="error-message">{error}</p>}
      {notice && <p className="notice success" data-testid="success-message">{notice}</p>}

      <section className="card toolbar">
        <select data-testid="filter-select" aria-label="Filter by category" value={filter}
          onChange={(e) => setFilter(e.target.value)}>
          <option>All</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <input data-testid="search-input" aria-label="Search title" placeholder="Search title" value={search}
          onChange={(e) => setSearch(e.target.value)} />
        <select data-testid="sort-select" aria-label="Sort expenses" value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}>
          <option value="date-desc">Newest first</option>
          <option value="amount-desc">Amount: high to low</option>
          <option value="amount-asc">Amount: low to high</option>
        </select>
        <a className="export-link" data-testid="export-button" href={exportHref} download="expenses.csv">
          Export CSV
        </a>
      </section>

      <section className="card stats">
        <div>
          <p className="stat-label">Total spent</p>
          <p className="stat-value">₹<span data-testid="total">{total}</span></p>
        </div>
        <div>
          <p className="stat-label">Expenses</p>
          <p className="stat-value"><span data-testid="expense-count">{visible.length}</span></p>
        </div>
      </section>

      {summary.length > 0 && (
        <section className="card" data-testid="summary">
          <h3 style={{ marginTop: 0 }}>Summary by category</h3>
          <ul className="summary-list">
            {summary.map((s) => (
              <li key={s.category} data-testid="summary-item">
                <div className="summary-row">
                  <span data-testid="summary-category">{s.category}</span>
                  <span>₹<span data-testid="summary-total">{s.total}</span> ({s.count})</span>
                </div>
                <div className="bar-track"><div className="bar" style={{ width: `${(s.total / biggest) * 100}%` }} /></div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card">
        {visible.length === 0 ? (
          <p className="empty" data-testid="empty-message">
            {expenses.length === 0 ? "No expenses yet" : "No matching expenses"}
          </p>
        ) : (
          <ul className="expense-list" data-testid="expense-list">
            {visible.map((x) =>
              editingId === x.id ? (
                <li className="expense-row" key={x.id} data-testid="expense-item-editing">
                  <div className="edit-form">
                    <input data-testid="edit-title-input" aria-label="Edit title" value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)} />
                    <input data-testid="edit-amount-input" aria-label="Edit amount" type="number" step="0.01" value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)} />
                    <select data-testid="edit-category-select" aria-label="Edit category" value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}>
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <input data-testid="edit-date-input" aria-label="Edit date" type="date" value={editDate}
                      onChange={(e) => setEditDate(e.target.value)} />
                    <div className="edit-actions">
                      <button className="primary small" data-testid="save-button" onClick={() => saveEdit(x.id)}>Save</button>
                      <button className="small" data-testid="cancel-button" onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  </div>
                  {editError && <p className="notice error" data-testid="edit-error-message">{editError}</p>}
                </li>
              ) : (
                <li className="expense-row" key={x.id} data-testid="expense-item">
                  <span className="expense-date">{x.date}</span>
                  <span className="expense-title">{x.title}</span>
                  <span className={`badge badge-${x.category.toLowerCase()}`} data-testid="category-badge">{x.category}</span>
                  <span className="expense-amount">₹{x.amount}</span>
                  <span className="actions">
                    <button className="small" data-testid="edit-button" aria-label={`Edit ${x.title}`}
                      onClick={() => startEdit(x)}>Edit</button>
                    <button className="small danger" data-testid="delete-button" aria-label={`Delete ${x.title}`}
                      onClick={() => deleteExpense(x.id)}>Delete</button>
                  </span>
                </li>
              )
            )}
          </ul>
        )}
      </section>

      <footer className="footer" data-testid="app-footer">Expense Tracker · Release 4</footer>
    </div>
  );
}
