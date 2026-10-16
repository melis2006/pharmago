import { Phone, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { Pharmacy } from "@/lib/data";

// Demo logo: the pharmacy's initials on its brand colour.
export function PharmacyLogo({ p, size = "h-14 w-14 text-xl" }: { p: Pharmacy; size?: string }) {
  const initials = p.name
    .split(/[\s']+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (
    <span aria-hidden className={`grid shrink-0 place-items-center rounded-2xl font-display font-bold text-white shadow ${size}`} style={{ backgroundColor: p.color }}>
      {initials}
    </span>
  );
}

// Five stars plus the number, e.g. ★★★★☆ 4.5
export function StarRow({ r }: { r: number }) {
  return (
    <span className="inline-flex items-center gap-1 font-semibold" aria-label={`Rating ${r.toFixed(1)} out of 5`}>
      <span className="inline-flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((n) => {
          const fill = Math.min(1, Math.max(0, r - (n - 1))); // 4.5 → four full stars and a half
          return (
            <span key={n} className="relative h-5 w-5">
              <Star className="absolute inset-0 h-5 w-5 text-star" />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star className="h-5 w-5 fill-star text-star" />
              </span>
            </span>
          );
        })}
      </span>
      {r.toFixed(1)}
    </span>
  );
}

// Demo phone numbers may belong to real people, so we never dial them.
export function ContactButton({ p }: { p: Pharmacy }) {
  return (
    <Button
      size="sm"
      variant="secondary"
      className="text-base"
      onClick={() => toast(`${p.name}: ${p.phone}`, { description: "Calls are disabled in the demo." })}
    >
      <Phone /> Contact
    </Button>
  );
}
