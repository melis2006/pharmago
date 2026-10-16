import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, MapPin, Phone, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import medImg from "@/assets/medicine.jpg";
import { SaveButton } from "@/components/MedicineCard";
import { Shell, Stars } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CONDITIONS, formatUZS, getMedicine, PHARMACIES } from "@/lib/data";
import { addToCart, useStore } from "@/lib/store";

export const Route = createFileRoute("/medicine/$id")({
  loader: ({ params }) => {
    const m = getMedicine(params.id);
    if (!m) throw notFound();
    return { m };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Not found — PharmaGO" }, { name: "robots", content: "noindex" }] };
    const t = `${loaderData.m.name} — PharmaGO`;
    const d = `${loaderData.m.name}: price, pharmacies, dosage and delivery in Tashkent.`;
    return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }] };
  },
  component: MedicinePage,
});

function MedicinePage() {
  const { m } = Route.useLoaderData();
  const { user, set, price } = useStore();
  const nav = useNavigate();
  const [pack, setPack] = useState(0);
  const [ann, setAnn] = useState(false);
  const best = PHARMACIES[0]!;
  const p = Math.round((price(best.id, m.id) * m.packs[pack]!.multiplier) / 100) * 100;
  const warnings = user ? m.conflicts.filter((c) => user.conditions.includes(c.condition)) : [];
  const add = () => {
    addToCart(set, { medicineId: m.id, pharmacyId: best.id, pack, unitPrice: p });
    toast.success("Added to cart");
  };
  const info: [string, string][] = [
    ["Country of origin", m.country],
    ["Manufacturer", m.manufacturer],
    ["Made", m.made],
    ["Expiry date", m.expiry],
    ["Number of tablets", String(m.packs[pack]!.tablets)],
    ["Antibiotic", m.antibiotic ? "Yes" : "No"],
    ["Prescription needed", m.prescription ? "Yes" : "No"],
    ["Age group", m.age],
  ];
  return (
    <Shell>
      {warnings.length > 0 && (
        <div role="alert" className="mb-6 rounded-2xl border-4 border-destructive bg-destructive-soft p-5">
          <div className="flex items-center gap-3 text-2xl font-bold text-destructive"><AlertTriangle className="h-8 w-8 shrink-0" /> Not recommended for you</div>
          <ul className="mt-2 space-y-1 text-lg">
            {warnings.map((w) => (
              <li key={w.condition}><b>{CONDITIONS.find((c) => c.id === w.condition)?.label}:</b> {w.reason}</li>
            ))}
          </ul>
          <p className="mt-2 text-lg font-bold">Please consult your doctor before taking this medicine.</p>
        </div>
      )}
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative">
          <img src={medImg} alt={m.name} width={816} height={816} className="w-full rounded-3xl" />
          <div className="absolute right-3 top-3"><SaveButton id={m.id} /></div>
        </div>
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">{m.name}</h1>
          <div className="mt-2 text-lg"><Stars r={m.rating} /></div>
          <p className="mt-5 text-lg font-semibold">Pack size</p>
          <div className="mt-2 flex flex-wrap gap-3">
            {m.packs.map((pk, i) => (
              <button key={pk.label} onClick={() => setPack(i)} className={`rounded-xl border-2 px-5 py-3 text-lg font-bold ${pack === i ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>
                {pk.label}
              </button>
            ))}
          </div>
          <Button variant="link" className="mt-2 px-0 text-lg" onClick={() => setAnn(true)}>Read annotation →</Button>
          <dl className="card-soft mt-3 divide-y">
            {info.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-5 py-3 text-lg">
                <dt className="text-muted-foreground">{k}</dt><dd className="text-right font-semibold">{v}</dd>
              </div>
            ))}
            <div className="px-5 py-3 text-lg"><dt className="text-muted-foreground">How to take</dt><dd className="font-semibold">{m.howTo}</dd></div>
          </dl>
        </div>
      </div>

      <section className="card-soft mt-8 p-5">
        <p className="text-lg font-semibold text-primary">Best match pharmacy</p>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">{best.name}</h2>
            <div className="mt-1 flex flex-wrap gap-x-4 text-lg text-muted-foreground">
              <Stars r={best.rating} />
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{best.address} · {best.distanceKm} km</span>
            </div>
            <div className="mt-2 flex items-center gap-3 text-lg">
              <span>{best.phone}</span>
              <Button asChild size="sm" variant="secondary"><a href={`tel:${best.phone.replace(/\s/g, "")}`}><Phone /> Contact</a></Button>
            </div>
          </div>
          <div className="text-3xl font-bold text-primary">{formatUZS(p)}</div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Button asChild variant="outline" size="lg"><Link to="/compare/$id" params={{ id: m.id }}>Browse other options</Link></Button>
          <Button size="lg" onClick={add}>Add to cart</Button>
          <Button size="lg" variant="fast" onClick={() => { add(); nav({ to: "/checkout" }); }}><Zap /> Fast order</Button>
        </div>
      </section>

      <Dialog open={ann} onOpenChange={setAnn}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-2xl">Annotation</DialogTitle></DialogHeader>
          <p className="text-lg leading-relaxed">{m.annotation}</p>
          <p className="text-lg"><b>How to take:</b> {m.howTo}</p>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
