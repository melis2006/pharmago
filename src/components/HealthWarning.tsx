import { AlertTriangle } from "lucide-react";
import type { Condition, Medicine } from "@/lib/data";
import { getWarnings } from "@/lib/health";

// Red "Not recommended for you" box. Renders nothing when the medicine is fine for these conditions.
export function HealthWarning({ m, conditions }: { m: Medicine; conditions: readonly Condition[] }) {
  const warnings = getWarnings(m, conditions);
  if (warnings.length === 0) return null;
  return (
    <div role="alert" className="mb-6 rounded-2xl border-4 border-destructive bg-destructive-soft p-5">
      <div className="flex items-center gap-3 text-2xl font-bold text-destructive"><AlertTriangle className="h-8 w-8 shrink-0" /> Not recommended for you</div>
      <ul className="mt-2 space-y-1 text-lg">
        {warnings.map((w) => (
          <li key={w.condition}><b>{w.label}:</b> {w.reason}</li>
        ))}
      </ul>
      <p className="mt-2 text-lg font-bold">Please consult your doctor before taking this medicine.</p>
    </div>
  );
}
