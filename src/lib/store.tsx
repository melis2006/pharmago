import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Address } from "./address";
import { OFFERS, offersFor, type Condition, type Offer } from "./data";
import { bestOffer as pickBestOffer } from "./pricing";
import { deleteMyData, removeLegacyData, sanitizeUser, STORAGE_KEY } from "./privacy";
import { syncOrderStatuses, type OrderStatus } from "./tracking";

export type CartItem = {
  key: string;
  medicineId: string;
  pharmacyId: string;
  pack: number;
  qty: number;
  unitPrice: number;
};
// conditions are only kept when healthConsent is true (enforced on every update).
export type User = { name: string; phone: string; conditions: Condition[]; healthConsent: boolean };
export type { OrderStatus };
export type Order = {
  id: string;
  items: CartItem[];
  total: number;
  method: "drone" | "courier";
  address: string;
  status: OrderStatus; // kept in sync with the clock by the store (see src/lib/tracking.ts)
  createdAt: number;
  payment?: string; // "Cash", "Uzcard", ...
  where?: string; // "Doorstep", "Balcony", ...
  rating?: number;
};
export type Card = { last4: string; type: string };
export type Drone = {
  id: string;
  battery: number;
  status: "Idle" | "Flying" | "Charging";
  rangeKm: number;
};

type State = {
  cart: CartItem[];
  saved: string[];
  recent: string[];
  user: User | null;
  orders: Order[];
  addresses: Address[]; // exactly one isDefault when not empty (see src/lib/address.ts)
  cards: Card[];
  offers: Offer[];
  drones: Drone[];
  admin: boolean;
};

const initial: State = {
  cart: [],
  saved: [],
  recent: ["Paracetamol", "Headache", "Vitamin C"],
  user: null,
  orders: [],
  addresses: [], // entered by the user during registration, in Profile or at checkout
  cards: [],
  offers: OFFERS,
  drones: [
    { id: "DR-01", battery: 92, status: "Idle", rangeKm: 12 },
    { id: "DR-02", battery: 54, status: "Flying", rangeKm: 7 },
    { id: "DR-03", battery: 18, status: "Charging", rangeKm: 2 },
  ],
  admin: false,
};

type Ctx = State & {
  set: (fn: (s: State) => Partial<State>) => void;
  price: (pharmacyId: string, medicineId: string) => number;
  offersFor: (medicineId: string) => Offer[];
  // Best match offer (see src/lib/pricing.ts); falls back to an out-of-stock offer if none is in stock.
  bestOffer: (medicineId: string) => Offer;
  logout: () => void;
  // Removes everything PharmaGO stored in this browser and resets the app.
  deleteAllData: () => void;
  // False until saved data has been read from localStorage (always false during server rendering).
  hydrated: boolean;
};

const StoreCtx = createContext<Ctx | null>(null);

// Every change to the user goes through the consent rule (see src/lib/privacy.ts).
const withConsentRule = (s: State): State => (s.user ? { ...s, user: sanitizeUser(s.user) } : s);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      removeLegacyData(localStorage);
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState(withConsentRule({ ...initial, ...JSON.parse(raw) }));
    } catch {
      // Unreadable saved data: start fresh.
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    // The untouched initial state is not saved, so after "Delete my data" nothing is written back.
    if (loaded && state !== initial) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, loaded]);
  // While an order is being packaged or delivered, move its saved status along with the clock,
  // so Orders, Home and the admin panel are right even when the tracking page is closed.
  const hasActiveOrder = state.orders.some((o) => o.status !== "Delivered");
  useEffect(() => {
    if (!loaded || !hasActiveOrder) return;
    const tick = () =>
      setState((s) => {
        const orders = syncOrderStatuses(s.orders, Date.now());
        return orders === s.orders ? s : { ...s, orders };
      });
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [loaded, hasActiveOrder]);
  const set: Ctx["set"] = (fn) => setState((s) => withConsentRule({ ...s, ...fn(s) }));
  // Logging out drops the user (name, phone, health conditions) and their delivery addresses,
  // so the next person using this device does not see where they live.
  const logout = () => setState((s) => ({ ...s, user: null, addresses: [] }));
  const deleteAllData = () => {
    deleteMyData(localStorage);
    setState(initial);
  };
  const price = (ph: string, med: string) =>
    state.offers.find((o) => o.pharmacyId === ph && o.medicineId === med)?.price ?? 0;
  const forMedicine = (med: string) => offersFor(state.offers, med);
  // Every medicine has at least one offer in OFFERS (checked in src/test/data.test.ts).
  const best = (med: string) =>
    pickBestOffer(state.offers, med) ?? forMedicine(med)[0] ?? offersFor(OFFERS, med)[0]!;
  return (
    <StoreCtx.Provider
      value={{
        ...state,
        set,
        price,
        offersFor: forMedicine,
        bestOffer: best,
        logout,
        deleteAllData,
        hydrated: loaded,
      }}
    >
      {children}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore outside provider");
  return c;
}

export function addToCart(set: Ctx["set"], item: Omit<CartItem, "key" | "qty">, qty = 1) {
  const key = `${item.medicineId}:${item.pharmacyId}:${item.pack}`;
  set((s) => {
    const ex = s.cart.find((c) => c.key === key);
    return {
      cart: ex
        ? s.cart.map((c) => (c.key === key ? { ...c, qty: c.qty + qty } : c))
        : [...s.cart, { ...item, key, qty }],
    };
  });
}
