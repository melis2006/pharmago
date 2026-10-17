import { createFileRoute } from "@tanstack/react-router";
import { Clock, X } from "lucide-react";
import { useState } from "react";
import { MedicineCard } from "@/components/MedicineCard";
import { SearchBar } from "@/components/SearchBar";
import { PageTitle, Shell } from "@/components/Shell";
import { CATEGORIES, MEDICINES } from "@/lib/data";
import { seo } from "@/lib/seo";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>) => ({
    q: typeof s["q"] === "string" ? s["q"] : undefined,
  }),
  head: () =>
    seo(
      "Search",
      "Search medicines by name or symptom and compare prices across Tashkent pharmacies.",
    ),
  component: SearchPage,
});

function SearchPage() {
  const { q: initial } = Route.useSearch();
  const [q, setQ] = useState(initial ?? "");
  // A tapped recent search is shown in the search box too (the box remounts with it).
  const [picked, setPicked] = useState<string | null>(null);
  const pick = (r: string) => {
    setPicked(r);
    setQ(r);
  };
  const { recent, set } = useStore();
  const t = q.trim().toLowerCase();
  const cat = CATEGORIES.find((c) => c.label.toLowerCase() === t);
  const results = t
    ? MEDICINES.filter((m) =>
        cat
          ? m.category === cat.id
          : m.name.toLowerCase().includes(t) ||
            m.symptoms.some((s) => s.includes(t) || t.includes(s)),
      )
    : MEDICINES;
  return (
    <Shell>
      <PageTitle>Search</PageTitle>
      <SearchBar key={picked ?? initial} initial={picked ?? initial ?? ""} onQuery={setQ} />
      {recent.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent searches</h2>
            <button
              onClick={() => set(() => ({ recent: [] }))}
              className="min-h-12 px-2 text-lg font-semibold text-destructive underline"
            >
              Clear all
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {recent.map((r) => (
              <span key={r} className="flex items-center rounded-full bg-secondary text-lg">
                <button
                  onClick={() => pick(r)}
                  className="flex min-h-12 items-center gap-2 rounded-l-full pl-4 pr-1 hover:bg-card"
                >
                  <Clock className="h-4 w-4" aria-hidden />
                  {r}
                </button>
                <button
                  aria-label={`Remove ${r}`}
                  onClick={() => set((s) => ({ recent: s.recent.filter((x) => x !== r) }))}
                  className="grid h-12 w-12 place-items-center rounded-full hover:bg-card"
                >
                  <X className="h-5 w-5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
      <h2 className="mb-4 mt-8 text-2xl font-bold">{t ? `Results for "${q}"` : "We recommend"}</h2>
      {results.length === 0 ? (
        <p className="text-lg text-muted-foreground">Nothing found. Try another name or symptom.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {results.map((m) => (
            <MedicineCard key={m.id} m={m} showMeta />
          ))}
        </div>
      )}
    </Shell>
  );
}
