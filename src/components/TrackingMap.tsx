import { Bike } from "lucide-react";
import { pointOnRoute, ROUTE, routePath } from "@/lib/tracking";
import { DroneIcon } from "./Order";

// Stylised street map (SVG, viewBox 400×300) with the pharmacy, the home, the curved route and
// the drone or courier moving along it. `travel` is 0..1 along the route.
export function TrackingMap({
  travel,
  method,
  className = "",
}: {
  travel: number;
  method: "drone" | "courier";
  className?: string;
}) {
  const pos = pointOnRoute(travel);
  const d = routePath();
  const blocks = [
    [8, 8, 92, 40],
    [124, 8, 86, 40],
    [234, 8, 74, 40],
    [334, 8, 58, 40],
    [8, 74, 92, 64],
    [124, 74, 86, 64],
    [334, 74, 58, 64],
    [8, 164, 92, 74],
    [124, 164, 86, 74],
    [334, 164, 58, 74],
    [8, 262, 92, 30],
    [124, 262, 86, 30],
    [234, 262, 74, 30],
    [334, 262, 58, 30],
  ];
  return (
    <div className={`relative overflow-hidden rounded-3xl bg-[#e8eee7] ${className}`}>
      <svg
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        role="img"
        aria-label={`Map: the ${method} is ${Math.round(travel * 100)}% of the way from the pharmacy to your home`}
      >
        {/* city blocks */}
        {blocks.map(([x, y, w, h]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} rx="6" fill="#dde4dc" />
        ))}
        {/* park */}
        <rect x="234" y="74" width="74" height="164" rx="10" fill="#c9e4c3" />
        {[
          [252, 96],
          [286, 110],
          [262, 140],
          [292, 176],
          [256, 200],
          [288, 220],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="9" fill="#9fcf95" />
        ))}
        {/* streets */}
        <g stroke="#ffffff" strokeWidth="14" strokeLinecap="round">
          <path d="M0 61 H400 M0 151 H400 M0 250 H400" />
          <path d="M112 0 V300 M222 0 V300 M321 0 V300" />
        </g>
        <g stroke="#e3e8e2" strokeWidth="1.5" strokeDasharray="6 6">
          <path d="M0 61 H400 M0 151 H400 M0 250 H400 M112 0 V300 M222 0 V300 M321 0 V300" />
        </g>

        {/* route: dashed all the way, solid for the part already travelled */}
        <path
          d={d}
          fill="none"
          stroke="#8fb3a7"
          strokeWidth="5"
          strokeDasharray="2 9"
          strokeLinecap="round"
        />
        <path
          d={d}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="6"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={`${travel} 1`}
          style={{ transition: "stroke-dasharray 0.5s linear" }}
        />

        {/* pharmacy pin: red cross */}
        <g transform={`translate(${ROUTE.from.x} ${ROUTE.from.y})`}>
          <path
            d="M0 0 C-14 -16 -18 -24 -18 -32 A18 18 0 1 1 18 -32 C18 -24 14 -16 0 0 Z"
            fill="#ffffff"
            stroke="var(--destructive)"
            strokeWidth="3"
          />
          <path
            d="M-3.5 -42 h7 v6.5 h6.5 v7 h-6.5 v6.5 h-7 v-6.5 h-6.5 v-7 h6.5 Z"
            fill="var(--destructive)"
          />
          <Label x={0} y={-58} text="Pharmacy" />
        </g>

        {/* home pin */}
        <g transform={`translate(${ROUTE.to.x} ${ROUTE.to.y})`}>
          <path
            d="M0 0 C-14 -16 -18 -24 -18 -32 A18 18 0 1 1 18 -32 C18 -24 14 -16 0 0 Z"
            fill="var(--primary)"
            stroke="#ffffff"
            strokeWidth="3"
          />
          <path d="M-9 -30 L0 -39 L9 -30 V-22 H-9 Z" fill="#ffffff" />
          <rect x="-2.5" y="-28" width="5" height="6" fill="var(--primary)" />
          <Label x={0} y={-58} text="Home" />
        </g>

        {/* moving drone / courier */}
        <g
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px)`,
            transition: "transform 0.5s linear",
          }}
        >
          <ellipse cx="4" cy="22" rx="16" ry="5" fill="#000000" opacity="0.15" />
          {method === "drone" ? (
            <DroneIcon x={-24} y={-24} width={48} height={48} />
          ) : (
            <>
              <circle r="20" fill="var(--fast)" stroke="#ffffff" strokeWidth="3" />
              <Bike x={-12} y={-12} width={24} height={24} color="var(--fast-foreground)" />
            </>
          )}
        </g>
      </svg>
    </div>
  );
}

function Label({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fontSize="13"
      fontWeight="700"
      fill="#1f2d2a"
      stroke="#ffffff"
      strokeWidth="4"
      paintOrder="stroke"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {text}
    </text>
  );
}
