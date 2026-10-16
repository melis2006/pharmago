// US2: As a user with diabetes, I want to be warned about medicines that are not safe for me,
// so that I don't buy the wrong one.
import { describe, expect, it } from "vitest";

import { getMedicine } from "@/lib/data";
import { getWarnings } from "@/lib/health";

const teraflu = getMedicine("teraflu")!;
const fanigan = getMedicine("fanigan")!;

describe("US2: health warnings (getWarnings)", () => {
  it("US2-AC1: with Diabetes ticked, Teraflu is flagged with the reason", () => {
    const warnings = getWarnings(teraflu, ["diabetes"]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatchObject({ condition: "diabetes", label: "Diabetes" });
    expect(warnings[0]?.reason).toMatch(/sugar/i);
  });

  it("US2-AC2: with no conditions ticked, Teraflu is not flagged", () => {
    expect(getWarnings(teraflu, [])).toEqual([]);
  });

  it("does not flag Teraflu for an unrelated condition (asthma)", () => {
    expect(getWarnings(teraflu, ["asthma"])).toEqual([]);
  });

  it("lists every matching condition when several are ticked", () => {
    const warnings = getWarnings(teraflu, ["diabetes", "hypertension", "asthma"]);
    expect(warnings.map((w) => w.label)).toEqual(["Diabetes", "High blood pressure"]);
  });

  it("only reports conditions the medicine conflicts with (Fanigan: ulcer, kidney, asthma but not diabetes)", () => {
    const warnings = getWarnings(fanigan, ["ulcer", "kidney", "asthma", "diabetes"]);
    expect(warnings.map((w) => w.condition).sort()).toEqual(["asthma", "kidney", "ulcer"]);
    for (const w of warnings) expect(w.reason.length).toBeGreaterThan(0);
  });
});
