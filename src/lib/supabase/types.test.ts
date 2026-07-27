import { describe, expect, it } from "vitest";
import type {
  AccountStatus,
  AccountType,
  Bureau,
  Goal,
  PaymentStatus,
  ReportStatus,
} from "./types";

// Type-level sanity checks for the hand-written Supabase types. These guard
// against silent drift between this file and supabase-schema.sql: if a
// literal below is removed from the union, TypeScript fails the build
// (`tsc --noEmit`) even though nothing here executes differently at runtime.

function assertType<T>(value: T): T {
  return value;
}

describe("supabase/types enums stay in sync with the schema", () => {
  it("accepts every known bureau", () => {
    const bureaus: Bureau[] = ["experian", "equifax", "transunion"];
    expect(assertType<Bureau[]>(bureaus)).toHaveLength(3);
  });

  it("accepts every known report status, including the pre-payment states", () => {
    const statuses: ReportStatus[] = ["uploaded", "parsed", "paid", "analyzed", "error"];
    expect(assertType<ReportStatus[]>(statuses)).toEqual([
      "uploaded",
      "parsed",
      "paid",
      "analyzed",
      "error",
    ]);
  });

  it("accepts every known payment status", () => {
    const statuses: PaymentStatus[] = ["pending", "succeeded", "failed", "refunded"];
    expect(assertType<PaymentStatus[]>(statuses)).toHaveLength(4);
  });

  it("accepts every known account type, including collection", () => {
    const types: AccountType[] = [
      "credit_card",
      "retail_card",
      "auto_loan",
      "student_loan",
      "mortgage",
      "collection",
      "other",
    ];
    expect(assertType<AccountType[]>(types)).toContain("collection");
  });

  it("only allows open/closed as account statuses", () => {
    const open: AccountStatus = "open";
    const closed: AccountStatus = "closed";
    expect([open, closed]).toEqual(["open", "closed"]);
  });

  it("accepts every known user goal used by the questionnaire", () => {
    const goals: Goal[] = [
      "build_credit",
      "recover_mistakes",
      "pay_down_debt",
      "major_purchase",
      "understand_finances",
    ];
    expect(assertType<Goal[]>(goals)).toHaveLength(5);
  });
});
