import { createFileRoute, Link } from "@tanstack/react-router";
import { CreditCard, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import { MedicineImage } from "@/components/MedicineImage";
import { CourierIcon, DroneIcon, RatingStars, StatusBadge } from "@/components/Order";
import { PageTitle, Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { DELIVERY, formatSum, getMedicine, getPharmacy } from "@/lib/data";
import { orderTotals } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { formatOrderTime, methodLabel } from "@/lib/tracking";

export const Route = createFileRoute("/order/$orderId")({
  head: () => ({
    meta: [
      { title: "Order details — PharmaGO" },
      { name: "description", content: "Items, address, payment and rating of your order." },
    ],
  }),
  component: OrderDetails,
});

function OrderDetails() {
  const { orderId } = Route.useParams();
  const { orders, set, hydrated } = useStore();
  const order = orders.find((o) => o.id === orderId);
  if (!hydrated) return <Shell>{null}</Shell>;
  if (!order)
    return (
      <Shell>
        <p className="text-xl">
          Order not found.{" "}
          <Link to="/orders" className="text-primary underline">
            See my orders
          </Link>
        </p>
      </Shell>
    );
  const { subtotal } = orderTotals(order.items, order.method);
  const delivered = order.status === "Delivered";
  return (
    <Shell>
      <PageTitle sub={formatOrderTime(order.createdAt)}>Order {order.id}</PageTitle>
      <div className="grid gap-4 md:grid-cols-[1fr_380px]">
        <section className="card-soft p-5" aria-labelledby="items">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 id="items" className="text-2xl font-bold">
              Items
            </h2>
            <StatusBadge status={order.status} />
          </div>
          <ul className="divide-y">
            {order.items.map((i) => {
              const m = getMedicine(i.medicineId);
              if (!m) return null;
              return (
                <li key={i.key} className="flex items-center gap-3 py-3 text-lg">
                  <MedicineImage m={m} size="thumb" decorative />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{m.name}</p>
                    <p className="text-muted-foreground">
                      {m.packs[i.pack]?.label} × {i.qty} · {getPharmacy(i.pharmacyId).name}
                    </p>
                  </div>
                  <p className="shrink-0 font-bold">{formatSum(i.unitPrice * i.qty)}</p>
                </li>
              );
            })}
          </ul>
        </section>

        <div className="grid h-fit gap-4">
          <Info icon={<MapPin className="h-6 w-6" />} title="Delivery address">
            <p>{order.address}</p>
            {order.where && <p className="text-muted-foreground">Leave at: {order.where}</p>}
          </Info>
          <Info
            icon={
              order.method === "drone" ? (
                <DroneIcon className="h-7 w-7" spin={false} />
              ) : (
                <CourierIcon className="h-7 w-7" />
              )
            }
            title="Delivery"
          >
            <p>
              {methodLabel(order.method)} · {DELIVERY[order.method].time}
            </p>
          </Info>
          <Info icon={<CreditCard className="h-6 w-6" />} title="Payment">
            <p>{order.payment ?? "—"}</p>
          </Info>
          <section className="card-soft grid gap-2 p-5 text-lg">
            <div className="flex justify-between">
              <span>Medicines</span>
              <b>{formatSum(subtotal)}</b>
            </div>
            <div className="flex justify-between">
              <span>Delivery ({methodLabel(order.method)})</span>
              <b>{formatSum(order.total - subtotal)}</b>
            </div>
            <div className="flex justify-between border-t pt-2 text-2xl font-bold">
              <span>Total</span>
              <span>{formatSum(order.total)}</span>
            </div>
          </section>
          {delivered ? (
            <section className="card-soft p-5 text-lg" aria-labelledby="rating">
              <h2 id="rating" className="text-xl font-bold">
                {order.rating ? "Your rating" : "How was your delivery?"}
              </h2>
              <RatingStars
                value={order.rating ?? 0}
                onRate={(n) =>
                  set((s) => ({
                    orders: s.orders.map((o) => (o.id === order.id ? { ...o, rating: n } : o)),
                  }))
                }
              />
            </section>
          ) : (
            <Button asChild size="xl">
              <Link to="/track/$orderId" params={{ orderId: order.id }}>
                Track this order
              </Link>
            </Button>
          )}
        </div>
      </div>
    </Shell>
  );
}

function Info({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="card-soft p-5 text-lg">
      <h2 className="mb-1 flex items-center gap-2 text-xl font-bold text-primary">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}
