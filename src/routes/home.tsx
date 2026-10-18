import { createFileRoute, Link } from "@tanstack/react-router";
import { Bot, ChevronRight, HelpCircle, Phone, Siren } from "lucide-react";
import { useState } from "react";
import drone from "@/assets/drone.jpg";
import promoBanner from "@/assets/products/promo-banner.jpg";
import { MedicineCard } from "@/components/MedicineCard";
import { CourierIcon, DroneIcon } from "@/components/Order";
import { SearchBar } from "@/components/SearchBar";
import { Shell, soon } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CATEGORIES, MEDICINES } from "@/lib/data";
import { seo } from "@/lib/seo";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/home")({
  head: () =>
    seo(
      "Home",
      "Search medicines by name or symptom and get them delivered by drone or courier in Tashkent.",
    ),
  component: HomePage,
});

function HomePage() {
  const [help, setHelp] = useState(false);
  const { orders } = useStore();
  // Newest order that is not delivered yet (statuses follow the clock, see src/lib/tracking.ts).
  const current = orders.find((o) => o.status !== "Delivered");
  return (
    <Shell>
      {current && (
        <Link
          to="/track/$orderId"
          params={{ orderId: current.id }}
          className="flex min-h-16 items-center gap-3 rounded-2xl border-2 border-primary bg-primary-soft px-4 py-3 text-lg"
        >
          {current.method === "drone" ? (
            <DroneIcon className="h-11 w-11 shrink-0" />
          ) : (
            <CourierIcon className="h-11 w-11 shrink-0" />
          )}
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block text-xl font-bold text-primary">Track order</span>
            <span className="block text-base text-foreground">
              {current.id} · {current.status === "Packaged" ? "being packaged" : "on the way"}
            </span>
          </span>
          <ChevronRight className="h-7 w-7 shrink-0 text-primary" aria-hidden />
        </Link>
      )}
      <section className="py-6 text-center md:py-10">
        <h1 className="text-3xl font-bold md:text-5xl">What medicine do you need?</h1>
        <p className="mt-2 text-lg text-muted-foreground">Type a name or how you feel</p>
        <div className="mx-auto mt-6 max-w-3xl">
          <SearchBar />
        </div>
        <div className="mx-auto mt-5 grid max-w-3xl grid-cols-2 gap-3">
          <Button asChild variant="destructive" size="xl">
            <Link to="/emergency">
              <Siren /> Emergency?
            </Link>
          </Button>
          <Button variant="outline" size="xl" onClick={() => setHelp(true)}>
            <HelpCircle /> Need help?
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="bg-hero flex min-h-44 items-stretch gap-4 overflow-hidden rounded-3xl p-5 text-primary-foreground sm:p-7">
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <p className="text-lg font-semibold opacity-90">Autumn offer</p>
            <h2 className="text-3xl font-bold">Seasonal medicines 25% OFF</h2>
            <Link
              to="/search"
              search={{ q: "cold" }}
              className="mt-3 w-fit rounded-xl bg-card px-5 py-2.5 text-lg font-bold text-primary"
            >
              Shop now
            </Link>
          </div>
          <img
            src={promoBanner}
            alt=""
            width={140}
            height={192}
            className="w-28 shrink-0 self-center rounded-2xl object-cover shadow-lg sm:w-32"
          />
        </div>
        <div className="relative min-h-44 overflow-hidden rounded-3xl">
          <img
            src={drone}
            alt="Delivery drone"
            width={1280}
            height={640}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="relative flex h-full max-w-[60%] flex-col justify-center p-7">
            <h2 className="text-3xl font-bold">Drone delivery</h2>
            <p className="text-lg font-semibold">At your door in 10–15 min</p>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-2xl font-bold">Categories</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              to="/search"
              search={{ q: c.label }}
              className="card-soft flex min-w-0 items-center gap-2 px-3 py-4 text-lg font-bold hover:bg-secondary sm:gap-3 sm:px-4"
            >
              <span className="text-3xl" aria-hidden>
                {c.emoji}
              </span>
              <span className="min-w-0 break-words">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-2xl font-bold">Currently popular</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MEDICINES.slice(0, 4).map((m) => (
            <MedicineCard key={m.id} m={m} />
          ))}
        </div>
      </section>

      <Dialog open={help} onOpenChange={setHelp}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">How can we help?</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <Button size="xl" onClick={() => soon("Ask AI")}>
              <Bot /> Ask AI (our robot)
            </Button>
            <Button size="xl" variant="outline" onClick={() => soon("Call operator")}>
              <Phone /> Call operator
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
