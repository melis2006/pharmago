import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Heart, ShoppingCart, Package, User, Siren } from "lucide-react";
import type { ReactNode } from "react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export function Logo({ size = "text-2xl" }: { size?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 font-display font-bold ${size}`}
      aria-label="PharmaGO"
    >
      <span className="text-primary">Pharma</span>
      <span className="relative inline-flex items-center justify-center">
        <Heart className="h-[1.6em] w-[1.6em] fill-destructive text-destructive" />
        <span className="absolute text-[0.55em] font-black text-destructive-foreground">GO</span>
      </span>
    </span>
  );
}

const NAV = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/saved", label: "Saved", icon: Heart },
  { to: "/cart", label: "Cart", icon: ShoppingCart },
  { to: "/orders", label: "Orders", icon: Package },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { cart } = useStore();
  const count = cart.reduce((a, c) => a + c.qty, 0);
  return (
    <div className="min-h-screen pb-28 md:pb-10">
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/home" className="flex min-h-12 items-center">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="relative flex min-h-12 items-center gap-2 rounded-xl px-4 py-2.5 text-lg font-semibold text-foreground hover:bg-secondary"
                activeProps={{ className: "bg-secondary text-primary" }}
              >
                <n.icon className="h-5 w-5" /> {n.label}
                {n.to === "/cart" && count > 0 && <Badge n={count} />}
              </Link>
            ))}
          </nav>
          {/* On phones only the icon shows, so the link needs an accessible name. */}
          <Link
            to="/emergency"
            aria-label="Emergency"
            className="flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-xl bg-destructive px-4 py-2.5 text-lg font-bold text-destructive-foreground"
          >
            <Siren className="h-5 w-5" aria-hidden />{" "}
            <span className="hidden sm:inline">Emergency</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      <Footer />
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t bg-card md:hidden">
        {NAV.map((n) => {
          const active = path.startsWith(n.to);
          return (
            <Link
              key={n.to}
              to={n.to}
              className={`relative flex flex-col items-center gap-1 py-3 text-sm font-semibold ${active ? "text-primary" : "text-muted-foreground"}`}
            >
              <n.icon className="h-7 w-7" strokeWidth={active ? 2.6 : 2} />
              {n.label}
              {n.to === "/cart" && count > 0 && <Badge n={count} />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function Badge({ n }: { n: number }) {
  return (
    <span className="absolute right-2 top-1 grid h-6 min-w-6 place-items-center rounded-full bg-destructive px-1 text-xs font-bold text-destructive-foreground">
      {n}
    </span>
  );
}

export const soon = (what = "This feature") =>
  toast(`${what} — coming soon`, { description: "We are working on it." });

export function PageTitle({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold md:text-4xl">{children}</h1>
      {sub && <p className="mt-1 text-lg text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function Stars({ r }: { r: number }) {
  return (
    <span className="font-semibold">
      <span className="text-star">★</span> {r.toFixed(1)}
    </span>
  );
}

export function Footer() {
  return (
    <footer className="mx-auto max-w-6xl border-t px-4 py-6 text-lg">
      <p className="font-semibold">
        Demo project. Information is not medical advice. In an emergency call 103.
      </p>
      <p className="mt-2">
        <Link to="/privacy" className="font-semibold text-primary underline underline-offset-4">
          Privacy
        </Link>
        <span className="text-muted-foreground"> · Your data stays on this device.</span>
      </p>
    </footer>
  );
}
