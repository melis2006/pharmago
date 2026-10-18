import { describe, expect, it } from "vitest";

import {
  deliveryWindow,
  isCurrentOrder,
  PACKAGING_MS,
  pointOnRoute,
  ROUTE,
  syncOrderStatuses,
  trackingState,
  TRAVEL_MS,
  type TrackableOrder,
} from "@/lib/tracking";

const T0 = new Date(2026, 9, 18, 9, 52, 0).getTime();
const order = (over: Partial<TrackableOrder> = {}): TrackableOrder => ({
  createdAt: T0,
  status: "Packaged",
  method: "drone",
  ...over,
});

describe("tracking from the order's creation time", () => {
  it("is packaging right after the order", () => {
    expect(trackingState(order(), T0 + 1_500)).toEqual({ stage: 0, packaging: 0.5, travel: 0 });
  });

  it("is on the way after packaging, halfway along the route after half the travel time", () => {
    expect(trackingState(order(), T0 + PACKAGING_MS + TRAVEL_MS / 2)).toEqual({
      stage: 1,
      packaging: 1,
      travel: 0.5,
    });
  });

  it("is delivered after packaging and travel time", () => {
    expect(trackingState(order(), T0 + PACKAGING_MS + TRAVEL_MS).stage).toBe(2);
  });

  it("continues where it would be when the user comes back later (no restart)", () => {
    // Same order looked at twice: the second look is further along, not back at the start.
    const first = trackingState(order(), T0 + 5_000);
    const later = trackingState(order(), T0 + 15_000);
    expect(later.travel).toBeGreaterThan(first.travel);
  });

  it("never shows less than the status the admin set", () => {
    expect(trackingState(order({ status: "On the way" }), T0 + 1_000).stage).toBe(1);
    expect(trackingState(order({ status: "Delivered" }), T0 + 1_000)).toMatchObject({
      stage: 2,
      travel: 1,
    });
  });

  it("knows which orders are still current", () => {
    expect(isCurrentOrder(order(), T0 + 10_000)).toBe(true);
    expect(isCurrentOrder(order(), T0 + 60_000)).toBe(false);
  });

  it("syncs saved statuses with the clock and keeps the same array when nothing changed", () => {
    const orders = [order(), order({ createdAt: T0 - 60_000, status: "Delivered" })];
    const synced = syncOrderStatuses(orders, T0 + 5_000);
    expect(synced.map((o) => o.status)).toEqual(["On the way", "Delivered"]);
    expect(syncOrderStatuses(synced, T0 + 6_000)).toBe(synced);
  });
});

describe("delivery window and route", () => {
  it("shows a time window like 10:02–10:09 for drones and a longer one for couriers", () => {
    expect(deliveryWindow(order())).toBe("10:02–10:09");
    expect(deliveryWindow(order({ method: "courier" }))).toBe("10:12–10:22");
  });

  it("starts the route at the pharmacy and ends it at the home", () => {
    expect(pointOnRoute(0)).toEqual(ROUTE.from);
    expect(pointOnRoute(1)).toEqual(ROUTE.to);
    expect(pointOnRoute(2)).toEqual(ROUTE.to);
  });
});
