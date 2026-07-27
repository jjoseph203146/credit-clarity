import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("joins plain class strings", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("drops falsy values (conditional classes)", () => {
    expect(cn("a", false && "b", undefined, null, "c")).toBe("a c");
  });

  it("merges conflicting Tailwind utilities, keeping the last one", () => {
    // twMerge should resolve conflicting padding utilities down to the last
    // one specified, rather than emitting both.
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("merges conflicting text color utilities", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("supports object and array syntax from clsx", () => {
    expect(cn(["a", { b: true, c: false }])).toBe("a b");
  });
});
