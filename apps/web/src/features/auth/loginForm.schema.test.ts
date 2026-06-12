import { describe, it, expect } from "vitest";
import { LoginSchema } from "./loginForm.schema";

describe("LoginSchema", () => {
  it("accepts a valid email + password", () => {
    const result = LoginSchema.safeParse({ email: "user@example.com", password: "secret" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = LoginSchema.safeParse({ email: "not-an-email", password: "secret" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toContain("email");
  });

  it("rejects an empty password", () => {
    const result = LoginSchema.safeParse({ email: "user@example.com", password: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toContain("password");
  });

  it("rejects missing email", () => {
    const result = LoginSchema.safeParse({ password: "secret" });
    expect(result.success).toBe(false);
  });
});
