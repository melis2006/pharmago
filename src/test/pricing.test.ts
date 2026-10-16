import { describe, expect, it } from "vitest";

import { OFFERS, type Offer } from "@/lib/data";
import { bestOffer, cheapestOffer, scoreOffers } from "@/lib/pricing";

describe("best match pharmacy", () => {
  it("picks Horoshiy Pharm for Fanigan, as in the design", () => {
    expect(bestOffer(OFFERS, "fanigan")?.pharmacyId).toBe("horoshiy");
  });

  it("skips pharmacies that are out of stock", () => {
    const offers = OFFERS.map((o) => (o.medicineId === "fanigan" && o.pharmacyId === "horoshiy" ? { ...o, qty: 0 } : o));
    const best = bestOffer(offers, "fanigan");
    expect(best).toBeDefined();
    expect(best?.pharmacyId).not.toBe("horoshiy");
  });

  it("returns undefined when nothing is in stock", () => {
    const offers = OFFERS.map((o) => ({ ...o, qty: 0 }));
    expect(bestOffer(offers, "fanigan")).toBeUndefined();
  });

  it("lets price outweigh distance", () => {
    // Shifo is the closest Fanigan seller; making it far cheaper must make it the best match.
    const offers: Offer[] = OFFERS.map((o) => (o.medicineId === "fanigan" && o.pharmacyId === "shifo" ? { ...o, price: 20000 } : o));
    expect(bestOffer(offers, "fanigan")?.pharmacyId).toBe("shifo");
  });

  it("sorts scores best first", () => {
    const scores = scoreOffers(OFFERS, "paracetamol").map((s) => s.score);
    expect(scores).toEqual([...scores].sort((a, b) => a - b));
  });

  it("finds the cheapest offer", () => {
    expect(cheapestOffer(OFFERS, "fanigan")?.price).toBe(35000);
  });
});
