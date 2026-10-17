// Privacy rules for health data (see docs/security.md).
import { beforeEach, describe, expect, it } from "vitest";

import {
  conditionsToSave,
  deleteMyData,
  removeLegacyData,
  sanitizeUser,
  STORAGE_KEY,
} from "@/lib/privacy";

describe("consent rule", () => {
  it("does not save health conditions without consent", () => {
    expect(conditionsToSave(["diabetes", "asthma"], false)).toEqual([]);
  });

  it("saves health conditions with consent", () => {
    expect(conditionsToSave(["diabetes", "asthma"], true)).toEqual(["diabetes", "asthma"]);
  });

  it("drops conditions from a saved user who never gave consent", () => {
    const user = { name: "Test", phone: "+998", conditions: ["diabetes" as const] };
    expect(sanitizeUser(user)).toMatchObject({ conditions: [], healthConsent: false });
  });

  it("keeps conditions for a user who gave consent", () => {
    const user = {
      name: "Test",
      phone: "+998",
      conditions: ["diabetes" as const],
      healthConsent: true,
    };
    expect(sanitizeUser(user).conditions).toEqual(["diabetes"]);
  });
});

describe("delete my data", () => {
  beforeEach(() => localStorage.clear());

  it("removes every key PharmaGO stored and nothing else", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: { conditions: ["diabetes"] } }));
    localStorage.setItem("pharmago-v1", "{}");
    localStorage.setItem("other-site-setting", "keep me");

    const removed = deleteMyData(localStorage);

    expect(removed.sort()).toEqual(["pharmago-v1", STORAGE_KEY].sort());
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem("pharmago-v1")).toBeNull();
    expect(localStorage.getItem("other-site-setting")).toBe("keep me");
  });

  it("does nothing when there is no data", () => {
    expect(deleteMyData(localStorage)).toEqual([]);
  });

  it("removes data left by older app versions on load, but keeps the current data", () => {
    localStorage.setItem("pharmago-v1", "{}");
    localStorage.setItem("pharmago-v2", "{}");
    localStorage.setItem(STORAGE_KEY, "{}");

    expect(removeLegacyData(localStorage).sort()).toEqual(["pharmago-v1", "pharmago-v2"]);
    expect(localStorage.getItem(STORAGE_KEY)).toBe("{}");
  });
});
