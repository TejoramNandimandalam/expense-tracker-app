import { describe, it, expect } from "vitest";
import { calculateTotal, hasAllFields, validateExpense, filterByCategory } from "./expenses";

// describe = a group of tests, it = one test, expect = the check
describe("calculateTotal", () => {
  it("returns 0 for an empty list", () => {
    expect(calculateTotal([])).toBe(0);
  });

  it("adds up all amounts", () => {
    const list = [
      { id: 1, title: "Lunch", amount: 250, category: "Food", date: "2026-10-06" },
      { id: 2, title: "Bus", amount: 50, category: "Travel", date: "2026-10-06" },
    ];
    expect(calculateTotal(list)).toBe(300);
  });
});

describe("hasAllFields", () => {
  it("is true when everything is filled", () => {
    expect(hasAllFields({ title: "Lunch", amount: 250, category: "Food", date: "2026-10-06" })).toBe(true);
  });

  it("is false when title is missing", () => {
    expect(hasAllFields({ title: "", amount: 250, category: "Food", date: "2026-10-06" })).toBe(false);
  });
});

const ok = { title: "Lunch", amount: 250, category: "Food", date: "2026-10-06" };

describe("validateExpense (release 2)", () => {
  it("accepts a valid expense", () => expect(validateExpense(ok)).toBeNull());
  it("rejects an empty title", () => expect(validateExpense({ ...ok, title: "  " })).toBe("Title is required"));
  it("rejects a title over 50 characters", () =>
    expect(validateExpense({ ...ok, title: "a".repeat(51) })).toBe("Title must be 50 characters or less"));
  it("rejects zero amount", () => expect(validateExpense({ ...ok, amount: 0 })).toBe("Amount must be greater than 0"));
  it("rejects negative amount", () => expect(validateExpense({ ...ok, amount: -5 })).toBe("Amount must be greater than 0"));
  it("rejects amount over the limit", () =>
    expect(validateExpense({ ...ok, amount: 1000001 })).toBe("Amount must be 1,000,000 or less"));
  it("rejects a missing amount", () => expect(validateExpense({ ...ok, amount: "" })).toBe("Amount is required"));
  it("rejects an unknown category", () => expect(validateExpense({ ...ok, category: "Games" })).toBe("Invalid category"));
  it("rejects a bad date", () => expect(validateExpense({ ...ok, date: "06/10/2026" })).toBe("Invalid date"));
});

describe("filterByCategory (release 2)", () => {
  const list = [
    { id: 1, title: "Lunch", amount: 250, category: "Food", date: "2026-10-06" },
    { id: 2, title: "Bus", amount: 50, category: "Travel", date: "2026-10-06" },
  ];
  it("returns everything for All", () => expect(filterByCategory(list, "All")).toHaveLength(2));
  it("returns only the chosen category", () => expect(filterByCategory(list, "Food")).toEqual([list[0]]));
  it("returns nothing when no row matches", () => expect(filterByCategory(list, "Bills")).toEqual([]));
});

describe("calculateTotal rounding", () => {
  it("avoids floating point errors", () => {
    const list = [
      { id: 1, title: "a", amount: 0.1, category: "Food", date: "2026-10-06" },
      { id: 2, title: "b", amount: 0.2, category: "Food", date: "2026-10-06" },
    ];
    expect(calculateTotal(list)).toBe(0.3);
  });
});
