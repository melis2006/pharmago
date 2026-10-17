import { createFileRoute, Link } from "@tanstack/react-router";
import { CreditCard, Globe, Heart, Lock, LogOut, MapPin, Package, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import type { ReactNode } from "react";
import { DeleteMyDataButton, HealthConsent } from "@/components/Privacy";
import { PageTitle, Shell, soon } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { CONDITIONS, type Condition } from "@/lib/data";
import { seo } from "@/lib/seo";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/profile")({
  head: () => seo("Profile", "Your personal info, health conditions, addresses, cards and orders."),
  component: Profile,
});

function Profile() {
  const { user, addresses, cards, orders, saved, set, logout } = useStore();
  if (!user)
    return (
      <Shell>
        <PageTitle>Profile</PageTitle>
        <div className="card-soft p-8 text-center">
          <p className="text-xl">Sign in to get personal health warnings and save your details.</p>
          <Button asChild size="xl" className="mt-5"><Link to="/login">Sign in / Register</Link></Button>
        </div>
        <PrivacyActions />
        <p className="mt-6 text-center"><Link to="/admin" className="text-lg text-muted-foreground underline">Admin panel</Link></p>
      </Shell>
    );
  const toggleCondition = (id: Condition) =>
    set((s) => ({ user: { ...s.user!, conditions: s.user!.conditions.includes(id) ? s.user!.conditions.filter((x) => x !== id) : [...s.user!.conditions, id] } }));
  const setConsent = (on: boolean) => {
    // Withdrawing consent removes the saved conditions (the store enforces this).
    set((s) => ({ user: { ...s.user!, healthConsent: on } }));
    if (!on && user.conditions.length > 0) toast("Your health conditions were removed from this device");
  };
  return (
    <Shell>
      <PageTitle>{user.name}</PageTitle>
      <div className="grid gap-4 md:grid-cols-2">
        <Card icon={<ShieldCheck />} title="Personal info"><p>{user.name}</p><p>{user.phone}</p></Card>
        <Card icon={<Heart />} title="Health conditions">
          <HealthConsent checked={user.healthConsent} onChange={setConsent} />
          {!user.healthConsent && <p className="mt-2">Tick the box above to save conditions and get warnings.</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            {CONDITIONS.map((c) => {
              const on = user.conditions.includes(c.id);
              return (
                <button
                  key={c.id}
                  disabled={!user.healthConsent}
                  aria-pressed={on}
                  onClick={() => toggleCondition(c.id)}
                  className={`min-h-11 rounded-full border-2 px-4 py-1 disabled:cursor-not-allowed disabled:opacity-50 ${on ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
                >
                  {c.label}
                </button>
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
      <Button size="xl" variant="destructive" className="mt-6 w-full md:w-auto" onClick={() => { logout(); toast("You are logged out. Your health conditions were removed from this device."); }}><LogOut /> Log out</Button>
      <PrivacyActions />
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

function PrivacyActions() {
  return (
    <section className="card-soft mt-6 grid gap-3 p-5 text-lg" aria-label="Your privacy">
      <h2 className="flex items-center gap-2 text-xl font-bold text-primary"><Lock />Your privacy</h2>
      <p>Everything you enter is stored only in this browser. Nothing is sent to a server.</p>
      <div className="flex flex-wrap gap-3">
        <Button asChild size="xl" variant="secondary"><Link to="/privacy">Read the privacy notice</Link></Button>
        <DeleteMyDataButton />
      </div>
    </section>
  );
}
