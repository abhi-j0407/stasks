import { describe, expect, test } from "vitest";
import { isAuthorizedCron } from "./cron-auth";

const SECRET = "test-cron-secret";

describe("isAuthorizedCron", () => {
  test("rejects a missing or empty secret", () => {
    expect(isAuthorizedCron("Bearer test-cron-secret", undefined)).toBe(false);
    expect(isAuthorizedCron("Bearer test-cron-secret", "")).toBe(false);
  });

  test("rejects a missing or wrong bearer token", () => {
    expect(isAuthorizedCron(null, SECRET)).toBe(false);
    expect(isAuthorizedCron("Bearer", SECRET)).toBe(false);
    expect(isAuthorizedCron("Bearer wrong-secret", SECRET)).toBe(false);
    expect(isAuthorizedCron("Basic test-cron-secret", SECRET)).toBe(false);
  });

  test("accepts an exact bearer match", () => {
    expect(isAuthorizedCron("Bearer test-cron-secret", SECRET)).toBe(true);
  });
});
