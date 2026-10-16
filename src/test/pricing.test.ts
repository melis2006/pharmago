import { describe, expect, it } from "vitest";

import { OFFERS, type Offer } from "@/lib/data";
import { bestOffer, scoreOffers } from "@/lib/pricing";

// Best-match scoring internals. The user-story checks (US1-AC3 etc.) are in price-comparison.test.ts.
describe("best match scoring", () => {
  it("lets price outweigh distance", () => {
    // Shifo is the closest Fanigan seller; making it far cheaper must make it the best match.
    const offers: Offer[] = OFFERS.map((o) => (o.medicineId === "fanigan" && o.pharmacyId === "shifo" ? { ...o, price: 20000 } : o));
    expect(bestOffer(offers, "fanigan")?.pharmacyId).toBe("shifo");
  });

  it("sorts scores best first", () => {
    const scores = scoreOffers(OFFERS, "paracetamol").map((s) => s.score);
    expect(scores).toEqual([...scores].sort((a, b) => a - b));
  });
});
