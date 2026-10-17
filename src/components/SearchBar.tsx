import { useNavigate } from "@tanstack/react-router";
import { Mic, Search } from "lucide-react";
import { useState } from "react";
import { MEDICINES } from "@/lib/data";
import { useStore } from "@/lib/store";
import { soon } from "./Shell";

export function SearchBar({
  initial = "",
  onQuery,
}: {
  initial?: string;
  onQuery?: (q: string) => void;
}) {
  const [q, setQ] = useState(initial);
  const [focus, setFocus] = useState(false);
  const nav = useNavigate();
  const { set } = useStore();
  const term = q.trim().toLowerCase();
  const sugg = term
    ? MEDICINES.filter(
        (m) => m.name.toLowerCase().includes(term) || m.symptoms.some((s) => s.includes(term)),
      ).slice(0, 5)
    : [];
  const submit = (v: string) => {
    if (!v.trim()) return;
    set((s) => ({ recent: [v.trim(), ...s.recent.filter((r) => r !== v.trim())].slice(0, 6) }));
    if (onQuery) onQuery(v.trim());
    else nav({ to: "/search", search: { q: v.trim() } });
  };
  return (
    // Suggestions stay open while focus is anywhere inside (input, buttons or the list), so they
    // can also be reached with the Tab key.
    <div
      className="relative w-full"
      onFocus={() => setFocus(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocus(false);
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(q);
        }}
        className="flex items-center gap-2 rounded-2xl border-2 border-primary bg-card p-2 shadow-lg"
      >
        <Search className="ml-2 h-7 w-7 shrink-0 text-primary" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            onQuery?.(e.target.value);
          }}
          placeholder="Medicine name or symptom"
          aria-label="Search medicines"
          className="h-12 min-w-0 flex-1 bg-transparent text-xl outline-none placeholder:text-muted-foreground"
        />
        <button
          type="button"
          onClick={() => soon("Voice search")}
          aria-label="Voice search"
          className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-secondary text-primary"
        >
          <Mic className="h-6 w-6" />
        </button>
        <button
          type="submit"
          className="hidden h-12 shrink-0 rounded-xl bg-primary px-6 text-lg font-bold text-primary-foreground sm:block"
        >
          Search
        </button>
      </form>
      {focus && sugg.length > 0 && (
        <ul className="card-soft absolute inset-x-0 top-full z-20 mt-2 overflow-hidden">
          {sugg.map((m) => (
            <li key={m.id}>
              <button
                // preventDefault keeps focus in the input so the list stays open until the click lands.
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => nav({ to: "/medicine/$id", params: { id: m.id } })}
                className="flex w-full items-center justify-between px-5 py-4 text-left text-lg hover:bg-secondary"
              >
                <span className="font-semibold">{m.name}</span>
                <span className="text-muted-foreground">{m.symptoms[0]}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
