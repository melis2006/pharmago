import { Bike, Check, Clock, Truck } from "lucide-react";
import type { SVGProps } from "react";
import { toast } from "sonner";
import type { OrderStatus } from "@/lib/tracking";

const BADGE: Record<OrderStatus, { cls: string; icon: typeof Clock }> = {
  Packaged: { cls: "bg-fast text-fast-foreground", icon: Clock },
  "On the way": { cls: "bg-primary text-primary-foreground", icon: Truck },
  Delivered: { cls: "bg-secondary text-primary", icon: Check },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const { cls, icon: Icon } = BADGE[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-base font-bold ${cls}`}
    >
      <Icon className="h-4 w-4" aria-hidden /> {status}
    </span>
  );
}

// Top view of a quadcopter: body, four arms and four rotors (the blades spin unless the user
// prefers reduced motion).
export function DroneIcon({
  className = "",
  spin = true,
  ...svg
}: { className?: string; spin?: boolean } & Omit<SVGProps<SVGSVGElement>, "className">) {
  const rotors = [
    [14, 14],
    [50, 14],
    [14, 50],
    [50, 50],
  ];
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden {...svg}>
      <path
        d="M14 14 L50 50 M50 14 L14 50"
        stroke="#1f2d2a"
        strokeWidth="4"
        strokeLinecap="round"
      />
      {rotors.map(([x, y]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
          <circle r="11" fill="#ffffff" fillOpacity="0.85" stroke="#1f2d2a" strokeWidth="2" />
          <g className={spin ? "motion-safe:animate-spin" : ""} style={{ transformOrigin: "0 0" }}>
            <rect x="-9" y="-1.5" width="18" height="3" rx="1.5" fill="#1f2d2a" />
          </g>
          <circle r="2.5" fill="var(--primary)" />
        </g>
      ))}
      <rect
        x="22"
        y="22"
        width="20"
        height="20"
        rx="6"
        fill="var(--primary)"
        stroke="#1f2d2a"
        strokeWidth="2"
      />
      <circle cx="32" cy="32" r="4" fill="#ffffff" />
      {/* small red light at the front */}
      <circle cx="32" cy="24.5" r="2" fill="var(--destructive)" />
    </svg>
  );
}

export function CourierIcon({ className = "" }: { className?: string }) {
  return (
    <span
      className={`grid place-items-center rounded-full bg-fast text-fast-foreground ${className}`}
    >
      <Bike className="h-3/5 w-3/5" aria-hidden />
    </span>
  );
}

// Five large stars; stores the rating on the order.
export function RatingStars({ value, onRate }: { value: number; onRate: (n: number) => void }) {
  return (
    <div className="flex gap-1" role="group" aria-label="Rate your delivery">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
          aria-pressed={n === value}
          onClick={() => {
            onRate(n);
            toast.success("Thank you for your rating!");
          }}
          className={`grid h-14 w-12 place-items-center text-5xl leading-none ${n <= value ? "text-star" : "text-border"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
