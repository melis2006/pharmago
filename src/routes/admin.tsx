import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { formatSum, getMedicine, PHARMACIES, type Offer } from "@/lib/data";
import { seo } from "@/lib/seo";
import { useStore, type OrderStatus } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => seo("Admin panel", "Manage orders, pharmacy stock and the drone fleet."),
  component: Admin,
});

const inputCls = "h-12 w-full rounded-xl border-2 border-input bg-card px-3 text-lg outline-none focus:border-primary";

function Admin() {
  const { admin, set } = useStore();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  if (!admin)
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <form className="card-soft grid w-full max-w-sm gap-4 p-6" onSubmit={(e) => { e.preventDefault(); if (u === "admin" && p === "admin") set(() => ({ admin: true })); else toast.error("Wrong login. Demo: admin / admin"); }}>
          <Logo size="text-3xl" />
          <h1 className="text-2xl font-bold">Admin login</h1>
          <input className={inputCls} placeholder="Username" value={u} onChange={(e) => setU(e.target.value)} />
          <input className={inputCls} type="password" placeholder="Password" value={p} onChange={(e) => setP(e.target.value)} />
          <Button size="lg" type="submit">Sign in</Button>
          <p className="text-muted-foreground">Demo: admin / admin</p>
          <Link to="/home" className="text-primary underline">Back to site</Link>
        </form>
      </div>
    );
  return <Panel />;
}

function Panel() {
  const { orders, offers, drones, set } = useStore();
  const [tab, setTab] = useState<"orders" | "stock" | "drones">("orders");
  const [ph, setPh] = useState(PHARMACIES[0]!.id);
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3"><Logo /><span className="text-xl font-bold">Admin</span></div>
        <Button variant="outline" onClick={() => set(() => ({ admin: false }))}>Log out</Button>
      </div>
      <div className="my-6 inline-grid grid-cols-3 rounded-xl bg-secondary p-1">
        {(["orders", "stock", "drones"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-6 py-2.5 text-lg font-bold capitalize ${tab === t ? "bg-card text-primary shadow" : ""}`}>{t}</button>
        ))}
      </div>
      {tab === "orders" && (orders.length === 0 ? <p className="text-lg">No orders yet.</p> : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="card-soft flex flex-wrap items-center justify-between gap-3 p-4">
              <div><p className="text-lg font-bold">{o.id} · {formatSum(o.total)} · {o.method}</p><p className="text-muted-foreground">{o.items.map((i) => getMedicine(i.medicineId)?.name).join(", ")} → {o.address}</p></div>
              <select value={o.status} onChange={(e) => set((s) => ({ orders: s.orders.map((x) => (x.id === o.id ? { ...x, status: e.target.value as OrderStatus } : x)) }))} className="h-12 rounded-xl border-2 border-input bg-card px-3 text-lg">
                {["Packaged", "On the way", "Delivered"].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          ))}
        </div>
      ))}
      {tab === "stock" && (
        <div>
          <select value={ph} onChange={(e) => setPh(e.target.value)} className="mb-4 h-12 rounded-xl border-2 border-input bg-card px-3 text-lg">
            {PHARMACIES.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div className="card-soft divide-y">
            {offers.filter((o) => o.pharmacyId === ph).map((o) => {
              const upd = (patch: Partial<Offer>) =>
                set((st) => ({ offers: st.offers.map((x) => (x.pharmacyId === o.pharmacyId && x.medicineId === o.medicineId ? { ...x, ...patch } : x)) }));
              const fields: { label: string; key: "country" | "manufacturer" | "made" | "expiry" }[] = [
                { label: "Country", key: "country" },
                { label: "Manufacturer", key: "manufacturer" },
                { label: "Made", key: "made" },
                { label: "Expiry", key: "expiry" },
              ];
              return (
                <div key={o.medicineId} className="grid gap-3 p-3 text-lg">
                  <div className="grid grid-cols-[1fr_130px_90px] items-center gap-3">
                    <span className="font-semibold">{getMedicine(o.medicineId)?.name}</span>
                    <input type="number" aria-label="Price" className={inputCls} value={o.price} onChange={(e) => upd({ price: Number(e.target.value) })} />
                    <input type="number" aria-label="Quantity" className={inputCls} value={o.qty} onChange={(e) => upd({ qty: Number(e.target.value) })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {fields.map((f) => (
                      <input key={f.key} aria-label={f.label} placeholder={f.label} className={inputCls} value={o[f.key]} onChange={(e) => upd({ [f.key]: e.target.value })} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {tab === "drones" && (
        <div className="grid gap-4 md:grid-cols-3">
          {drones.map((d) => (
            <div key={d.id} className="card-soft p-5 text-lg">
              <p className="text-2xl font-bold">🚁 {d.id}</p>
              <p className="mt-2">Battery: <b>{d.battery}%</b></p>
              <div className="mt-1 h-3 rounded-full bg-secondary"><div className={`h-3 rounded-full ${d.battery < 25 ? "bg-destructive" : "bg-primary"}`} style={{ width: `${d.battery}%` }} /></div>
              <p className="mt-2">Status: <b>{d.status}</b></p>
              <p>Range: <b>{d.rangeKm} km</b></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
