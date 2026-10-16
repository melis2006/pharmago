import { getPharmacy, offersFor, type Offer } from "./data";

// How much each factor counts when choosing the "best match" pharmacy. Price matters most.
export const BEST_MATCH_WEIGHTS = { price: 0.55, distance: 0.2, rating: 0.15, freeDelivery: 0.1 };

// 0 for the best value in the group, 1 for the worst. All-equal groups score 0.
const normalise = (v: number, values: number[], lowerIsBetter: boolean) => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return 0;
  const n = (v - min) / (max - min);
  return lowerIsBetter ? n : 1 - n;
};

// Scores the in-stock offers of a medicine; lower score is better. Sorted best first.
export function scoreOffers(offers: Offer[], medicineId: string) {
  const inStock = offersFor(offers, medicineId).filter((o) => o.qty > 0);
  const prices = inStock.map((o) => o.price);
  const distances = inStock.map((o) => getPharmacy(o.pharmacyId).distanceKm);
  const ratings = inStock.map((o) => getPharmacy(o.pharmacyId).rating);
  const w = BEST_MATCH_WEIGHTS;
  return inStock
    .map((offer) => {
      const p = getPharmacy(offer.pharmacyId);
      const score =
        w.price * normalise(offer.price, prices, true) +
        w.distance * normalise(p.distanceKm, distances, true) +
        w.rating * normalise(p.rating, ratings, false) +
        w.freeDelivery * (p.freeDelivery ? 0 : 1);
      return { offer, score };
    })
    .sort((a, b) => a.score - b.score);
}

// The best in-stock offer for a medicine, or undefined if no pharmacy has it in stock.
export function bestOffer(offers: Offer[], medicineId: string): Offer | undefined {
  return scoreOffers(offers, medicineId)[0]?.offer;
}

// The cheapest in-stock offer for a medicine.
export function cheapestOffer(offers: Offer[], medicineId: string): Offer | undefined {
  return offersFor(offers, medicineId)
    .filter((o) => o.qty > 0)
    .sort((a, b) => a.price - b.price)[0];
}
