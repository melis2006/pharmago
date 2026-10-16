import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/success/$orderId")({
  head: () => ({ meta: [{ title: "Payment accepted — PharmaGO" }, { name: "description", content: "Your PharmaGO order has been placed." }, { property: "og:title", content: "Payment accepted — PharmaGO" }, { property: "og:description", content: "Your PharmaGO order has been placed." }] }),
  component: Success,
});

function Success() {
  const { orderId } = Route.useParams();
  return (
    <Shell>
      <div className="flex flex-col items-center py-12 text-center">
        <div className="grid h-40 w-40 place-items-center rounded-full bg-primary text-primary-foreground shadow-xl"><Check className="h-24 w-24" strokeWidth={3} /></div>
        <h1 className="mt-8 text-3xl font-bold md:text-4xl">Your payment has been accepted</h1>
        <p className="mt-3 text-xl text-muted-foreground">Order number</p>
        <p className="text-3xl font-bold">{orderId}</p>
        <Button asChild size="xl" className="mt-8"><Link to="/track/$orderId" params={{ orderId }}>Track my order</Link></Button>
      </div>
    </Shell>
  );
}
