// US1: As an elderly user, I want to see the same medicine in different pharmacies,
// so that I can buy it at the lowest price.
import { describe, expect, it } from "vitest";

import { MEDICINES, OFFERS, type Offer } from "@/lib/data";
import { bestOffer, cheapestOffer, compareOptions, orderTotals } from "@/lib/pricing";

const withQty = (medicineId: string, pharmacyId: string, qty: number): Offer[] =>
  OFFERS.map((o) => (o.medicineId === medicineId && o.pharmacyId === pharmacyId ? { ...o, qty } : o));

describe("US1: compare the same medicine across pharmacies", () => {
  it("US1-AC1: every medicine is offered by at least 3 pharmacies, each with a price", () => {
    for (const m of MEDICINES) {
      const rows = compareOptions(OFFERS, m.id, "Cheapest");
      expect(rows.length, m.id).toBeGreaterThanOrEqual(3);
      expect(new Set(rows.map((r) => r.p.id)).size, m.id).toBe(rows.length);
      for (const r of rows) expect(r.o.price, `${m.id} at ${r.p.id}`).toBeGreaterThan(0);
    }
  });

  it("US1-AC2: with Cheapest selected, the lowest price is shown first", () => {
    for (const m of MEDICINES) {
      const prices = compareOptions(OFFERS, m.id, "Cheapest").map((r) => r.o.price);
      expect(prices[0], m.id).toBe(Math.min(...prices));
      expect(prices, m.id).toEqual([...prices].sort((a, b) => a - b));
    }
  });

  it("US1-AC2: cheapest offer is first for Fanigan (Horoshiy Pharm, 35,000 sum)", () => {
    const [first] = compareOptions(OFFERS, "fanigan", "Cheapest");
    expect(first?.p.name).toBe("Horoshiy Pharm");
    expect(first?.o.price).toBe(35000);
  });

  it("US1-AC3: the best match pharmacy for Fanigan is Horoshiy Pharm", () => {
    expect(bestOffer(OFFERS, "fanigan")?.pharmacyId).toBe("horoshiy");
  });
});

describe("price comparison details", () => {
  it("out-of-stock offers are excluded from best match and cheapest", () => {
    const offers = withQty("fanigan", "horoshiy", 0);
    expect(bestOffer(offers, "fanigan")?.pharmacyId).not.toBe("horoshiy");
    expect(cheapestOffer(offers, "fanigan")?.pharmacyId).not.toBe("horoshiy");
  });

  it("out-of-stock offers are listed last on the Options page", () => {
    const rows = compareOptions(withQty("fanigan", "horoshiy", 0), "fanigan", "Cheapest");
    expect(rows.at(-1)?.p.id).toBe("horoshiy");
    expect(rows.slice(0, -1).every((r) => r.o.qty > 0)).toBe(true);
  });

  it("returns no best match when no pharmacy has the medicine in stock", () => {
    const offers = OFFERS.map((o) => ({ ...o, qty: 0 }));
    expect(bestOffer(offers, "fanigan")).toBeUndefined();
    expect(cheapestOffer(offers, "fanigan")).toBeUndefined();
  });

  it("Closest sorts pharmacies by distance", () => {
    const distances = compareOptions(OFFERS, "paracetamol", "Closest").map((r) => r.p.distanceKm);
    expect(distances).toEqual([...distances].sort((a, b) => a - b));
  });

  it("Free delivery filter keeps only pharmacies with free delivery", () => {
    const all = compareOptions(OFFERS, "paracetamol", "Cheapest");
    const free = compareOptions(OFFERS, "paracetamol", "Cheapest", ["Free delivery"]);
    expect(free.length).toBeGreaterThan(0);
    expect(free.length).toBeLessThan(all.length);
    expect(free.every((r) => r.p.freeDelivery)).toBe(true);
  });

  it("24/7 filter keeps only pharmacies open 24/7", () => {
    const open = compareOptions(OFFERS, "paracetamol", "Cheapest", ["24/7"]);
    expect(open.map((r) => r.p.name)).toEqual(["MedLine 24/7"]);
  });

  it("filters combine: free delivery and 24/7 together can leave no pharmacy", () => {
    expect(compareOptions(OFFERS, "paracetamol", "Cheapest", ["Free delivery", "24/7"])).toEqual([]);
  });
});

describe("order totals", () => {
  const items = [
    { unitPrice: 35000, qty: 1 },
    { unitPrice: 13900, qty: 2 },
  ];

  it("adds the drone fee (15,000 sum) to the subtotal", () => {
    expect(orderTotals(items, "drone")).toEqual({ subtotal: 62800, delivery: 15000, total: 77800 });
  });

  it("adds the courier fee (10,000 sum) to the subtotal", () => {
    expect(orderTotals(items, "courier")).toEqual({ subtotal: 62800, delivery: 10000, total: 72800 });
  });

  it("charges no delivery for an empty order", () => {
    expect(orderTotals([], "drone")).toEqual({ subtotal: 0, delivery: 0, total: 0 });
  });
});
