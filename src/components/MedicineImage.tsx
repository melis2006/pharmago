import { brandName, type Medicine } from "@/lib/data";

// Container per place the image is shown. The photo is always object-contain on white,
// so it keeps its proportions and is never stretched or cropped.
const SIZES = {
  card: "aspect-[4/3] w-full border-b p-4",
  hero: "aspect-square w-full rounded-3xl border p-8 md:p-12",
  thumb: "h-20 w-20 shrink-0 rounded-xl border p-1.5",
  mini: "h-14 w-14 shrink-0 rounded-lg border p-1",
} as const;

export function MedicineImage({
  m,
  size = "card",
  decorative = false,
  className = "",
}: {
  m: Medicine;
  size?: keyof typeof SIZES;
  decorative?: boolean; // true when the medicine name is already written next to the image
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center overflow-hidden bg-white ${SIZES[size]} ${className}`}
    >
      {m.image ? (
        <img
          src={m.image}
          alt={decorative ? "" : m.name}
          loading={size === "hero" ? "eager" : "lazy"}
          className="h-full w-full object-contain"
        />
      ) : (
        <MedicineBox m={m} label={decorative ? undefined : m.name} />
      )}
    </div>
  );
}

// Generated "pharmacy box" for medicines without a photo: a white box with a stripe in the
// medicine's colour, its name and strength.
export function MedicineBox({ m, label }: { m: Medicine; label?: string | undefined }) {
  const name = brandName(m);
  const nameSize = Math.min(22, 230 / Math.max(name.length, 1));
  const ink = "#1f2d2a";
  const edge = "#cfd8d5";
  return (
    <svg
      viewBox="0 0 240 180"
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full select-none"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <ellipse cx="125" cy="160" rx="92" ry="9" fill="#000" opacity="0.08" />
      {/* top and right side give the box some depth */}
      <polygon
        points="30,42 192,42 214,26 52,26"
        fill="#f1f4f3"
        stroke={edge}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <polygon
        points="192,42 214,26 214,136 192,152"
        fill="#e2e8e6"
        stroke={edge}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <polygon points="192,100 214,84 214,106 192,122" fill={m.color} opacity="0.85" />
      <rect x="30" y="42" width="162" height="110" fill="#fff" stroke={edge} strokeWidth="1.5" />
      <rect x="30" y="100" width="162" height="22" fill={m.color} />
      <text
        x="111"
        y="78"
        textAnchor="middle"
        fontWeight="700"
        fontSize={nameSize}
        fill={ink}
        style={{ fontFamily: "var(--font-display)" }}
      >
        {name}
      </text>
      <text
        x="111"
        y="116"
        textAnchor="middle"
        fontWeight="700"
        fontSize="13"
        fill="#fff"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {m.strength ?? m.form}
      </text>
      <text
        x="111"
        y="141"
        textAnchor="middle"
        fontSize="11"
        fill="#5b6b67"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {m.packs[0]?.label}
      </text>
    </svg>
  );
}
