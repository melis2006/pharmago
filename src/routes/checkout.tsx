import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { MedicineImage } from "@/components/MedicineImage";
import { PageTitle, Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DELIVERY, formatSum, getMedicine } from "@/lib/data";
import { orderTotals, type DeliveryMethod } from "@/lib/pricing";
import { seo } from "@/lib/seo";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/checkout")({
  head: () =>
    seo("Checkout", "Choose delivery address, drone or courier delivery and payment method."),
  component: Checkout,
});

const input =
  "h-14 w-full rounded-xl border-2 border-input bg-card px-4 text-lg outline-none focus:border-primary";

function Choice({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border-2 p-4 text-left text-lg font-semibold ${on ? "border-primary bg-secondary" : "border-border bg-card"}`}
    >
      {children}
    </button>
  );
}

function Checkout() {
  const { cart, addresses, cards, set } = useStore();
  const nav = useNavigate();
  const [address, setAddress] = useState(addresses[0] ?? "");
  const [where, setWhere] = useState("Doorstep");
  const [when, setWhen] = useState<"asap" | "time">("asap");
  const [time, setTime] = useState("");
  const [method, setMethod] = useState<DeliveryMethod>("drone");
  const [pay, setPay] = useState<string | null>(null);
  const [card, setCard] = useState({ num: "", exp: "" });
  const [missing, setMissing] = useState<string[] | null>(null);
  const { subtotal: sub, delivery, total } = orderTotals(cart, method);
  const needsCard = pay && pay !== "Cash" && cards.length === 0;

  const submit = () => {
    const miss: string[] = [];
    if (!address.trim()) miss.push("Delivery address");
    if (!pay) miss.push("Payment method");
    if (needsCard && card.num.replace(/\s/g, "").length < 16) miss.push("Card details");
    if (cart.length === 0) miss.push("Items in your cart");
    if (miss.length) return setMissing(miss);
    const id = `PG-${Math.floor(100000 + Math.random() * 900000)}`;
    set((s) => ({
      orders: [
        { id, items: s.cart, total, method, address, status: "Packaged", createdAt: Date.now() },
        ...s.orders,
      ],
      cart: [],
      addresses: s.addresses.includes(address) ? s.addresses : [address, ...s.addresses],
      cards: needsCard
        ? [...s.cards, { last4: card.num.replace(/\s/g, "").slice(-4), type: pay! }]
        : s.cards,
    }));
    nav({ to: "/success/$orderId", params: { orderId: id } });
  };

  return (
    <Shell>
      <PageTitle>Checkout</PageTitle>
      <div className="grid gap-6 md:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Section title="Delivery address">
            <input
              className={input}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, house, apartment"
            />
          </Section>
          <Section title="Where to deliver">
            <div className="grid grid-cols-3 gap-3">
              {["Driveway", "Doorstep", "Balcony"].map((w) => (
                <Choice key={w} on={where === w} onClick={() => setWhere(w)}>
                  {w}
                </Choice>
              ))}
            </div>
          </Section>
          <Section title="When">
            <div className="grid grid-cols-2 gap-3">
              <Choice on={when === "asap"} onClick={() => setWhen("asap")}>
                As soon as possible
              </Choice>
              <Choice on={when === "time"} onClick={() => setWhen("time")}>
                Set a time
              </Choice>
            </div>
            {when === "time" && (
              <input
                type="time"
                className={`${input} mt-3`}
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            )}
          </Section>
          <Section title="Delivery method">
            <div className="grid grid-cols-2 gap-3">
              {(["drone", "courier"] as const).map((k) => (
                <Choice key={k} on={method === k} onClick={() => setMethod(k)}>
                  <span className="block text-xl">
                    {k === "drone" ? "🚁" : "🛵"} {DELIVERY[k].label}
                  </span>
                  <span className="block text-muted-foreground">{DELIVERY[k].time}</span>
                  <span className="block text-primary">{formatSum(DELIVERY[k].price)}</span>
                </Choice>
              ))}
            </div>
          </Section>
          <Section title="Payment method">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {["Cash", "Uzcard", "Humo", "Visa/Mastercard"].map((p) => (
                <Choice key={p} on={pay === p} onClick={() => setPay(p)}>
                  {p}
                </Choice>
              ))}
            </div>
            {pay &&
              pay !== "Cash" &&
              (cards.length > 0 ? (
                <p className="mt-3 text-lg">Using saved card •••• {cards[0]!.last4}</p>
              ) : (
                <div className="card-soft mt-3 grid gap-3 p-4">
                  <p className="text-lg font-bold">Add card</p>
                  <input
                    className={input}
                    inputMode="numeric"
                    placeholder="Card number (16 digits)"
                    value={card.num}
                    onChange={(e) => setCard({ ...card, num: e.target.value })}
                  />
                  <input
                    className={input}
                    placeholder="MM/YY"
                    value={card.exp}
                    onChange={(e) => setCard({ ...card, exp: e.target.value })}
                  />
                </div>
              ))}
          </Section>
        </div>
        <div className="card-soft h-fit space-y-3 p-5 text-lg md:sticky md:top-24">
          {cart.length > 0 && (
            <ul className="space-y-3 border-b pb-3" aria-label="Your items">
              {cart.map((c) => {
                const m = getMedicine(c.medicineId);
                if (!m) return null;
                return (
                  <li key={c.key} className="flex items-center gap-3">
                    <MedicineImage m={m} size="mini" decorative />
                    <span className="min-w-0 flex-1 font-semibold leading-tight">
                      {m.name}
                      <span className="block text-base font-normal text-muted-foreground">
                        {m.packs[c.pack]?.label} × {c.qty}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="flex justify-between">
            <span>Subtotal</span>
            <b>{formatSum(sub)}</b>
          </div>
          <div className="flex justify-between">
            <span>Delivery ({DELIVERY[method].label})</span>
            <b>{formatSum(delivery)}</b>
          </div>
          <div className="flex justify-between border-t pt-3 text-2xl font-bold">
            <span>Total</span>
            <span>{formatSum(total)}</span>
          </div>
          <Button size="xl" className="w-full" onClick={submit}>
            Pay {formatSum(total)}
          </Button>
        </div>
      </div>
      <Dialog open={!!missing} onOpenChange={() => setMissing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">Please complete</DialogTitle>
          </DialogHeader>
          <ul className="list-disc pl-6 text-lg">
            {missing?.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
          <Button size="lg" onClick={() => setMissing(null)}>
            OK
          </Button>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-xl font-bold">{title}</h2>
      {children}
    </section>
  );
}
