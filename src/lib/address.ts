// Delivery addresses: the form fields, validation and list helpers (pure, unit-tested).

export type AddressInput = {
  city: string;
  district: string;
  street: string; // street and house number
  apartment: string;
  entrance: string; // entrance / door code
  note: string; // landmark or note for the courier
};

export type Address = AddressInput & { id: string; isDefault: boolean };

export type AddressErrors = Partial<Record<keyof AddressInput, string>>;

export const EMPTY_ADDRESS: AddressInput = {
  city: "Tashkent",
  district: "",
  street: "",
  apartment: "",
  entrance: "",
  note: "",
};

// The 12 districts of Tashkent, offered as suggestions in the form.
export const TASHKENT_DISTRICTS = [
  "Bektemir",
  "Chilonzor",
  "Mirobod",
  "Mirzo Ulug'bek",
  "Olmazor",
  "Sergeli",
  "Shayxontohur",
  "Uchtepa",
  "Yakkasaroy",
  "Yangihayot",
  "Yashnobod",
  "Yunusobod",
];

export const MAX_LENGTH: Record<keyof AddressInput, number> = {
  city: 50,
  district: 50,
  street: 100,
  apartment: 10,
  entrance: 20,
  note: 200,
};

export function trimAddress(a: AddressInput): AddressInput {
  return {
    city: a.city.trim(),
    district: a.district.trim(),
    street: a.street.trim(),
    apartment: a.apartment.trim(),
    entrance: a.entrance.trim(),
    note: a.note.trim(),
  };
}

// Returns one plain-English message per wrong field; an empty object means the address is valid.
export function validateAddress(input: AddressInput): AddressErrors {
  const a = trimAddress(input);
  const errors: AddressErrors = {};
  if (!a.city) errors.city = "Please enter your city.";
  if (!a.district) errors.district = "Please enter your district.";
  if (!a.street) errors.street = "Please enter the street and house number.";
  else if (!/\d/.test(a.street))
    errors.street = "Please add the house number, for example: Amir Temur 15.";
  for (const key of Object.keys(MAX_LENGTH) as (keyof AddressInput)[]) {
    if (!errors[key] && a[key].length > MAX_LENGTH[key])
      errors[key] = `Please use at most ${MAX_LENGTH[key]} characters.`;
  }
  return errors;
}

export const isValidAddress = (input: AddressInput) =>
  Object.keys(validateAddress(input)).length === 0;

// One line for lists, orders and the courier: "Amir Temur 15, apt 12, entrance 2, Yunusobod, Tashkent".
export function formatAddress(a: AddressInput): string {
  const t = trimAddress(a);
  return [
    t.street,
    t.apartment && `apt ${t.apartment}`,
    t.entrance && `entrance ${t.entrance}`,
    t.district,
    t.city,
  ]
    .filter(Boolean)
    .join(", ");
}

let counter = 0;
export const newAddressId = () => `addr-${Date.now().toString(36)}-${(counter++).toString(36)}`;

// The default address, or the first one if none is marked (undefined when the list is empty).
export const defaultAddress = (list: readonly Address[]) =>
  list.find((a) => a.isDefault) ?? list[0];

// Exactly one address is the default whenever the list is not empty.
function withOneDefault(list: Address[], preferId?: string): Address[] {
  if (list.length === 0) return list;
  const id = preferId ?? defaultAddress(list)!.id;
  return list.map((a) => ({ ...a, isDefault: a.id === id }));
}

// Adds a new address. The first address always becomes the default.
export function addAddress(
  list: readonly Address[],
  input: AddressInput,
  opts: { id?: string; makeDefault?: boolean } = {},
): Address[] {
  const id = opts.id ?? newAddressId();
  const next = [...list, { ...trimAddress(input), id, isDefault: false }];
  return withOneDefault(next, opts.makeDefault || list.length === 0 ? id : undefined);
}

export function updateAddress(
  list: readonly Address[],
  id: string,
  input: AddressInput,
): Address[] {
  return list.map((a) => (a.id === id ? { ...a, ...trimAddress(input) } : a));
}

// Removing the default address makes the first remaining one the default.
export function removeAddress(list: readonly Address[], id: string): Address[] {
  return withOneDefault(list.filter((a) => a.id !== id));
}

export function setDefaultAddress(list: readonly Address[], id: string): Address[] {
  return list.some((a) => a.id === id) ? withOneDefault([...list], id) : [...list];
}
