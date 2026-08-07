import { describe, expect, it } from "vitest";
import { parseAnswers } from "./questionnaire";

const valid = { goal: "build_credit", timeline: "90_days", challenge: "debt" };

describe("parseAnswers", () => {
  it("accepts a complete, valid set of answers", () => {
    expect(parseAnswers(valid)).toEqual(valid);
  });

  it("rejects a value outside the allowed set", () => {
    expect(parseAnswers({ ...valid, goal: "get_rich" })).toBeNull();
  });

  it("rejects a partially answered questionnaire", () => {
    expect(parseAnswers({ goal: "build_credit" })).toBeNull();
    expect(parseAnswers({ ...valid, challenge: undefined })).toBeNull();
  });

  it("rejects non-object input rather than throwing", () => {
    expect(parseAnswers(null)).toBeNull();
    expect(parseAnswers("build_credit")).toBeNull();
    expect(parseAnswers(42)).toBeNull();
  });

  it("ignores unexpected extra keys instead of passing them through", () => {
    const result = parseAnswers({ ...valid, is_admin: true });
    expect(result).toEqual(valid);
    expect(result).not.toHaveProperty("is_admin");
  });
});
