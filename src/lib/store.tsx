import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { MEDICINES, PHARMACIES, type Condition } from "./data";

export type CartItem = { key: string; medicineId: string; pharmacyId: string; pack: number; qty: number; unitPrice: number };
export type User = { name: string; phone: string; conditions: Condition[] };
export type OrderStatus = "Packaged" | "On the way" | "Delivered";
export type Order = {
  id: string;
  items: CartItem[];
  total: number;
  method: "drone" | "courier";
  address: string;
  status: OrderStatus;
  createdAt: number;
  rating?: number;
};
export type Card = { last4: string; type: string };
export type Stock = Record<string, { price: number; qty: number }>; // key pharmacyId:medicineId
export type Drone = { id: string; battery: number; status: "Idle" | "Flying" | "Charging"; rangeKm: number };

type State = {
  cart: CartItem[];
  saved: string[];
  recent: string[];
  user: User | null;
  orders: Order[];
  addresses: string[];
  cards: Card[];
  stock: Stock;
  drones: Drone[];
  admin: boolean;
};

const initialStock: Stock = {};
PHARMACIES.forEach((p) =>
  MEDICINES.forEach((m) => {
    initialStock[`${p.id}:${m.id}`] = { price: Math.round((m.price * p.priceFactor) / 100) * 100, qty: 20 + ((m.name.length * p.name.length) % 60) };
  }),
);

const initial: State = {
  cart: [],
  saved: [],
  recent: ["Paracetamol", "Headache", "Vitamin C"],
  user: null,
  orders: [],
  addresses: ["Amir Temur Ave 108, apt 12, Tashkent"],
  cards: [],
  stock: initialStock,
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
};

const StoreCtx = createContext<Ctx | null>(null);
const KEY = "pharmago-v1";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...initial, ...JSON.parse(raw) });
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, loaded]);
  const set: Ctx["set"] = (fn) => setState((s) => ({ ...s, ...fn(s) }));
  const price = (ph: string, med: string) => state.stock[`${ph}:${med}`]?.price ?? 0;
  return <StoreCtx.Provider value={{ ...state, set, price }}>{children}</StoreCtx.Provider>;
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
      cart: ex ? s.cart.map((c) => (c.key === key ? { ...c, qty: c.qty + qty } : c)) : [...s.cart, { ...item, key, qty }],
    };
  });
}
