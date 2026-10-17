import { createFileRoute, Link } from "@tanstack/react-router";
import { MedicineCard } from "@/components/MedicineCard";
import { PageTitle, Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { MEDICINES } from "@/lib/data";
import { seo } from "@/lib/seo";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/saved")({
  head: () => seo("Saved medicines", "Medicines you saved for quick reordering."),
  component: Saved,
});

function Saved() {
  const { saved } = useStore();
  const list = MEDICINES.filter((m) => saved.includes(m.id));
  return (
    <Shell>
      <PageTitle>Saved</PageTitle>
      {list.length === 0 ? (
        <div className="card-soft p-10 text-center">
          <p className="text-xl">Tap the heart on any medicine to save it here.</p>
          <Button asChild size="lg" className="mt-5">
            <Link to="/home">Browse medicines</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((m) => (
            <MedicineCard key={m.id} m={m} />
          ))}
        </div>
      )}
    </Shell>
  );
}
