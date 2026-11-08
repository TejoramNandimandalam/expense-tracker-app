import { describe, it, expect } from "vitest";
import { calculateTotal, hasAllFields, validateExpense, filterByCategory, searchExpenses, sortExpenses, summarizeByCategory, escapeCsv, toCsv } from "./expenses";

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

describe("release 3 helpers", () => {
  const list = [
    { id: 1, title: "Lunch", amount: 250, category: "Food", date: "2026-10-05" },
    { id: 2, title: "Bus ticket", amount: 50, category: "Travel", date: "2026-10-07" },
    { id: 3, title: "Dinner", amount: 400, category: "Food", date: "2026-10-06" },
  ];
  it("search ignores case", () => expect(searchExpenses(list, "LUNCH")).toEqual([list[0]]));
  it("search with empty text returns all", () => expect(searchExpenses(list, "  ")).toHaveLength(3));
  it("search with no match returns nothing", () => expect(searchExpenses(list, "zzz")).toEqual([]));
  it("sorts newest date first", () => expect(sortExpenses(list, "date-desc").map((x) => x.id)).toEqual([2, 3, 1]));
  it("sorts amount high to low", () => expect(sortExpenses(list, "amount-desc").map((x) => x.id)).toEqual([3, 1, 2]));
  it("sorts amount low to high", () => expect(sortExpenses(list, "amount-asc").map((x) => x.id)).toEqual([2, 1, 3]));
  it("sorting does not change the original list", () => {
    sortExpenses(list, "amount-desc");
    expect(list.map((x) => x.id)).toEqual([1, 2, 3]);
  });
  it("summarizes totals per category", () =>
    expect(summarizeByCategory(list)).toEqual([
      { category: "Food", total: 650, count: 2 },
      { category: "Travel", total: 50, count: 1 },
    ]));
  it("summary skips empty categories", () => expect(summarizeByCategory([])).toEqual([]));
});

describe("CSV export (release 4)", () => {
  it("leaves plain text as it is", () => expect(escapeCsv("Lunch")).toBe("Lunch"));
  it("quotes text that contains a comma", () => expect(escapeCsv("Tea, biscuits")).toBe('"Tea, biscuits"'));
  it("doubles quotes inside the text", () => expect(escapeCsv('The "best" tea')).toBe('"The ""best"" tea"'));
  it("quotes text that contains a new line", () => expect(escapeCsv("a\nb")).toBe('"a\nb"'));
  it("gives only the header for an empty list", () => expect(toCsv([])).toBe("id,title,amount,category,date"));
  it("writes one line per expense", () =>
    expect(toCsv([{ id: 1, title: "Lunch", amount: 250.5, category: "Food", date: "2026-10-06" }])).toBe(
      "id,title,amount,category,date\n1,Lunch,250.5,Food,2026-10-06"
    ));
});
