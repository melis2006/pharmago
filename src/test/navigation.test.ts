import { describe, expect, it } from "vitest";

import { parentPath, showBackButton } from "@/lib/navigation";

describe("Back button fallback (no browser history)", () => {
  it.each([
    ["/medicine/fanigan", "/home"],
    ["/compare/fanigan", "/medicine/fanigan"],
    ["/cart", "/home"],
    ["/checkout", "/cart"],
    ["/track/PG-123456", "/orders"],
    ["/orders", "/home"],
    ["/saved", "/home"],
    ["/profile", "/home"],
    ["/privacy", "/home"],
    ["/success/PG-123456", "/home"],
    ["/admin", "/home"],
  ])("%s goes to %s", (from, to) => {
    expect(parentPath(from)).toBe(to);
  });

  it("is hidden on the welcome page and home, shown everywhere else", () => {
    expect(showBackButton("/")).toBe(false);
    expect(showBackButton("/home")).toBe(false);
    expect(showBackButton("/medicine/fanigan")).toBe(true);
    expect(showBackButton("/emergency")).toBe(true);
  });
});
