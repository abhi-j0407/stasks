import { describe, expect, test } from "vitest";
import { isTransientNeonConnectError } from "./retry";

describe("isTransientNeonConnectError", () => {
  test("treats nested fetch failed as retryable", () => {
    const error = Object.assign(new Error("Failed query: select 1"), {
      cause: Object.assign(new Error("Error connecting to database: TypeError: fetch failed"), {
        sourceError: Object.assign(new Error("fetch failed"), {
          cause: new Error("other side closed"),
        }),
      }),
    });

    expect(isTransientNeonConnectError(error)).toBe(true);
  });

  test("does not retry ordinary SQL errors", () => {
    expect(
      isTransientNeonConnectError(new Error('Failed query: relation "tasks" does not exist')),
    ).toBe(false);
  });
});
