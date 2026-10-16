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

// What a medicine is, independent of where it is sold. Price, origin, manufacturer and dates
// belong to an Offer (one pharmacy selling one medicine), see OFFERS below.
export type Medicine = {
  id: string;
  name: string;
  category: string;
  form: "tablets" | "capsules" | "lozenges" | "syrup" | "sachets";
  symptoms: string[];
  rating: number;
  // packs[0] is the full pack; offer prices are for packs[0], other packs use the multiplier.
  packs: { label: string; tablets: number; multiplier: number }[];
  antibiotic: boolean;
  prescription: boolean;
  age: string;
  howTo: string;
  annotation: string;
  conflicts: { condition: Condition; reason: string }[];
};

const packs = (n: number, unit = "tablets") => [
  { label: `${n} ${unit}`, tablets: n, multiplier: 1 },
  { label: `${n / 2} ${unit}`, tablets: n / 2, multiplier: 0.55 },
];

export const MEDICINES: Medicine[] = [
  {
    id: "fanigan",
    name: "Fanigan 200 mg",
    category: "pain",
    form: "tablets",
    symptoms: ["pain", "fever", "headache", "toothache", "back pain"],
    rating: 4.7,
    packs: packs(100),
    antibiotic: false,
    prescription: false,
    age: "18+ years",
    howTo: "1 tablet 2–3 times a day after food. Do not take for more than 5 days without a doctor.",
    annotation:
      "Fanigan combines Diclofenac sodium and Paracetamol. It is a non-steroidal anti-inflammatory drug (NSAID) that relieves pain, reduces inflammation and lowers fever. Take after food with a full glass of water.",
    conflicts: [
      { condition: "ulcer", reason: "Diclofenac can irritate the stomach and cause bleeding." },
      { condition: "kidney", reason: "NSAIDs such as diclofenac can worsen kidney function." },
      { condition: "liver", reason: "Paracetamol and diclofenac can damage the liver in people with liver disease." },
      { condition: "heart", reason: "Diclofenac increases the risk of heart attack and stroke." },
      { condition: "pregnancy", reason: "NSAIDs are not recommended in pregnancy, especially the third trimester." },
      { condition: "asthma", reason: "NSAIDs may trigger asthma attacks." },
    ],
  },
  {
    id: "fanigolin",
    name: "Fanigolin 200 mg",
    category: "cold",
    form: "lozenges",
    symptoms: ["sore throat", "cough", "cold"],
    rating: 4.5,
    packs: packs(20, "lozenges"),
    antibiotic: false,
    prescription: false,
    age: "12+ years",
    howTo: "Dissolve 1 lozenge slowly in the mouth every 3–4 hours. Max 6 lozenges a day.",
    annotation:
      "Lozenges for sore throat. They soothe irritation and ease pain when swallowing. Each lozenge contains sugar.",
    conflicts: [{ condition: "diabetes", reason: "Each lozenge contains sugar." }],
  },
  {
    id: "fanibrufen",
    name: "Fanibrufen 300 ml",
    category: "pain",
    form: "syrup",
    symptoms: ["fever", "pain", "headache", "toothache"],
    rating: 4.6,
    packs: [
      { label: "300 ml bottle", tablets: 1, multiplier: 1 },
      { label: "150 ml bottle", tablets: 1, multiplier: 0.55 },
    ],
    antibiotic: false,
    prescription: false,
    age: "3+ years (dose by weight)",
    howTo: "Use the measuring cup. Adults: 10–20 ml up to 3 times a day after food. Children: dose by weight.",
    annotation: "Ibuprofen syrup that lowers fever and relieves pain. The syrup contains sugar.",
    conflicts: [
      { condition: "diabetes", reason: "The syrup contains sugar." },
      { condition: "ulcer", reason: "Ibuprofen can irritate the stomach and cause bleeding." },
      { condition: "asthma", reason: "Ibuprofen may trigger asthma attacks in sensitive people." },
    ],
  },
  {
    id: "bronho-munal",
    name: "Bronho-Munal 7 mg",
    category: "vitamins",
    form: "capsules",
    symptoms: ["immunity", "cough", "cold", "bronchitis"],
    rating: 4.6,
    packs: packs(10, "capsules"),
    antibiotic: false,
    prescription: false,
    age: "12+ years",
    howTo: "1 capsule a day in the morning on an empty stomach, for 10 days a month, 3 months in a row.",
    annotation:
      "Strengthens the immune system and helps prevent repeated infections of the airways (bronchitis, sore throat, sinusitis).",
    conflicts: [{ condition: "pregnancy", reason: "Not recommended in pregnancy: there is not enough safety data." }],
  },
  {
    id: "immunoaktiv",
    name: "ImmunoAktiv",
    category: "vitamins",
    form: "tablets",
    symptoms: ["immunity", "vitamins", "tiredness"],
    rating: 4.8,
    packs: packs(60),
    antibiotic: false,
    prescription: false,
    age: "18+ years",
    howTo: "1 tablet a day with a meal and a glass of water.",
    annotation: "Multivitamin with vitamins C, D3 and zinc to support the immune system. Dietary supplement.",
    conflicts: [],
  },
  {
    id: "paracetamol",
    name: "Paracetamol 500 mg",
    category: "pain",
    form: "tablets",
    symptoms: ["fever", "headache", "pain"],
    rating: 4.8,
    packs: packs(100),
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
    form: "sachets",
    symptoms: ["cold", "flu", "fever", "cough"],
    rating: 4.7,
    packs: [
      { label: "10 sachets", tablets: 10, multiplier: 1 },
      { label: "5 sachets", tablets: 5, multiplier: 0.55 },
    ],
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
    form: "tablets",
    symptoms: ["headache", "pain", "toothache"],
    rating: 4.6,
    packs: packs(50),
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
    form: "tablets",
    symptoms: ["allergy", "sneezing", "itching"],
    rating: 4.9,
    packs: packs(20),
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
    form: "capsules",
    symptoms: ["infection", "sore throat"],
    rating: 4.5,
    packs: packs(20),
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
    form: "tablets",
    symptoms: ["immunity", "cold"],
    rating: 4.8,
    packs: packs(60),
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
    form: "capsules",
    symptoms: ["heartburn", "stomach pain"],
    rating: 4.7,
    packs: packs(30),
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
    form: "tablets",
    symptoms: ["heart", "blood thinning"],
    rating: 4.8,
    packs: packs(56),
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
  tagline: string;
  rating: number;
  address: string;
  distanceKm: number;
  phone: string;
  deliveryMin: number;
  freeDelivery: boolean;
  open247: boolean;
  x: number; // position on the demo map, in %
  y: number;
};

// Demo pharmacies. The first three are from the Figma design; the rest are fictional.
export const PHARMACIES: Pharmacy[] = [
  { id: "horoshiy", name: "Horoshiy Pharm", tagline: "Discounts on best deals", rating: 4.5, address: "Durmon Yo'li 35, Tashkent", distanceKm: 4.5, phone: "+998 99 999 88 77", deliveryMin: 15, freeDelivery: true, open247: false, x: 25, y: 30 },
  { id: "algo", name: "Algo Pharm", tagline: "Free delivery", rating: 4.5, address: "Alisher Navoiy 12, Tashkent", distanceKm: 4.7, phone: "+998 91 111 87 77", deliveryMin: 20, freeDelivery: true, open247: false, x: 72, y: 25 },
  { id: "fomeks", name: "Fomeks Pharm", tagline: "Discounts on best deals", rating: 4.4, address: "Amir Temur 2, Tashkent", distanceKm: 4.8, phone: "+998 94 959 78 77", deliveryMin: 24, freeDelivery: true, open247: false, x: 80, y: 75 },
  { id: "shifo", name: "Shifo Pharm", tagline: "Care close to home", rating: 4.7, address: "Chilonzor 9, Tashkent", distanceKm: 1.2, phone: "+998 90 312 45 67", deliveryMin: 30, freeDelivery: false, open247: false, x: 40, y: 60 },
  { id: "soglom", name: "Sog'lom Plus", tagline: "Everyday low prices", rating: 4.2, address: "Yunusobod 4, Tashkent", distanceKm: 2.6, phone: "+998 93 540 21 09", deliveryMin: 35, freeDelivery: false, open247: false, x: 60, y: 42 },
  { id: "medline", name: "MedLine 24/7", tagline: "Open day and night", rating: 4.6, address: "Mirzo Ulug'bek 56, Tashkent", distanceKm: 3.3, phone: "+998 97 700 24 07", deliveryMin: 25, freeDelivery: false, open247: true, x: 18, y: 78 },
];

// One pharmacy selling one medicine. price is for the medicine's first pack; qty is units in stock.
// Dates are DD/MM/YY, as in the design.
export type Offer = {
  pharmacyId: string;
  medicineId: string;
  price: number; // sum
  qty: number;
  country: string;
  manufacturer: string;
  made: string;
  expiry: string;
};

const offer = (
  pharmacyId: string,
  medicineId: string,
  price: number,
  qty: number,
  country: string,
  manufacturer: string,
  made: string,
  expiry: string,
): Offer => ({ pharmacyId, medicineId, price, qty, country, manufacturer, made, expiry });

export const OFFERS: Offer[] = [
  offer("horoshiy", "fanigan", 35000, 40, "India", "Kusum Healthcare Pvt. Ltd.", "12/01/24", "11/03/27"),
  offer("algo", "fanigan", 38500, 25, "Germany", "Merck Healthcare", "05/06/25", "05/06/28"),
  offer("fomeks", "fanigan", 33000, 18, "Russia", "Sanofi", "20/09/25", "20/09/28"),
  offer("shifo", "fanigan", 36500, 12, "India", "Kusum Healthcare Pvt. Ltd.", "02/02/26", "02/02/29"),

  offer("horoshiy", "fanigolin", 28000, 30, "India", "Kusum Healthcare Pvt. Ltd.", "10/03/25", "10/03/28"),
  offer("algo", "fanigolin", 31000, 22, "India", "Kusum Healthcare Pvt. Ltd.", "15/07/25", "15/07/28"),
  offer("soglom", "fanigolin", 26500, 15, "India", "Kusum Healthcare Pvt. Ltd.", "01/11/25", "01/11/28"),

  offer("horoshiy", "fanibrufen", 42000, 20, "India", "Kusum Healthcare Pvt. Ltd.", "04/04/25", "04/04/27"),
  offer("fomeks", "fanibrufen", 39500, 14, "Russia", "Pharmstandard", "18/08/25", "18/08/27"),
  offer("medline", "fanibrufen", 44000, 9, "India", "Kusum Healthcare Pvt. Ltd.", "03/12/25", "03/12/27"),

  offer("algo", "bronho-munal", 95000, 10, "Slovenia", "Lek (Sandoz)", "11/02/25", "11/02/30"),
  offer("fomeks", "bronho-munal", 89000, 8, "Slovenia", "Lek (Sandoz)", "22/05/25", "22/05/30"),
  offer("shifo", "bronho-munal", 92000, 6, "Slovenia", "Lek (Sandoz)", "09/09/25", "09/09/30"),
  offer("medline", "bronho-munal", 99000, 12, "Slovenia", "Lek (Sandoz)", "14/01/26", "14/01/31"),

  offer("horoshiy", "immunoaktiv", 54000, 35, "Germany", "Queisser Pharma", "01/03/25", "01/03/28"),
  offer("algo", "immunoaktiv", 57000, 20, "Poland", "Aflofarm", "12/06/25", "12/06/28"),
  offer("soglom", "immunoaktiv", 49000, 28, "Germany", "Queisser Pharma", "30/10/25", "30/10/28"),

  offer("horoshiy", "paracetamol", 12500, 60, "India", "Micro Labs", "03/03/26", "03/03/29"),
  offer("algo", "paracetamol", 11800, 45, "Uzbekistan", "Jurabek Laboratories", "15/01/26", "15/01/29"),
  offer("fomeks", "paracetamol", 13200, 50, "Russia", "Pharmstandard", "20/02/26", "20/02/29"),
  offer("shifo", "paracetamol", 11500, 30, "India", "Micro Labs", "07/04/26", "07/04/29"),
  offer("soglom", "paracetamol", 10900, 70, "Uzbekistan", "Jurabek Laboratories", "25/03/26", "25/03/29"),
  offer("medline", "paracetamol", 13900, 40, "India", "Micro Labs", "11/05/26", "11/05/29"),

  offer("horoshiy", "teraflu", 69000, 24, "Switzerland", "GSK Consumer Healthcare", "10/01/26", "10/01/28"),
  offer("algo", "teraflu", 72000, 16, "USA", "GSK Consumer Healthcare", "05/12/25", "05/12/27"),
  offer("soglom", "teraflu", 66000, 20, "Poland", "GSK Consumer Healthcare", "18/02/26", "18/02/28"),
  offer("medline", "teraflu", 74500, 12, "Switzerland", "GSK Consumer Healthcare", "22/03/26", "22/03/28"),

  offer("algo", "ibuprofen", 18500, 40, "Germany", "Berlin-Chemie", "05/05/26", "05/05/29"),
  offer("fomeks", "ibuprofen", 16900, 35, "Russia", "Pharmstandard", "14/03/26", "14/03/29"),
  offer("shifo", "ibuprofen", 17500, 25, "India", "Micro Labs", "28/01/26", "28/01/29"),
  offer("medline", "ibuprofen", 19900, 30, "Germany", "Berlin-Chemie", "09/04/26", "09/04/29"),

  offer("horoshiy", "cetirizine", 15500, 30, "Slovenia", "KRKA", "02/02/26", "02/02/29"),
  offer("soglom", "cetirizine", 13900, 25, "India", "Dr. Reddy's", "16/12/25", "16/12/28"),
  offer("medline", "cetirizine", 16800, 20, "Slovenia", "KRKA", "21/03/26", "21/03/29"),

  offer("algo", "amoxicillin", 33000, 20, "Austria", "Sandoz", "04/04/26", "04/04/28"),
  offer("fomeks", "amoxicillin", 29500, 18, "India", "Micro Labs", "19/02/26", "19/02/28"),
  offer("shifo", "amoxicillin", 31500, 15, "Austria", "Sandoz", "08/03/26", "08/03/28"),
  offer("medline", "amoxicillin", 34500, 22, "Austria", "Sandoz", "27/04/26", "27/04/28"),

  offer("horoshiy", "vitamin-c", 46000, 25, "USA", "Now Foods", "06/06/26", "06/06/28"),
  offer("soglom", "vitamin-c", 42500, 30, "Germany", "Queisser Pharma", "13/04/26", "13/04/28"),
  offer("medline", "vitamin-c", 48000, 18, "USA", "Now Foods", "01/05/26", "01/05/28"),

  offer("horoshiy", "omeprazole", 21500, 35, "Turkey", "Nobel Ilac", "02/02/26", "02/02/29"),
  offer("fomeks", "omeprazole", 20500, 28, "Russia", "Ozon", "17/01/26", "17/01/29"),
  offer("shifo", "omeprazole", 22800, 20, "Slovenia", "KRKA", "24/03/26", "24/03/29"),
  offer("medline", "omeprazole", 23900, 16, "Turkey", "Nobel Ilac", "12/04/26", "12/04/29"),

  offer("algo", "aspirin-cardio", 39000, 30, "Germany", "Bayer", "03/03/26", "03/03/29"),
  offer("fomeks", "aspirin-cardio", 37200, 22, "Germany", "Bayer", "15/02/26", "15/02/29"),
  offer("soglom", "aspirin-cardio", 36000, 26, "Germany", "Bayer", "08/01/26", "08/01/29"),
  offer("medline", "aspirin-cardio", 41000, 14, "Germany", "Bayer", "20/04/26", "20/04/29"),
];

export const getMedicine = (id: string) => MEDICINES.find((m) => m.id === id);
export const getPharmacy = (id: string) => PHARMACIES.find((p) => p.id === id) ?? PHARMACIES[0]!;

// Offers for a medicine, in PHARMACIES order. In-stock offers come first.
export const offersFor = (offers: Offer[], medicineId: string) => {
  const order = (o: Offer) => PHARMACIES.findIndex((p) => p.id === o.pharmacyId);
  return offers
    .filter((o) => o.medicineId === medicineId)
    .sort((a, b) => Number(b.qty > 0) - Number(a.qty > 0) || order(a) - order(b));
};

export const formatSum = (n: number) => `${(Math.round(n / 100) * 100).toLocaleString("en-US")} sum`;

export const DELIVERY = {
  drone: { label: "Drone", time: "10–15 min", price: 15000 },
  courier: { label: "Courier", time: "20–30 min", price: 10000 },
} as const;
