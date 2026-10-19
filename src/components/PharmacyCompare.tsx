import { Clock, MapPin, Plus, Truck } from "lucide-react";
import { toast } from "sonner";
import { PharmacyLogo } from "@/components/Pharmacy";
import { Button } from "@/components/ui/button";
import { formatSum, type Medicine } from "@/lib/data";
import { pharmacyComparison } from "@/lib/pricing";
import { addToCart, useStore } from "@/lib/store";

// Medicine page: "Same medicine in other pharmacies" — every pharmacy that sells this medicine,
// cheapest first, with the price for the selected pack and the difference from the pharmacy
// currently shown in the Best match card.
export function PharmacyCompare({
  m,
  pack,
  currentPharmacyId,
  onChoose,
}: {
  m: Medicine;
  pack: number;
  currentPharmacyId: string;
  onChoose: (pharmacyId: string, isBestMatch: boolean) => void;
}) {
  const { offers, set } = useStore();
  const packInfo = m.packs[pack]!;
  const { rows, min, max, maxSaving } = pharmacyComparison(
    offers,
    m.id,
    currentPharmacyId,
    packInfo.multiplier,
  );
  return (
    <section aria-labelledby="other-pharmacies" className="scroll-mt-48">
      <h2 id="other-pharmacies" className="text-2xl font-bold">
        Same medicine in other pharmacies
      </h2>
      <p className="mt-1 text-lg">
        Available in <b>{rows.length} pharmacies</b> · from <b>{formatSum(min)}</b> to{" "}
        <b>{formatSum(max)}</b> ·{" "}
        {maxSaving > 0 ? (
          <>
            you can save up to <b className="text-primary">{formatSum(maxSaving)}</b>
          </>
        ) : (
          "you already see the lowest price"
        )}
      </p>
      <p className="text-base text-muted-foreground">Prices for {packInfo.label}.</p>

      <ul className="mt-4 grid gap-3 lg:grid-cols-2">
        {rows.map((r) => {
          const inStock = r.o.qty > 0;
          return (
            <li
              key={r.p.id}
              className={`card-soft grid gap-3 p-4 ${r.isCurrent ? "border-2 border-primary" : ""}`}
            >
              <div className="flex items-start gap-3">
                <PharmacyLogo p={r.p} size="h-12 w-12 text-lg" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-bold leading-tight">{r.p.name}</h3>
                  {(r.isLowest || r.isBestMatch) && (
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {r.isLowest && (
                        <span className="rounded-lg bg-primary px-2 py-0.5 text-base font-bold text-primary-foreground">
                          Lowest price
                        </span>
                      )}
                      {r.isBestMatch && (
                        <span className="rounded-lg border-2 border-primary px-2 py-0.5 text-base font-bold text-primary">
                          Best match
                        </span>
                      )}
                    </div>
                  )}
                  {/* details stacked under the name so they stay readable on phones */}
                  <p className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-base text-muted-foreground">
                    <span>
                      <span className="text-star">★</span> {r.p.rating.toFixed(1)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-4 w-4" aria-hidden /> {r.p.distanceKm} km
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-4 w-4" aria-hidden /> {r.p.deliveryMin} min
                    </span>
                    {r.p.freeDelivery && (
                      <span className="inline-flex items-center gap-1 font-semibold text-primary">
                        <Truck className="h-4 w-4" aria-hidden /> Free delivery
                      </span>
                    )}
                    <span>Made in {r.o.country}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="whitespace-nowrap text-xl font-bold">{formatSum(r.price)}</div>
                  {r.isCurrent ? (
                    <span className="text-base font-bold text-primary">Selected</span>
                  ) : r.diff < 0 ? (
                    <span className="text-base font-bold text-primary">−{formatSum(-r.diff)}</span>
                  ) : (
                    <span className="text-base text-muted-foreground">+{formatSum(r.diff)}</span>
                  )}
                  {!inStock && (
                    <span className="block text-base font-bold text-destructive">Out of stock</span>
                  )}
                </div>
                {!r.isCurrent && (
                  <Button
                    variant="outline"
                    className="px-3 text-lg"
                    onClick={() => onChoose(r.p.id, r.isBestMatch)}
                    aria-label={`Choose ${r.p.name}`}
                  >
                    Choose
                  </Button>
                )}
                <Button
                  className="px-3 text-lg"
                  disabled={!inStock}
                  aria-label={`Add to cart from ${r.p.name}`}
                  onClick={() => {
                    addToCart(set, {
                      medicineId: m.id,
                      pharmacyId: r.p.id,
                      pack,
                      unitPrice: r.price,
                    });
                    toast.success(`${m.name} (${packInfo.label}) added`, {
                      description: `From ${r.p.name}, ${formatSum(r.price)}`,
                    });
                  }}
                >
                  <Plus /> Add
                  {/* "to cart" is dropped on very narrow phones so price and buttons fit one line */}
                  <span className="-ml-1 max-[419px]:hidden">to cart</span>
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
