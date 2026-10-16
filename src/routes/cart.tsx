import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import medImg from "@/assets/medicine.jpg";
import { PageTitle, Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { DELIVERY, formatSum, getMedicine, getPharmacy } from "@/lib/data";
import { seo } from "@/lib/seo";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/cart")({
  head: () => seo("Cart", "Review the medicines in your cart before checkout."),
  component: CartPage,
});

function CartPage() {
  const { cart, set } = useStore();
  const sub = cart.reduce((a, c) => a + c.unitPrice * c.qty, 0);
  const fee = cart.length ? DELIVERY.courier.price : 0;
  const qty = (key: string, d: number) =>
    set((s) => ({ cart: s.cart.map((c) => (c.key === key ? { ...c, qty: c.qty + d } : c)).filter((c) => c.qty > 0) }));
  return (
    <Shell>
      <PageTitle>Your cart</PageTitle>
      {cart.length === 0 ? (
        <div className="card-soft p-10 text-center">
          <p className="text-2xl font-bold">Your cart is empty</p>
          <Button asChild size="lg" className="mt-5"><Link to="/home">Find medicines</Link></Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-[1fr_360px]">
          <ul className="space-y-3">
            {cart.map((c) => {
              const m = getMedicine(c.medicineId)!;
              return (
                <li key={c.key} className="card-soft flex items-center gap-4 p-4">
                  <img src={medImg} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xl font-bold">{m.name}</p>
                    <p className="text-muted-foreground">{m.packs[c.pack]?.label} · {getPharmacy(c.pharmacyId)!.name}</p>
                    <p className="text-lg font-bold text-primary">{formatSum(c.unitPrice * c.qty)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button size="icon" variant="secondary" aria-label="Decrease" onClick={() => qty(c.key, -1)}>{c.qty === 1 ? <Trash2 /> : <Minus />}</Button>
                    <span className="w-8 text-center text-xl font-bold">{c.qty}</span>
                    <Button size="icon" variant="secondary" aria-label="Increase" onClick={() => qty(c.key, 1)}><Plus /></Button>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="card-soft h-fit space-y-3 p-5 text-lg">
            <Row k="Subtotal" v={formatSum(sub)} />
            <Row k="Delivery fee" v={`from ${formatSum(fee)}`} />
            <div className="border-t pt-3 text-2xl font-bold"><Row k="Total" v={formatSum(sub + fee)} /></div>
            <Button asChild size="xl" className="w-full"><Link to="/checkout">Proceed to checkout</Link></Button>
          </div>
        </div>
      )}
    </Shell>
  );
}

export function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-3"><span>{k}</span><span className="font-semibold">{v}</span></div>;
}
