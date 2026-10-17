import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { BookOpen, Candy, FlaskConical, MapPin, Package, Pill, Tablets, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { HealthWarning } from "@/components/HealthWarning";
import { SaveButton } from "@/components/MedicineCard";
import { MedicineImage } from "@/components/MedicineImage";
import { ContactButton, PharmacyLogo, StarRow } from "@/components/Pharmacy";
import { Shell, Stars } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { brandName, formatSum, getMedicine, getPharmacy } from "@/lib/data";
import { addToCart, useStore } from "@/lib/store";

export const Route = createFileRoute("/medicine/$id")({
  // ?pharmacy=<id> shows that pharmacy's offer instead of the best match (set by the Options page).
  validateSearch: (s: Record<string, unknown>): { pharmacy?: string } =>
    typeof s["pharmacy"] === "string" ? { pharmacy: s["pharmacy"] } : {},
  loader: ({ params }) => {
    const m = getMedicine(params.id);
    if (!m) throw notFound();
    return { m };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return { meta: [{ title: "Not found — PharmaGO" }, { name: "robots", content: "noindex" }] };
    const t = `${loaderData.m.name} — PharmaGO`;
    const d = `${loaderData.m.name}: price, pharmacies, dosage and delivery in Tashkent.`;
    return {
      meta: [
        { title: t },
        { name: "description", content: d },
        { property: "og:title", content: t },
        { property: "og:description", content: d },
      ],
    };
  },
  component: MedicinePage,
});

const FORM_ICON = {
  tablets: Tablets,
  capsules: Pill,
  lozenges: Candy,
  syrup: FlaskConical,
  sachets: Package,
} as const;

function MedicinePage() {
  const { m } = Route.useLoaderData();
  const { pharmacy: chosenId } = Route.useSearch();
  const { user, set, bestOffer, offersFor } = useStore();
  const nav = useNavigate();
  const [pack, setPack] = useState(0);
  const [ann, setAnn] = useState(false);
  const offers = offersFor(m.id);
  const chosen = chosenId ? offers.find((o) => o.pharmacyId === chosenId) : undefined;
  const offer = chosen ?? bestOffer(m.id);
  const ph = getPharmacy(offer.pharmacyId);
  const inStock = offer.qty > 0;
  const p = Math.round((offer.price * m.packs[pack]!.multiplier) / 100) * 100;
  const FormIcon = FORM_ICON[m.form];
  const add = () => {
    addToCart(set, { medicineId: m.id, pharmacyId: ph.id, pack, unitPrice: p });
    toast.success(`${m.name} added to cart`);
  };
  const info: [string, string][] = [
    ["Country of origin", offer.country],
    ["Manufacturer", offer.manufacturer],
    m.form === "syrup"
      ? ["Volume", m.packs[pack]!.label]
      : [`Number of ${m.form}`, String(m.packs[pack]!.tablets)],
    ["Antibiotic", m.antibiotic ? "Yes" : "No"],
    ["Prescription needed", m.prescription ? "Yes" : "No"],
    ["Age group", m.age],
  ];
  return (
    <Shell>
      <HealthWarning m={m} conditions={user?.conditions ?? []} />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-start">
        <div>
          <div className="relative">
            <MedicineImage m={m} size="hero" />
            <div className="absolute right-3 top-3">
              <SaveButton id={m.id} />
            </div>
          </div>
        </div>

        {/* On desktop this column spans both rows, so "About" sits under the image; on mobile it follows the card. */}
        <div className="md:row-span-2">
          <h1 className="flex items-center gap-3 text-3xl font-bold md:text-4xl">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
              <FormIcon className="h-7 w-7" aria-hidden />
            </span>
            {brandName(m)}
          </h1>
          <div className="mt-2 text-lg">
            <Stars r={m.rating} />
          </div>

          <p className="mt-5 text-lg font-semibold">Pack size</p>
          <div className="mt-2 flex flex-wrap items-stretch gap-3">
            {m.packs.map((pk, i) => (
              <button
                key={pk.label}
                onClick={() => setPack(i)}
                aria-pressed={pack === i}
                className={`flex min-h-16 flex-col justify-center rounded-2xl border-2 px-5 py-2 text-left ${pack === i ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}
              >
                {pack === i && <span className="text-sm font-semibold">Selected:</span>}
                <span className="text-lg font-bold">{pk.label}</span>
              </button>
            ))}
            {m.strength && (
              <span className="flex min-h-16 items-center rounded-2xl border-2 border-primary bg-primary-soft px-5 text-lg font-bold text-primary">
                {m.strength}
              </span>
            )}
          </div>

          <Button variant="outline" size="lg" className="mt-4" onClick={() => setAnn(true)}>
            <BookOpen /> Read annotation
          </Button>

          <section
            className="card-soft mt-6 border-2 border-primary p-5"
            aria-label={chosen ? "Selected pharmacy" : "Best match pharmacy"}
          >
            <p className="text-lg font-bold text-primary">
              {chosen ? "Selected pharmacy:" : "Best match pharmacy:"}
            </p>
            <div className="mt-3 flex items-center gap-4">
              <PharmacyLogo p={ph} />
              <div className="min-w-0">
                <h2 className="text-2xl font-bold">{ph.name}</h2>
                <div className="text-lg">
                  <StarRow r={ph.rating} />
                </div>
              </div>
            </div>
            <p className="mt-3 flex items-start gap-2 text-lg">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-primary" />
              {ph.address} · {ph.distanceKm} km
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-lg">
              <div className="rounded-xl bg-secondary px-3 py-2">
                <span className="block text-base text-muted-foreground">Made in:</span>
                <b>{offer.made}</b>
              </div>
              <div className="rounded-xl bg-secondary px-3 py-2">
                <span className="block text-base text-muted-foreground">Expires in:</span>
                <b>{offer.expiry}</b>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-lg">
              <span className="font-semibold">{ph.phone}</span>
              <ContactButton p={ph} />
            </div>
            <div className="mt-4 flex items-end justify-between gap-3 border-t pt-4">
              <span className="text-lg text-muted-foreground">Price</span>
              <span className="text-4xl font-bold text-primary">{formatSum(p)}</span>
            </div>
            {!inStock && (
              <p className="mt-2 text-lg font-bold text-destructive">
                Out of stock in this pharmacy
              </p>
            )}

            <Button
              asChild
              variant="outline"
              size="lg"
              className="mt-4 h-auto min-h-14 w-full whitespace-normal py-3 text-center"
            >
              <Link to="/compare/$id" params={{ id: m.id }}>
                Browse other options ({offers.length} pharmacies)
              </Link>
            </Button>
            <Button
              size="xl"
              className="mt-3 w-full uppercase tracking-wide"
              disabled={!inStock}
              onClick={add}
            >
              Add to cart
            </Button>
            <p className="my-2 text-center text-base font-bold text-muted-foreground">OR</p>
            <Button
              size="xl"
              variant="fast"
              className="w-full"
              disabled={!inStock}
              onClick={() => {
                add();
                nav({ to: "/checkout" });
              }}
            >
              <Zap /> Fast order
            </Button>
          </section>
        </div>

        <section>
          <h2 className="mb-3 text-2xl font-bold">About this medicine</h2>
          <dl className="card-soft divide-y">
            {info.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-5 py-3 text-lg">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="text-right font-semibold">{v}</dd>
              </div>
            ))}
            <div className="px-5 py-3 text-lg">
              <dt className="text-muted-foreground">How to take</dt>
              <dd className="font-semibold">{m.howTo}</dd>
            </div>
          </dl>
        </section>
      </div>

      <Dialog open={ann} onOpenChange={setAnn}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">Annotation</DialogTitle>
          </DialogHeader>
          <p className="text-lg leading-relaxed">{m.annotation}</p>
          <p className="text-lg">
            <b>Active ingredients:</b> {m.ingredients}
          </p>
          <p className="text-lg">
            <b>How to take:</b> {m.howTo}
          </p>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
