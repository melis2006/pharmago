import { createFileRoute, Link } from "@tanstack/react-router";
import { Bike, Check, Headphones, Home, MapPin, Package, Phone, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { DroneIcon, RatingStars } from "@/components/Order";
import { Shell, soon } from "@/components/Shell";
import { TrackingMap } from "@/components/TrackingMap";
import { Button } from "@/components/ui/button";
import { useStore, type Order } from "@/lib/store";
import { deliveryWindow, methodLabel, STATUS_TEXT, trackingState } from "@/lib/tracking";
import { useNow } from "@/lib/useNow";

export const Route = createFileRoute("/track/$orderId")({
  head: () => ({
    meta: [
      { title: "Track order — PharmaGO" },
      { name: "description", content: "Follow your drone or courier delivery live." },
      { property: "og:title", content: "Track order — PharmaGO" },
      { property: "og:description", content: "Follow your drone or courier delivery live." },
    ],
  }),
  component: Track,
});

function Track() {
  const { orderId } = Route.useParams();
  const { orders, hydrated } = useStore();
  const order = orders.find((o) => o.id === orderId);
  // Everything is computed from the order's creation time, so leaving and coming back continues
  // where the delivery really is.
  const now = useNow(500, !!order && order.status !== "Delivered");
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
  const state = trackingState(order, now);
  return (
    <Shell>
      <h1 className="sr-only">Track order {order.id}</h1>
      <div className="md:grid md:grid-cols-[1fr_420px] md:items-start md:gap-6">
        <TrackingMap
          travel={state.travel}
          method={order.method}
          className="h-[42vh] min-h-72 md:sticky md:top-44 md:h-[calc(100vh-15rem)] md:min-h-[520px]"
        />
        {/* On phones the card overlaps the map like a bottom sheet. */}
        <section className="card-soft relative z-10 -mt-8 rounded-t-3xl p-5 md:mt-0 md:rounded-3xl md:p-6">
          <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-border md:hidden" aria-hidden />
          {state.stage === 2 ? (
            <Delivered order={order} />
          ) : (
            <InProgress order={order} state={state} />
          )}
        </section>
      </div>
    </Shell>
  );
}

function InProgress({ order, state }: { order: Order; state: ReturnType<typeof trackingState> }) {
  const packaging = state.stage === 0;
  return (
    <div className="grid gap-5 text-lg">
      <div>
        <p className="text-muted-foreground">Estimated delivery time</p>
        <p className="font-display text-4xl font-bold tracking-tight">{deliveryWindow(order)}</p>
      </div>
      <p className="text-2xl font-bold" role="status" aria-live="polite">
        {STATUS_TEXT[state.stage]}
      </p>

      {/* package → drone/courier → house, filling as the order moves */}
      <div className="flex items-center gap-2" aria-hidden>
        <StepIcon done>
          <Package className="h-7 w-7" />
        </StepIcon>
        <Bar fill={state.packaging} />
        <StepIcon done={state.stage >= 1}>
          {order.method === "drone" ? (
            <DroneIcon className="h-9 w-9" spin={state.stage === 1} />
          ) : (
            <Bike className="h-7 w-7" />
          )}
        </StepIcon>
        <Bar fill={state.travel} />
        <StepIcon done={false}>
          <Home className="h-7 w-7" />
        </StepIcon>
      </div>

      <p className="flex items-start gap-2">
        <MapPin className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden />
        <span>{order.address}</span>
      </p>
      <p className="text-muted-foreground">
        Order {order.id} · {methodLabel(order.method)}
      </p>

      <div className="grid grid-cols-2 gap-3">
        <Button
          size="xl"
          variant="outline"
          className="h-auto min-h-16 whitespace-normal px-4 py-3 text-center"
          onClick={() => soon("Support")}
        >
          <Headphones /> Support
        </Button>
        <Button
          size="xl"
          className="h-auto min-h-16 whitespace-normal px-4 py-3 text-center"
          onClick={() => soon("Contact courier")}
        >
          <Phone /> Contact courier
        </Button>
      </div>
      <div className="grid gap-2">
        <Button
          size="xl"
          variant="outline"
          disabled={!packaging}
          onClick={() => soon("Additional order")}
        >
          <Plus /> Additional order
        </Button>
        <p className="text-base text-muted-foreground">
          Additional order is possible only while the order is being packaged.
        </p>
      </div>
    </div>
  );
}

function StepIcon({ done, children }: { done: boolean; children: ReactNode }) {
  return (
    <span
      className={`grid h-14 w-14 shrink-0 place-items-center rounded-full border-2 transition-colors ${done ? "border-primary bg-primary-soft text-primary" : "border-border bg-card text-muted-foreground"}`}
    >
      {children}
    </span>
  );
}

function Bar({ fill }: { fill: number }) {
  return (
    <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
      <span
        className="block h-full rounded-full bg-primary transition-[width] duration-500 ease-linear"
        style={{ width: `${Math.round(fill * 100)}%` }}
      />
    </span>
  );
}

const CONFETTI_COLORS = ["#22a06b", "#f59e0b", "#e11d48", "#3b82f6", "#a855f7"];

function Delivered({ order }: { order: Order }) {
  const { set } = useStore();
  return (
    <div className="relative grid justify-items-center gap-4 overflow-hidden py-4 text-center text-lg">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72" aria-hidden>
        {Array.from({ length: 28 }, (_, i) => (
          <span
            key={i}
            className="confetti-piece"
            style={{
              left: `${(i * 37) % 100}%`,
              background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              animationDelay: `${(i % 7) * 0.12}s`,
              transform: `rotate(${i * 25}deg)`,
            }}
          />
        ))}
      </div>
      <div className="grid h-32 w-32 place-items-center rounded-full bg-primary text-primary-foreground shadow-xl">
        <Check className="h-20 w-20" strokeWidth={3} aria-hidden />
      </div>
      <p className="text-3xl font-bold" role="status">
        {STATUS_TEXT[2]}
      </p>
      <p className="flex items-start gap-2 text-left">
        <MapPin className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden />
        <span>{order.address}</span>
      </p>
      <div className="grid justify-items-center gap-1">
        <p className="font-semibold">How was your delivery?</p>
        <RatingStars
          value={order.rating ?? 0}
          onRate={(n) =>
            set((s) => ({
              orders: s.orders.map((o) => (o.id === order.id ? { ...o, rating: n } : o)),
            }))
          }
        />
      </div>
      <Button asChild size="xl" className="w-full">
        <Link to="/home">Back to home</Link>
      </Button>
    </div>
  );
}
