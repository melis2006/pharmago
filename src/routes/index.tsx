import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Footer, Logo, soon } from "@/components/Shell";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => seo("Welcome", "PharmaGO — your health, delivered. Choose your language to start ordering medicines in Tashkent."),
  component: Welcome,
});

const LANGS = [
  { id: "uz", label: "O'zbek", flag: "🇺🇿" },
  { id: "ru", label: "Русский", flag: "🇷🇺" },
  { id: "en", label: "English", flag: "🇬🇧" },
];

function Welcome() {
  const nav = useNavigate();
  return (
    <div className="flex min-h-screen flex-col">
    <div className="flex flex-1 flex-col items-center justify-center px-5 py-10">
      <Logo size="text-5xl" />
      <p className="mt-3 text-xl text-muted-foreground">Your health, delivered</p>
      <h1 className="mt-12 text-center text-4xl font-bold md:text-5xl">Assalamu alaikum!</h1>
      <p className="mt-3 text-2xl">Select language</p>
      <div className="mt-8 grid w-full max-w-3xl gap-4 md:grid-cols-3">
        {LANGS.map((l) => (
          <button
            key={l.id}
            onClick={() => (l.id === "en" ? nav({ to: "/home" }) : soon(`${l.label} language`))}
            className="card-soft flex items-center gap-5 p-6 text-left transition hover:border-primary hover:bg-secondary md:flex-col md:text-center"
          >
            <span className="text-6xl">{l.flag}</span>
            <span>
              <span className="block text-2xl font-bold">{l.label}</span>
              {l.id !== "en" && <span className="text-muted-foreground">Coming soon</span>}
            </span>
          </button>
        ))}
      </div>
    </div>
    <Footer />
    </div>
  );
}
