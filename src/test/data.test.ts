import { describe, expect, it } from "vitest";

import { formatSum, getMedicine, MEDICINES, OFFERS, offersFor, PHARMACIES } from "@/lib/data";
import { bestOffer } from "@/lib/pricing";

describe("demo data", () => {
  it("gives every medicine at least one offer", () => {
    for (const m of MEDICINES) expect(offersFor(OFFERS, m.id).length, m.id).toBeGreaterThan(0);
  });

  it("sells every medicine in at least 4 pharmacies (in stock) with at least 3 different prices", () => {
    for (const m of MEDICINES) {
      const inStock = offersFor(OFFERS, m.id).filter((o) => o.qty > 0);
      expect(inStock.length, m.id).toBeGreaterThanOrEqual(4);
      expect(new Set(inStock.map((o) => o.price)).size, m.id).toBeGreaterThanOrEqual(3);
    }
  });

  it("has cheaper and more expensive pharmacies than the best match (about 5–25% apart)", () => {
    for (const m of MEDICINES) {
      const best = bestOffer(OFFERS, m.id)!;
      const diffs = offersFor(OFFERS, m.id).map((o) => (o.price - best.price) / best.price);
      expect(
        diffs.some((d) => d < 0),
        `${m.id}: something cheaper`,
      ).toBe(true);
      expect(
        diffs.some((d) => d > 0),
        `${m.id}: something more expensive`,
      ).toBe(true);
      for (const d of diffs.filter((x) => x !== 0)) {
        expect(Math.abs(d), m.id).toBeGreaterThanOrEqual(0.05);
        expect(Math.abs(d), m.id).toBeLessThanOrEqual(0.25);
      }
    }
  });

  it("only has offers for known medicines and pharmacies, at most one per pair", () => {
    const seen = new Set<string>();
    for (const o of OFFERS) {
      expect(getMedicine(o.medicineId), o.medicineId).toBeDefined();
      expect(
        PHARMACIES.some((p) => p.id === o.pharmacyId),
        o.pharmacyId,
      ).toBe(true);
      const key = `${o.pharmacyId}:${o.medicineId}`;
      expect(seen.has(key), key).toBe(false);
      seen.add(key);
    }
  });

  it("has different prices across pharmacies for the same medicine", () => {
    for (const m of MEDICINES) {
      const prices = offersFor(OFFERS, m.id).map((o) => o.price);
      expect(new Set(prices).size, m.id).toBe(prices.length);
    }
  });

  it("matches the design's Fanigan offer at Horoshiy Pharm", () => {
    const o = OFFERS.find((x) => x.medicineId === "fanigan" && x.pharmacyId === "horoshiy");
    expect(o).toMatchObject({
      price: 35000,
      country: "India",
      manufacturer: "Kusum Healthcare Pvt. Ltd.",
      made: "12/01/24",
      expiry: "11/03/27",
    });
  });

  it("formats prices in sum", () => {
    expect(formatSum(35000)).toBe("35,000 sum");
  });

  it("gives every medicine without a photo its own box colour", () => {
    const colours = MEDICINES.filter((m) => !m.image).map((m) => m.color.toLowerCase());
    expect(colours.length).toBeGreaterThan(0);
    expect(new Set(colours).size).toBe(colours.length);
  });
});
