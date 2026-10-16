import { createFileRoute, notFound } from "@tanstack/react-router";
import { Clock, Factory, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageTitle, Shell, Stars } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { formatSum, getMedicine, getPharmacy } from "@/lib/data";
import { addToCart, useStore } from "@/lib/store";

export const Route = createFileRoute("/compare/$id")({
  loader: ({ params }) => {
    const m = getMedicine(params.id);
    if (!m) throw notFound();
    return { m };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Not found — PharmaGO" }, { name: "robots", content: "noindex" }] };
    const t = `Compare prices: ${loaderData.m.name} — PharmaGO`;
    const d = `Compare ${loaderData.m.name} prices, delivery times and distance across Tashkent pharmacies.`;
    return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }] };
  },
  component: Compare,
});

const FILTERS = ["Cheapest", "Closest", "Free delivery", "24/7"] as const;

function Compare() {
  const { m } = Route.useLoaderData();
  const { price, set, offersFor } = useStore();
  const [view, setView] = useState<"list" | "map">("list");
  const [f, setF] = useState<(typeof FILTERS)[number] | null>(null);
  const offers = offersFor(m.id);
  const offerAt = (pharmacyId: string) => offers.find((o) => o.pharmacyId === pharmacyId)!;
  let list = offers.map((o) => getPharmacy(o.pharmacyId));
  if (f === "Cheapest") list.sort((a, b) => price(a.id, m.id) - price(b.id, m.id));
  if (f === "Closest") list.sort((a, b) => a.distanceKm - b.distanceKm);
  if (f === "Free delivery") list = list.filter((p) => p.freeDelivery);
  if (f === "24/7") list = list.filter((p) => p.open247);
  return (
    <Shell>
      <PageTitle sub="Same medicine, different pharmacies">{m.name}</PageTitle>
      <div className="mb-4 inline-grid grid-cols-2 rounded-xl bg-secondary p-1">
        {(["list", "map"] as const).map((v) => (
          <button key={v} onClick={() => setView(v)} className={`rounded-lg px-8 py-2.5 text-lg font-bold capitalize ${view === v ? "bg-card text-primary shadow" : ""}`}>{v}</button>
        ))}
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((x) => (
          <button key={x} onClick={() => setF(f === x ? null : x)} className={`rounded-full border-2 px-5 py-2 text-lg font-semibold ${f === x ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>{x}</button>
        ))}
      </div>
      {view === "map" && (
        <div className="card-soft relative mb-6 h-80 overflow-hidden bg-secondary">
          <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:40px_40px]" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fast px-3 py-1 font-bold text-fast-foreground">You</div>
          {list.map((p) => (
            <div key={p.id} className="absolute -translate-x-1/2 -translate-y-full text-center" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
              <div className="rounded-lg bg-card px-2 py-1 text-sm font-bold shadow">{formatSum(price(p.id, m.id))}</div>
              <MapPin className="mx-auto h-8 w-8 fill-primary text-primary-foreground" />
            </div>
          ))}
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((p) => {
          const pr = price(p.id, m.id);
          return (
            <div key={p.id} className="card-soft p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-2xl font-bold">{p.name}</h2>
                  <div className="flex flex-wrap gap-x-3 text-lg text-muted-foreground">
                    <Stars r={p.rating} />
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{p.deliveryMin} min</span>
                    {p.open247 && <span className="font-semibold text-primary">24/7</span>}
                    {p.freeDelivery && <span className="font-semibold text-primary">Free delivery</span>}
                  </div>
                </div>
                <div className="shrink-0 text-2xl font-bold text-primary">{formatSum(pr)}</div>
              </div>
              <ul className="mt-3 space-y-1 text-lg">
                <li className="flex items-center gap-2"><MapPin className="h-5 w-5 shrink-0" />{p.address} · {p.distanceKm} km</li>
                <li className="flex items-center gap-2"><Factory className="h-5 w-5 shrink-0" />{offerAt(p.id).country} · {offerAt(p.id).manufacturer}</li>
                <li className="flex items-center gap-2"><Phone className="h-5 w-5 shrink-0" />{p.phone}</li>
              </ul>
              <Button className="mt-4 w-full" size="lg" onClick={() => { addToCart(set, { medicineId: m.id, pharmacyId: p.id, pack: 0, unitPrice: pr }); toast.success(`Added from ${p.name}`); }}>Add to cart</Button>
            </div>
          );
        })}
      </div>
    </Shell>
  );
}
