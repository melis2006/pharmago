import { useEffect, useState } from "react";

// Current time that updates every `intervalMs` while `active` (used for live tracking).
export function useNow(intervalMs: number, active = true) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, active]);
  return now;
}
