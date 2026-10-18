import { useCanGoBack, useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { parentPath } from "@/lib/navigation";

// "← Back": goes back in browser history, or to a sensible parent page when the page was opened
// directly (see parentPath in src/lib/navigation.ts).
export function BackButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const nav = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <button
      type="button"
      onClick={() => (canGoBack ? router.history.back() : nav({ to: parentPath(path) }))}
      className={`inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-primary bg-card px-4 text-lg font-bold text-primary hover:bg-secondary ${className}`}
    >
      <ArrowLeft className="h-6 w-6" aria-hidden />
      Back
    </button>
  );
}
