import { describe, expect, it } from "vitest";

import { OFFERS, type Offer } from "@/lib/data";
import { bestOffer, packPrice, pharmacyComparison, scoreOffers } from "@/lib/pricing";

// Best-match scoring internals. The user-story checks (US1-AC3 etc.) are in price-comparison.test.ts.
describe("best match scoring", () => {
  it("lets price outweigh distance", () => {
    // Shifo is the closest Fanigan seller; making it far cheaper must make it the best match.
    const offers: Offer[] = OFFERS.map((o) =>
      o.medicineId === "fanigan" && o.pharmacyId === "shifo" ? { ...o, price: 20000 } : o,
    );
    expect(bestOffer(offers, "fanigan")?.pharmacyId).toBe("shifo");
  });

  it("sorts scores best first", () => {
    const scores = scoreOffers(OFFERS, "paracetamol").map((s) => s.score);
    expect(scores).toEqual([...scores].sort((a, b) => a - b));
  });
});

describe("same medicine in other pharmacies (medicine page)", () => {
  it("lists the pharmacies sorted from cheapest to most expensive", () => {
    const prices = pharmacyComparison(OFFERS, "fanigan", "horoshiy").rows.map((r) => r.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
    expect(prices.length).toBeGreaterThanOrEqual(4);
  });

  it("shows cheaper pharmacies with a negative difference and dearer ones with a positive one", () => {
    const { rows, maxSaving } = pharmacyComparison(OFFERS, "fanigan", "horoshiy");
    const current = rows.find((r) => r.isCurrent)!;
    expect(current).toMatchObject({ o: { pharmacyId: "horoshiy" }, price: 35000, diff: 0 });
    for (const r of rows) {
      expect(Math.sign(r.diff)).toBe(Math.sign(r.price - 35000));
    }
    expect(rows.some((r) => r.diff < 0)).toBe(true);
    expect(rows.some((r) => r.diff > 0)).toBe(true);
    expect(maxSaving).toBe(35000 - rows[0]!.price);
  });

  it("puts the Lowest price badge on the first row only and marks the best match", () => {
    const { rows } = pharmacyComparison(OFFERS, "fanigan", "horoshiy");
    expect(rows.filter((r) => r.isLowest)).toEqual([rows[0]]);
    expect(rows.filter((r) => r.isBestMatch).map((r) => r.o.pharmacyId)).toEqual(["horoshiy"]);
  });

  it("uses the selected pack size for prices and differences", () => {
    const full = pharmacyComparison(OFFERS, "fanigan", "horoshiy", 1);
    const half = pharmacyComparison(OFFERS, "fanigan", "horoshiy", 0.55);
    const h = (rows: typeof full.rows) => rows.find((r) => r.o.pharmacyId === "horoshiy")!.price;
    expect(h(full.rows)).toBe(35000);
    expect(h(half.rows)).toBe(packPrice(35000, 0.55));
    expect(half.maxSaving).toBeLessThan(full.maxSaving);
  });

  it("has nothing to save when the current pharmacy is already the cheapest", () => {
    const { rows, maxSaving } = pharmacyComparison(OFFERS, "fanigan", "soglom");
    expect(rows[0]!.isCurrent).toBe(true);
    expect(maxSaving).toBe(0);
  });
});
