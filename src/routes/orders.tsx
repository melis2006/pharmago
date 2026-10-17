import { createFileRoute, Link } from "@tanstack/react-router";
import { MedicineImage } from "@/components/MedicineImage";
import { PageTitle, Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { formatSum, getMedicine } from "@/lib/data";
import { seo } from "@/lib/seo";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/orders")({
  head: () => seo("My orders", "Track current deliveries and see your past orders."),
  component: Orders,
});

function Orders() {
  const { orders } = useStore();
  return (
    <Shell>
      <PageTitle>My orders</PageTitle>
      {orders.length === 0 ? (
        <div className="card-soft p-10 text-center">
          <p className="text-xl">No orders yet.</p>
          <Button asChild size="lg" className="mt-5">
            <Link to="/home">Start shopping</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li
              key={o.id}
              className="card-soft flex flex-wrap items-center justify-between gap-3 p-5"
            >
              <div className="min-w-0">
                <p className="text-xl font-bold">
                  {o.id}{" "}
                  <span
                    className={`ml-2 rounded-lg px-2 py-0.5 text-base ${o.status === "Delivered" ? "bg-secondary text-primary" : "bg-fast text-fast-foreground"}`}
                  >
                    {o.status}
                  </span>
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {o.items.map((i) => {
                    const m = getMedicine(i.medicineId);
                    return m ? <MedicineImage key={i.key} m={m} size="mini" decorative /> : null;
                  })}
                </div>
                <p className="mt-1 text-lg text-muted-foreground">
                  {o.items.map((i) => getMedicine(i.medicineId)?.name).join(", ")}
                </p>
                <p className="text-lg font-semibold">{formatSum(o.total)}</p>
              </div>
              <Button asChild size="lg">
                <Link to="/track/$orderId" params={{ orderId: o.id }}>
                  {o.status === "Delivered" ? "View" : "Track"}
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Shell>
  );
}
