import { describe, expect, it } from "vitest";

import { formatSum, getMedicine, MEDICINES, OFFERS, offersFor, PHARMACIES } from "@/lib/data";

describe("demo data", () => {
  it("gives every medicine at least one offer", () => {
    for (const m of MEDICINES) expect(offersFor(OFFERS, m.id).length, m.id).toBeGreaterThan(0);
  });

  it("only has offers for known medicines and pharmacies, at most one per pair", () => {
    const seen = new Set<string>();
    for (const o of OFFERS) {
      expect(getMedicine(o.medicineId), o.medicineId).toBeDefined();
      expect(PHARMACIES.some((p) => p.id === o.pharmacyId), o.pharmacyId).toBe(true);
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
    expect(o).toMatchObject({ price: 35000, country: "India", manufacturer: "Kusum Healthcare Pvt. Ltd.", made: "12/01/24", expiry: "11/03/27" });
  });

  it("formats prices in sum", () => {
    expect(formatSum(35000)).toBe("35,000 sum");
  });
});
