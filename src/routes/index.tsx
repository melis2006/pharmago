import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Drone, Scale, Search } from "lucide-react";
import { Footer, Logo } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () =>
    seo(
      "Welcome",
      "PharmaGO — your health, delivered. Find medicines, compare pharmacy prices in Tashkent and get them delivered by drone.",
    ),
  component: Welcome,
});

const BENEFITS = [
  { icon: Search, text: "Find your medicine fast" },
  { icon: Scale, text: "Compare prices in pharmacies" },
  // Word joiners and a no-break space keep "10–15 minutes" on one line.
  { icon: Drone, text: "Drone delivery in 10⁠–⁠15 minutes" },
];

function Welcome() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center px-5 py-10">
        <Logo size="text-5xl" />
        <h1 className="mt-6 text-center text-3xl font-bold md:text-4xl">Your health, delivered</h1>

        <ul className="mt-10 grid w-full max-w-3xl gap-4 md:grid-cols-3">
          {BENEFITS.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="card-soft flex items-center gap-4 p-5 text-xl font-bold md:flex-col md:text-center"
            >
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
                <Icon className="h-9 w-9" aria-hidden />
              </span>
              {text}
            </li>
          ))}
        </ul>

        <Button asChild size="xl" className="mt-10 h-16 w-full max-w-md text-2xl">
          <Link to="/home">
            Get started <ArrowRight className="!size-7" aria-hidden />
          </Link>
        </Button>
        <Link
          to="/login"
          className="mt-4 inline-flex min-h-12 items-center px-2 text-center text-lg font-semibold text-primary underline underline-offset-4"
        >
          I already have an account — Log in
        </Link>
      </main>
      <Footer />
    </div>
  );
}
