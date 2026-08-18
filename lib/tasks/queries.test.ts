import { describe, expect, test } from "vitest";
import { splitByCategory } from "./split-by-category";

describe("splitByCategory", () => {
  test("keeps Personal then Work and preserves order within each", () => {
    const { personal, work } = splitByCategory([
      { category: "work", title: "W1" },
      { category: "personal", title: "P1" },
      { category: "work", title: "W2" },
      { category: "personal", title: "P2" },
    ]);

    expect(personal.map((item) => item.title)).toEqual(["P1", "P2"]);
    expect(work.map((item) => item.title)).toEqual(["W1", "W2"]);
  });
});
