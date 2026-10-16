import { createFileRoute, Link } from "@tanstack/react-router";
import { CreditCard, Globe, Heart, LogOut, MapPin, Package, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { PageTitle, Shell, soon } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { CONDITIONS } from "@/lib/data";
import { seo } from "@/lib/seo";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/profile")({
  head: () => seo("Profile", "Your personal info, health conditions, addresses, cards and orders."),
  component: Profile,
});

function Profile() {
  const { user, addresses, cards, orders, saved, set } = useStore();
  if (!user)
    return (
      <Shell>
        <PageTitle>Profile</PageTitle>
        <div className="card-soft p-8 text-center">
          <p className="text-xl">Sign in to get personal health warnings and save your details.</p>
          <Button asChild size="xl" className="mt-5"><Link to="/login">Sign in / Register</Link></Button>
        </div>
        <p className="mt-6 text-center"><Link to="/admin" className="text-lg text-muted-foreground underline">Admin panel</Link></p>
      </Shell>
    );
  return (
    <Shell>
      <PageTitle>{user.name}</PageTitle>
      <div className="grid gap-4 md:grid-cols-2">
        <Card icon={<ShieldCheck />} title="Personal info"><p>{user.name}</p><p>{user.phone}</p></Card>
        <Card icon={<Heart />} title="Health conditions">
          <div className="flex flex-wrap gap-2">
            {CONDITIONS.map((c) => {
              const on = user.conditions.includes(c.id);
              return (
                <button key={c.id} onClick={() => set((s) => ({ user: { ...s.user!, conditions: on ? s.user!.conditions.filter((x) => x !== c.id) : [...s.user!.conditions, c.id] } }))} className={`rounded-full border-2 px-3 py-1 ${on ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{c.label}</button>
              );
            })}
          </div>
        </Card>
        <Card icon={<MapPin />} title="Saved addresses">{addresses.map((a) => <p key={a}>{a}</p>)}</Card>
        <Card icon={<CreditCard />} title="Payment cards">{cards.length ? cards.map((c, i) => <p key={i}>{c.type} •••• {c.last4}</p>) : <p className="text-muted-foreground">No cards yet</p>}</Card>
        <Card icon={<Package />} title="Order history"><Link to="/orders" className="text-primary underline">{orders.length} orders</Link></Card>
        <Card icon={<Heart />} title="Saved medicines"><Link to="/saved" className="text-primary underline">{saved.length} saved</Link></Card>
        <Card icon={<Globe />} title="Language"><div className="flex gap-2"><Button size="sm">English</Button><Button size="sm" variant="secondary" onClick={() => soon("O'zbek")}>O'zbek</Button><Button size="sm" variant="secondary" onClick={() => soon("Русский")}>Русский</Button></div></Card>
      </div>
      <Button size="xl" variant="destructive" className="mt-6 w-full md:w-auto" onClick={() => set(() => ({ user: null }))}><LogOut /> Log out</Button>
      <p className="mt-6"><Link to="/admin" className="text-lg text-muted-foreground underline">Admin panel</Link></p>
    </Shell>
  );
}

function Card({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="card-soft p-5 text-lg">
      <h2 className="mb-2 flex items-center gap-2 text-xl font-bold text-primary">{icon}{title}</h2>
      {children}
    </div>
  );
}
