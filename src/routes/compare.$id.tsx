import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Clock, MapPin, Pencil, Plus, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { MedicineImage } from "@/components/MedicineImage";
import { ContactButton, PharmacyLogo, StarRow } from "@/components/Pharmacy";
import { PageTitle, Shell, soon } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { deliveryLabel, formatSum, getMedicine, getPharmacy, type Offer } from "@/lib/data";
import { cheapestOffer } from "@/lib/pricing";
import { addToCart, useStore } from "@/lib/store";

export const Route = createFileRoute("/compare/$id")({
  loader: ({ params }) => {
    const m = getMedicine(params.id);
    if (!m) throw notFound();
    return { m };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Not found — PharmaGO" }, { name: "robots", content: "noindex" }] };
    const t = `Options: ${loaderData.m.name} — PharmaGO`;
    const d = `Compare ${loaderData.m.name} prices, delivery times and distance across Tashkent pharmacies.`;
    return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }] };
  },
  component: Options,
});

type Sort = "Cheapest" | "Closest";
type Filter = "Free delivery" | "24/7";

const chip = (on: boolean) =>
  `min-h-12 rounded-full border-2 px-5 py-2 text-lg font-semibold ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`;

function Options() {
  const { m } = Route.useLoaderData();
  const { offers: allOffers, offersFor, set } = useStore();
  const [view, setView] = useState<"list" | "map">("list");
  const [sort, setSort] = useState<Sort>("Cheapest");
  const [filters, setFilters] = useState<Filter[]>([]);
  const [highlight, setHighlight] = useState<string | null>(null);

  const cheapest = cheapestOffer(allOffers, m.id);
  let rows = offersFor(m.id).map((o) => ({ o, p: getPharmacy(o.pharmacyId) }));
  if (filters.includes("Free delivery")) rows = rows.filter((r) => r.p.freeDelivery);
  if (filters.includes("24/7")) rows = rows.filter((r) => r.p.open247);
  // Out-of-stock offers always go last.
  rows.sort((a, b) => Number(b.o.qty > 0) - Number(a.o.qty > 0) || (sort === "Cheapest" ? a.o.price - b.o.price : a.p.distanceKm - b.p.distanceKm));

  const toggle = (f: Filter) => setFilters((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]));
  const pick = (pharmacyId: string) => {
    setHighlight(pharmacyId);
    document.getElementById(`option-${pharmacyId}`)?.scrollIntoView({ block: "center" });
  };

  return (
    <Shell>
      <div className="flex items-center gap-4">
        <MedicineImage m={m} size="thumb" className="mb-6" decorative />
        <PageTitle sub={m.name}>Options</PageTitle>
      </div>
      <div className="mb-4 inline-grid grid-cols-2 rounded-xl bg-secondary p-1">
        {(["list", "map"] as const).map((v) => (
          <button key={v} onClick={() => setView(v)} aria-pressed={view === v} className={`min-h-12 rounded-lg px-8 text-lg font-bold capitalize ${view === v ? "bg-card text-primary shadow" : ""}`}>{v}</button>
        ))}
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {(["Cheapest", "Closest"] as const).map((s) => (
          <button key={s} onClick={() => setSort(s)} aria-pressed={sort === s} className={chip(sort === s)}>{s}</button>
        ))}
        {(["Free delivery", "24/7"] as const).map((f) => (
          <button key={f} onClick={() => toggle(f)} aria-pressed={filters.includes(f)} className={chip(filters.includes(f))}>{f}</button>
        ))}
        <button onClick={() => soon("Changing location")} className="flex min-h-12 items-center gap-2 rounded-full border-2 border-primary bg-primary-soft px-5 py-2 text-lg font-semibold text-primary">
          Change location <Pencil className="h-5 w-5" aria-hidden />
        </button>
      </div>

      {view === "map" && <OptionsMap rows={rows} highlight={highlight} onPick={pick} />}

      {rows.length === 0 ? (
        <p className="card-soft p-6 text-lg">No pharmacies match these filters. Try removing a filter.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map(({ o, p }) => {
            const inStock = o.qty > 0;
            const isCheapest = cheapest && o.pharmacyId === cheapest.pharmacyId;
            return (
              <article
                key={p.id}
                id={`option-${p.id}`}
                className={`card-soft scroll-mt-24 p-5 transition ${highlight === p.id ? "ring-4 ring-primary" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-2xl font-bold">{p.name}</h2>
                    <p className="text-lg text-muted-foreground">{p.tagline}</p>
                    <div className="mt-1 text-lg"><StarRow r={p.rating} /></div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-lg">
                      <span className={`flex items-center gap-1 ${p.freeDelivery ? "font-semibold text-primary" : ""}`}><Truck className="h-5 w-5" aria-hidden />{deliveryLabel(p)}</span>
                      <span className="flex items-center gap-1"><Clock className="h-5 w-5" aria-hidden />{p.deliveryMin} min</span>
                      {p.open247 && <span className="font-semibold text-primary">Open 24/7</span>}
                    </div>
                  </div>
                  <PharmacyLogo p={p} size="h-16 w-16 text-2xl" />
                </div>

                <p className="mt-3 flex items-start gap-2 text-lg"><MapPin className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden />{p.address} · {p.distanceKm} km</p>
                <p className="mt-2 text-lg font-bold">{offerLine(o, m.drugClass, m.ingredients, m.packs[0]!.label)}</p>
                <p className="mt-1 text-lg text-muted-foreground">Made: <b className="text-foreground">{o.made}</b> · Expires: <b className="text-foreground">{o.expiry}</b></p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-lg">
                  <span className="font-semibold">{p.phone}</span>
                  <ContactButton p={p} />
                </div>

                <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t pt-4">
                  <div>
                    {isCheapest && <span className="mb-1 inline-block rounded-lg bg-primary px-3 py-1 text-base font-bold text-primary-foreground">Best price</span>}
                    <div className="text-3xl font-bold text-primary">{formatSum(o.price)}</div>
                    {!isCheapest && cheapest && inStock && <p className="text-lg text-muted-foreground">+{formatSum(o.price - cheapest.price)} vs cheapest</p>}
                    {!inStock && <p className="text-lg font-bold text-destructive">Out of stock</p>}
                  </div>
                  <Button
                    size="lg"
                    disabled={!inStock}
                    onClick={() => { addToCart(set, { medicineId: m.id, pharmacyId: p.id, pack: 0, unitPrice: o.price }); toast.success(`Added from ${p.name}`); }}
                  >
                    <Plus /> Add to cart
                  </Button>
                </div>
                <Link to="/medicine/$id" params={{ id: m.id }} search={{ pharmacy: p.id }} className="mt-3 inline-block text-lg font-semibold text-primary underline underline-offset-4">
                  Choose this pharmacy →
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </Shell>
  );
}

// "India | NSAID | Diclofenac sodium + Paracetamol | 100 tablets | Kusum Healthcare Pvt. Ltd."
const offerLine = (o: Offer, drugClass: string, ingredients: string, pack: string) =>
  [o.country, drugClass, ingredients, pack, o.manufacturer].join(" | ");

// Stylised demo map: pharmacies are placed by their x/y (in %), "You" is in the centre.
function OptionsMap({ rows, highlight, onPick }: { rows: { o: Offer; p: ReturnType<typeof getPharmacy> }[]; highlight: string | null; onPick: (id: string) => void }) {
  return (
    <div className="card-soft relative mb-6 h-96 overflow-hidden bg-secondary" role="group" aria-label="Map of pharmacies">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        <path d="M0 62 C 25 55, 45 75, 100 58" fill="none" stroke="oklch(0.8 0.08 230)" strokeWidth="4" />
        <path d="M0 30 H100 M0 82 H100 M30 0 V100 M68 0 V100" stroke="var(--card)" strokeWidth="2.2" />
        <path d="M0 0 L100 100" stroke="var(--card)" strokeWidth="1.6" />
      </svg>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fast px-3 py-1 text-lg font-bold text-fast-foreground shadow">You</div>
      {rows.map(({ o, p }) => (
        <button
          key={p.id}
          onClick={() => onPick(p.id)}
          aria-label={`${p.name}, ${formatSum(o.price)}`}
          className="absolute -translate-x-1/2 -translate-y-full text-center"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
        >
          <span className={`block whitespace-nowrap rounded-lg px-2 py-1 text-base font-bold shadow ${highlight === p.id ? "bg-primary text-primary-foreground" : "bg-card"}`}>{formatSum(o.price)}</span>
          <MapPin className={`mx-auto h-9 w-9 ${highlight === p.id ? "fill-fast" : "fill-primary"} text-primary-foreground`} />
        </button>
      ))}
    </div>
  );
}
