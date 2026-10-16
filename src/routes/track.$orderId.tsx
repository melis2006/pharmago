import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Headphones, Home, Phone, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Shell, soon } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { useStore, type OrderStatus } from "@/lib/store";

export const Route = createFileRoute("/track/$orderId")({
  head: () => ({ meta: [{ title: "Track order — PharmaGO" }, { name: "description", content: "Follow your drone or courier delivery live." }, { property: "og:title", content: "Track order — PharmaGO" }, { property: "og:description", content: "Follow your drone or courier delivery live." }] }),
  component: Track,
});

const STAGES: OrderStatus[] = ["Packaged", "On the way", "Delivered"];
const DURATION = 20; // demo seconds

function Track() {
  const { orderId } = Route.useParams();
  const { orders, set } = useStore();
  const order = orders.find((o) => o.id === orderId);
  const [t, setT] = useState(0);
  const [stars, setStars] = useState(0);
  useEffect(() => {
    if (order?.status === "Delivered") return setT(DURATION);
    const i = setInterval(() => setT((x) => Math.min(DURATION, x + 1)), 1000);
    return () => clearInterval(i);
  }, [order?.status]);
  const stage = t >= DURATION ? 2 : t >= 3 ? 1 : 0;
  useEffect(() => {
    if (order && order.status !== STAGES[stage] && STAGES.indexOf(order.status) < stage)
      set((s) => ({ orders: s.orders.map((o) => (o.id === orderId ? { ...o, status: STAGES[stage]! } : o)) }));
  }, [stage]);
  const progress = stage === 0 ? 0 : Math.min(1, (t - 3) / (DURATION - 3));
  const isDrone = order?.method !== "courier";
  const mins = Math.max(0, Math.ceil((1 - progress) * (isDrone ? 12 : 25)));

  if (!order) return <Shell><p className="text-xl">Order not found. <Link to="/orders" className="text-primary underline">See my orders</Link></p></Shell>;

  if (stage === 2)
    return (
      <Shell>
        <div className="flex flex-col items-center py-10 text-center">
          <div className="grid h-36 w-36 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="h-20 w-20" strokeWidth={3} /></div>
          <h1 className="mt-6 text-4xl font-bold">Delivered</h1>
          <p className="mt-2 text-xl text-muted-foreground">Order {order.id}. How was your delivery?</p>
          <div className="mt-6 flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} aria-label={`${n} stars`} onClick={() => { setStars(n); set((s) => ({ orders: s.orders.map((o) => (o.id === orderId ? { ...o, rating: n } : o)) })); toast.success("Thank you for your rating!"); }} className={`text-6xl ${n <= (stars || order.rating || 0) ? "text-star" : "text-border"}`}>★</button>
            ))}
          </div>
          <Button asChild size="xl" className="mt-8"><Link to="/home">Back to home</Link></Button>
        </div>
      </Shell>
    );

  return (
    <Shell>
      <h1 className="text-3xl font-bold">Order {order.id}</h1>
      <p className="mt-1 text-xl">Arrives in about <b className="text-primary">{mins} min</b> by {isDrone ? "drone" : "courier"}</p>
      <div className="card-soft relative mt-5 h-80 overflow-hidden bg-secondary md:h-96">
        <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:40px_40px]" />
        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100"><line x1="10" y1="80" x2="88" y2="20" stroke="var(--primary)" strokeWidth="0.6" strokeDasharray="2 2" /></svg>
        <div className="absolute flex flex-col items-center" style={{ left: "10%", top: "80%", transform: "translate(-50%,-50%)" }}><Store className="h-10 w-10 text-primary" /><span className="rounded bg-card px-2 font-bold">Pharmacy</span></div>
        <div className="absolute flex flex-col items-center" style={{ left: "88%", top: "20%", transform: "translate(-50%,-50%)" }}><Home className="h-10 w-10 text-destructive" /><span className="rounded bg-card px-2 font-bold">Home</span></div>
        <div className="absolute text-5xl transition-all duration-1000 ease-linear" style={{ left: `${10 + 78 * progress}%`, top: `${80 - 60 * progress}%`, transform: "translate(-50%,-50%)" }}>{isDrone ? "🚁" : "🛵"}</div>
      </div>
      <ol className="mt-6 grid grid-cols-3 gap-2">
        {STAGES.map((s, i) => (
          <li key={s} className={`rounded-xl p-4 text-center text-lg font-bold ${i <= stage ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{s}</li>
        ))}
      </ol>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button size="xl" variant="outline" onClick={() => soon("Support")}><Headphones /> Support</Button>
        <Button size="xl" onClick={() => soon("Contact courier")}><Phone /> Contact courier</Button>
      </div>
    </Shell>
  );
}
