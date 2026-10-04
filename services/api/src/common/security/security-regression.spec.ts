import { describe, expect, it } from "vitest";
import { isAdminRole } from "../guards/admin.guard";

describe("authorization policy regressions", () => {
  it("only ADMIN has administrator privileges", () => {
    expect(isAdminRole("ADMIN")).toBe(true);
    expect(isAdminRole("USER")).toBe(false);
    expect(isAdminRole("MODERATOR")).toBe(false);
    expect(isAdminRole("SUPPORT")).toBe(false);
  });

  it("does not treat case variants as administrator roles", () => {
    expect(isAdminRole("admin")).toBe(false);
    expect(isAdminRole("Admin")).toBe(false);
  });
});
