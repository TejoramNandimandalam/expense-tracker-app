"use client"; // this page runs in the browser (needed for state + clicks)

import { useEffect, useState } from "react";
import { calculateTotal, type Expense } from "@/lib/expenses";


export default function Home() {
  // state = data the page remembers; changing it re-draws the page
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");

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
      setError("Please fill all fields");
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

  // Add up all amounts
  const total = calculateTotal(expenses);

  // data-testid = fixed names your Playwright tests will use to find elements
  return (
    <main style={{ maxWidth: 600, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Expense Tracker</h1>

      <form onSubmit={addExpense} data-testid="expense-form">
        <input data-testid="title-input" placeholder="Title" value={title}
          onChange={(e) => setTitle(e.target.value)} />
        <input data-testid="amount-input" type="number" placeholder="Amount" value={amount}
          onChange={(e) => setAmount(e.target.value)} />
        <select data-testid="category-select" value={category}
          onChange={(e) => setCategory(e.target.value)}>
          <option>Food</option>
          <option>Travel</option>
          <option>Bills</option>
          <option>Other</option>
        </select>
        <input data-testid="date-input" type="date" value={date}
          onChange={(e) => setDate(e.target.value)} />
        <button data-testid="add-button" type="submit">Add</button>
      </form>

      {error && <p data-testid="error-message" style={{ color: "red" }}>{error}</p>}

      <h2>Total: <span data-testid="total">{total}</span></h2>

      {expenses.length === 0 ? (
        <p data-testid="empty-message">No expenses yet</p>
      ) : (
        <ul data-testid="expense-list">
          {expenses.map((x) => (
            <li key={x.id} data-testid="expense-item">
              {x.date} | {x.title} | {x.category} | {x.amount}{" "}
              <button data-testid="delete-button" onClick={() => deleteExpense(x.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}