import { describe, it, expect } from "vitest";
import { calculateTotal, hasAllFields } from "./expenses";

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