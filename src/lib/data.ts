export type Condition =
  | "diabetes"
  | "hypertension"
  | "pregnancy"
  | "kidney"
  | "liver"
  | "ulcer"
  | "asthma"
  | "heart";

export const CONDITIONS: { id: Condition; label: string }[] = [
  { id: "diabetes", label: "Diabetes" },
  { id: "hypertension", label: "High blood pressure" },
  { id: "pregnancy", label: "Pregnancy" },
  { id: "kidney", label: "Kidney disease" },
  { id: "liver", label: "Liver disease" },
  { id: "ulcer", label: "Stomach ulcer" },
  { id: "asthma", label: "Asthma" },
  { id: "heart", label: "Heart disease" },
];

export const CATEGORIES = [
  { id: "cardio", label: "Cardio", emoji: "❤️" },
  { id: "allergy", label: "Allergy", emoji: "🌼" },
  { id: "headache", label: "Headache", emoji: "🤕" },
  { id: "pain", label: "Pain relief", emoji: "💊" },
  { id: "cold", label: "Cold & Flu", emoji: "🤧" },
  { id: "vitamins", label: "Vitamins", emoji: "🍊" },
  { id: "stomach", label: "Stomach", emoji: "🫃" },
  { id: "antibiotics", label: "Antibiotics", emoji: "🧪" },
];

export type Medicine = {
  id: string;
  name: string;
  category: string;
  symptoms: string[];
  price: number; // UZS base
  rating: number;
  distanceKm: number;
  packs: { label: string; tablets: number; multiplier: number }[];
  country: string;
  manufacturer: string;
  made: string;
  expiry: string;
  antibiotic: boolean;
  prescription: boolean;
  age: string;
  howTo: string;
  annotation: string;
  conflicts: { condition: Condition; reason: string }[];
};

const packs = (n: number) => [
  { label: `${n} tablets`, tablets: n, multiplier: 1 },
  { label: `${n / 2} tablets`, tablets: n / 2, multiplier: 0.55 },
];

export const MEDICINES: Medicine[] = [
  {
    id: "paracetamol",
    name: "Paracetamol 500 mg",
    category: "pain",
    symptoms: ["fever", "headache", "pain"],
    price: 12000,
    rating: 4.8,
    distanceKm: 0.8,
    packs: packs(100),
    country: "India",
    manufacturer: "Micro Labs",
    made: "03/2026",
    expiry: "03/2029",
    antibiotic: false,
    prescription: false,
    age: "12+ years",
    howTo: "1–2 tablets every 4–6 hours after food. Max 8 tablets a day.",
    annotation:
      "Paracetamol relieves mild to moderate pain and reduces fever. Do not combine with other paracetamol-containing products. Avoid alcohol.",
    conflicts: [{ condition: "liver", reason: "Paracetamol can damage the liver in people with liver disease." }],
  },
  {
    id: "teraflu",
    name: "Teraflu Lemon",
    category: "cold",
    symptoms: ["cold", "flu", "fever", "cough"],
    price: 68000,
    rating: 4.7,
    distanceKm: 1.2,
    packs: [
      { label: "10 sachets", tablets: 10, multiplier: 1 },
      { label: "5 sachets", tablets: 5, multiplier: 0.55 },
    ],
    country: "Switzerland",
    manufacturer: "GSK Consumer Healthcare",
    made: "01/2026",
    expiry: "01/2028",
    antibiotic: false,
    prescription: false,
    age: "12+ years",
    howTo: "Dissolve 1 sachet in hot water. Up to 3 times a day.",
    annotation: "Relieves symptoms of cold and flu: fever, headache, runny nose. Each sachet contains sugar.",
    conflicts: [
      { condition: "diabetes", reason: "Teraflu contains about 11 g of sugar per sachet." },
      { condition: "hypertension", reason: "Contains phenylephrine, which can raise blood pressure." },
    ],
  },
  {
    id: "ibuprofen",
    name: "Ibuprofen 400 mg",
    category: "headache",
    symptoms: ["headache", "pain", "toothache"],
    price: 18000,
    rating: 4.6,
    distanceKm: 0.5,
    packs: packs(50),
    country: "Germany",
    manufacturer: "Berlin-Chemie",
    made: "05/2026",
    expiry: "05/2029",
    antibiotic: false,
    prescription: false,
    age: "12+ years",
    howTo: "1 tablet up to 3 times a day after food.",
    annotation: "Anti-inflammatory pain reliever. Take with food to protect the stomach.",
    conflicts: [
      { condition: "ulcer", reason: "Ibuprofen can irritate the stomach and cause bleeding." },
      { condition: "asthma", reason: "May trigger asthma attacks in sensitive people." },
      { condition: "pregnancy", reason: "Not recommended in pregnancy, especially the third trimester." },
    ],
  },
  {
    id: "cetirizine",
    name: "Cetirizine 10 mg",
    category: "allergy",
    symptoms: ["allergy", "sneezing", "itching"],
    price: 15000,
    rating: 4.9,
    distanceKm: 1.6,
    packs: packs(20),
    country: "Slovenia",
    manufacturer: "KRKA",
    made: "02/2026",
    expiry: "02/2029",
    antibiotic: false,
    prescription: false,
    age: "6+ years",
    howTo: "1 tablet once a day, in the evening.",
    annotation: "Antihistamine for hay fever, hives and allergic reactions. May cause drowsiness.",
    conflicts: [{ condition: "kidney", reason: "Dose must be reduced with kidney disease." }],
  },
  {
    id: "amoxicillin",
    name: "Amoxicillin 500 mg",
    category: "antibiotics",
    symptoms: ["infection", "sore throat"],
    price: 32000,
    rating: 4.5,
    distanceKm: 2.1,
    packs: packs(20),
    country: "Austria",
    manufacturer: "Sandoz",
    made: "04/2026",
    expiry: "04/2028",
    antibiotic: true,
    prescription: true,
    age: "All ages (dose by weight)",
    howTo: "1 capsule 3 times a day for 7 days, as prescribed by your doctor.",
    annotation: "Antibiotic for bacterial infections. Complete the full course. Not effective against viruses.",
    conflicts: [{ condition: "kidney", reason: "Requires dose adjustment in kidney disease." }],
  },
  {
    id: "vitamin-c",
    name: "Vitamin C 1000 mg",
    category: "vitamins",
    symptoms: ["immunity", "cold"],
    price: 45000,
    rating: 4.8,
    distanceKm: 0.9,
    packs: packs(60),
    country: "USA",
    manufacturer: "Now Foods",
    made: "06/2026",
    expiry: "06/2028",
    antibiotic: false,
    prescription: false,
    age: "18+ years",
    howTo: "1 tablet a day with a meal.",
    annotation: "Supports the immune system. Dietary supplement.",
    conflicts: [{ condition: "kidney", reason: "High doses of vitamin C may cause kidney stones." }],
  },
  {
    id: "omeprazole",
    name: "Omeprazole 20 mg",
    category: "stomach",
    symptoms: ["heartburn", "stomach pain"],
    price: 22000,
    rating: 4.7,
    distanceKm: 1.4,
    packs: packs(30),
    country: "Turkey",
    manufacturer: "Nobel Ilac",
    made: "02/2026",
    expiry: "02/2029",
    antibiotic: false,
    prescription: false,
    age: "18+ years",
    howTo: "1 capsule in the morning before breakfast.",
    annotation: "Reduces stomach acid. Used for heartburn and ulcers.",
    conflicts: [],
  },
  {
    id: "aspirin-cardio",
    name: "Aspirin Cardio 100 mg",
    category: "cardio",
    symptoms: ["heart", "blood thinning"],
    price: 38000,
    rating: 4.8,
    distanceKm: 1.0,
    packs: packs(56),
    country: "Germany",
    manufacturer: "Bayer",
    made: "03/2026",
    expiry: "03/2029",
    antibiotic: false,
    prescription: false,
    age: "18+ years",
    howTo: "1 tablet a day after food, as advised by your doctor.",
    annotation: "Low-dose aspirin for preventing heart attacks and strokes.",
    conflicts: [
      { condition: "ulcer", reason: "Aspirin increases the risk of stomach bleeding." },
      { condition: "asthma", reason: "Aspirin may trigger asthma attacks." },
    ],
  },
];

export type Pharmacy = {
  id: string;
  name: string;
  rating: number;
  address: string;
  distanceKm: number;
  phone: string;
  deliveryMin: number;
  freeDelivery: boolean;
  open247: boolean;
  priceFactor: number;
  x: number;
  y: number;
};

export const PHARMACIES: Pharmacy[] = [
  { id: "oxymed", name: "OxyMed Pharmacy", rating: 4.9, address: "Amir Temur Ave 15, Tashkent", distanceKm: 0.8, phone: "+998 71 200 11 22", deliveryMin: 15, freeDelivery: true, open247: true, priceFactor: 1, x: 30, y: 40 },
  { id: "dori", name: "Dori-Darmon", rating: 4.6, address: "Navoi St 42, Tashkent", distanceKm: 1.9, phone: "+998 71 233 44 55", deliveryMin: 25, freeDelivery: false, open247: false, priceFactor: 0.92, x: 65, y: 30 },
  { id: "grand", name: "Grand Pharm", rating: 4.7, address: "Chilonzor 9, Tashkent", distanceKm: 3.4, phone: "+998 71 277 88 99", deliveryMin: 30, freeDelivery: true, open247: false, priceFactor: 0.88, x: 20, y: 72 },
  { id: "arzon", name: "Arzon Apteka", rating: 4.3, address: "Yunusobod 4, Tashkent", distanceKm: 2.6, phone: "+998 71 211 00 33", deliveryMin: 20, freeDelivery: false, open247: true, priceFactor: 0.85, x: 75, y: 65 },
];

export const getMedicine = (id: string) => MEDICINES.find((m) => m.id === id);
export const getPharmacy = (id: string) => PHARMACIES.find((p) => p.id === id) ?? PHARMACIES[0]!;

export const formatUZS = (n: number) => `${(Math.round(n / 100) * 100).toLocaleString("en-US")} UZS`;

export const DELIVERY = {
  drone: { label: "Drone", time: "10–15 min", price: 15000 },
  courier: { label: "Courier", time: "20–30 min", price: 10000 },
} as const;
