import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { MedicineImage } from "@/components/MedicineImage";
import { CourierIcon, DroneIcon, StatusBadge } from "@/components/Order";
import { PageTitle, Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { formatSum, getMedicine } from "@/lib/data";
import { seo } from "@/lib/seo";
import { useStore, type Order } from "@/lib/store";
import { formatOrderTime, methodLabel } from "@/lib/tracking";

export const Route = createFileRoute("/orders")({
  head: () => seo("My orders", "Track current deliveries and see your past orders."),
  component: Orders,
});

function Orders() {
  const { orders, hydrated } = useStore();
  // Order statuses follow the clock (the store keeps them in sync), so "not delivered" = current.
  const current = orders.filter((o) => o.status !== "Delivered");
  const past = orders.filter((o) => o.status === "Delivered");
  return (
    <Shell>
      <PageTitle>My orders</PageTitle>
      {!hydrated ? null : orders.length === 0 ? (
        <div className="card-soft p-10 text-center">
          <p className="text-xl">No orders yet.</p>
          <Button asChild size="lg" className="mt-5">
            <Link to="/home">Start shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-8">
          {current.length > 0 && (
            <section aria-labelledby="current-orders">
              <h2 id="current-orders" className="mb-3 text-2xl font-bold">
                Current orders
              </h2>
              <ul className="grid gap-3">
                {current.map((o) => (
                  <OrderCard key={o.id} o={o} />
                ))}
              </ul>
            </section>
          )}
          <section aria-labelledby="past-orders">
            <h2 id="past-orders" className="mb-3 text-2xl font-bold">
              Past orders
            </h2>
            {past.length === 0 ? (
              <p className="text-lg text-muted-foreground">No delivered orders yet.</p>
            ) : (
              <ul className="grid gap-3">
                {past.map((o) => (
                  <OrderCard key={o.id} o={o} />
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </Shell>
  );
}

function OrderCard({ o }: { o: Order }) {
  const delivered = o.status === "Delivered";
  const body = (
    <>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-xl font-bold">{o.id}</span>
          <StatusBadge status={o.status} />
        </div>
        <p className="mt-1 text-lg text-muted-foreground">
          {formatOrderTime(o.createdAt)} ·{" "}
          <span className="inline-flex items-center gap-1 align-middle">
            {o.method === "drone" ? (
              <DroneIcon className="h-6 w-6" spin={false} />
            ) : (
              <CourierIcon className="h-6 w-6" />
            )}
            {methodLabel(o.method)}
          </span>
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {o.items.map((i) => {
            const m = getMedicine(i.medicineId);
            return m ? <MedicineImage key={i.key} m={m} size="mini" decorative /> : null;
          })}
        </div>
        <p className="mt-1 text-lg">
          {o.items.map((i) => getMedicine(i.medicineId)?.name).join(", ")}
        </p>
        <p className="text-xl font-bold text-primary">{formatSum(o.total)}</p>
      </div>
      <span className="flex shrink-0 items-center gap-1 self-center text-lg font-bold text-primary">
        <span className="hidden sm:inline">{delivered ? "Details" : "Track"}</span>
        <ChevronRight className="h-7 w-7" aria-hidden />
      </span>
    </>
  );
  const cls =
    "card-soft flex items-start gap-3 p-5 transition hover:border-primary hover:bg-secondary/50";
  return (
    <li>
      {delivered ? (
        <Link to="/order/$orderId" params={{ orderId: o.id }} className={cls}>
          {body}
        </Link>
      ) : (
        <Link to="/track/$orderId" params={{ orderId: o.id }} className={cls}>
          {body}
        </Link>
      )}
    </li>
  );
}
