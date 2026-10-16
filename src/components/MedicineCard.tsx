import { Link } from "@tanstack/react-router";
import { Heart, MapPin } from "lucide-react";
import { toast } from "sonner";
import { MedicineImage } from "@/components/MedicineImage";
import { Button } from "@/components/ui/button";
import { formatSum, getPharmacy, type Medicine } from "@/lib/data";
import { addToCart, useStore } from "@/lib/store";
import { Stars } from "./Shell";

export function SaveButton({ id }: { id: string }) {
  const { saved, set } = useStore();
  const on = saved.includes(id);
  return (
    <button
      aria-label={on ? "Remove from saved" : "Save"}
      onClick={() => set((s) => ({ saved: on ? s.saved.filter((x) => x !== id) : [...s.saved, id] }))}
      className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-card shadow"
    >
      <Heart className={`h-6 w-6 ${on ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
    </button>
  );
}

export function MedicineCard({ m, showMeta }: { m: Medicine; showMeta?: boolean }) {
  const { set, bestOffer } = useStore();
  const offer = bestOffer(m.id);
  const p = offer.price;
  return (
    <div className="card-soft flex flex-col overflow-hidden">
      <div className="relative">
        <Link to="/medicine/$id" params={{ id: m.id }}>
          <MedicineImage m={m} />
        </Link>
        <div className="absolute right-2 top-2"><SaveButton id={m.id} /></div>
        {m.prescription && <span className="absolute left-2 top-2 rounded-lg bg-destructive px-2 py-1 text-sm font-bold text-destructive-foreground">Rx</span>}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link to="/medicine/$id" params={{ id: m.id }} className="text-xl font-bold leading-tight hover:underline">{m.name}</Link>
        {showMeta && (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Stars r={m.rating} />
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{getPharmacy(offer.pharmacyId).distanceKm} km</span>
          </div>
        )}
        <div className="mt-auto text-2xl font-bold text-primary">{formatSum(p)}</div>
        <Button
          size="lg"
          onClick={() => {
            addToCart(set, { medicineId: m.id, pharmacyId: offer.pharmacyId, pack: 0, unitPrice: p });
            toast.success(`${m.name} added to cart`);
          }}
        >
          Add to cart
        </Button>
      </div>
    </div>
  );
}
