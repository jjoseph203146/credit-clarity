import { describe, expect, it } from "vitest";
import { MAX_FIELD_CHARS, clampField, clampRows } from "./limits";

describe("clampField", () => {
  it("leaves values within the limit untouched", () => {
    expect(clampField("CHASE CARD")).toBe("CHASE CARD");
  });

  it("preserves null — the parser uses it to mean 'not confidently found'", () => {
    expect(clampField(null)).toBeNull();
    expect(clampField(undefined)).toBeUndefined();
  });

  it("truncates and marks an over-long value", () => {
    const result = clampField("x".repeat(MAX_FIELD_CHARS + 50))!;
    expect(result).toContain("[truncated]");
    expect(result.startsWith("x".repeat(MAX_FIELD_CHARS))).toBe(true);
  });

  it("does not truncate a value exactly at the limit", () => {
    const exact = "x".repeat(MAX_FIELD_CHARS);
    expect(clampField(exact)).toBe(exact);
  });
});

describe("clampRows", () => {
  it("passes through a list within the cap and reports nothing dropped", () => {
    expect(clampRows([1, 2, 3], 10)).toEqual({ kept: [1, 2, 3], dropped: 0 });
  });

  it("caps an over-long list and reports how many were dropped", () => {
    const { kept, dropped } = clampRows([1, 2, 3, 4, 5], 3);
    expect(kept).toEqual([1, 2, 3]);
    expect(dropped).toBe(2);
  });

  it("treats a list exactly at the cap as untouched", () => {
    expect(clampRows([1, 2, 3], 3)).toEqual({ kept: [1, 2, 3], dropped: 0 });
  });
});
