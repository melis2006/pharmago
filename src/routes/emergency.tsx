import { createFileRoute, Link } from "@tanstack/react-router";
import { Ambulance, ArrowLeft, PhoneCall } from "lucide-react";
import { soon } from "@/components/Shell";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/emergency")({
  head: () => seo("Emergency", "Call an ambulance or place an urgent phone order for medicines."),
  component: Emergency,
});

function Emergency() {
  return (
    <div className="min-h-screen bg-destructive-soft px-5 py-6">
      <Link to="/home" className="inline-flex items-center gap-2 text-xl font-bold"><ArrowLeft className="h-6 w-6" /> Back</Link>
      <div className="mx-auto mt-8 max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-destructive md:text-5xl">Emergency</h1>
        <p className="mt-2 text-xl">Choose what you need. Stay calm.</p>
        <div className="mt-10 grid gap-5">
          <button onClick={() => soon("Call ambulance")} className="flex min-h-40 items-center justify-center gap-4 rounded-3xl bg-destructive p-6 text-3xl font-bold text-destructive-foreground shadow-xl">
            <Ambulance className="h-14 w-14" /> Call ambulance
          </button>
          <button onClick={() => soon("Urgent phone order")} className="flex min-h-40 items-center justify-center gap-4 rounded-3xl border-4 border-destructive bg-card p-6 text-3xl font-bold text-destructive shadow-xl">
            <PhoneCall className="h-14 w-14" /> Make urgent phone-call order
          </button>
        </div>
      </div>
    </div>
  );
}
