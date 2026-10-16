import { CONDITIONS, type Condition, type Medicine } from "./data";

export type Warning = { condition: Condition; label: string; reason: string };

// Conflicts between a medicine and the user's health conditions, in the medicine's order.
// An empty list means the medicine is not flagged ("Not recommended for you" is not shown).
export function getWarnings(m: Medicine, conditions: readonly Condition[]): Warning[] {
  return m.conflicts
    .filter((c) => conditions.includes(c.condition))
    .map((c) => ({ condition: c.condition, label: CONDITIONS.find((x) => x.id === c.condition)?.label ?? c.condition, reason: c.reason }));
}
