import { describe, expect, it } from "vitest";

import {
  addAddress,
  defaultAddress,
  EMPTY_ADDRESS,
  formatAddress,
  isValidAddress,
  removeAddress,
  setDefaultAddress,
  updateAddress,
  validateAddress,
  type AddressInput,
} from "@/lib/address";

const home: AddressInput = {
  ...EMPTY_ADDRESS,
  district: "Yunusobod",
  street: "Amir Temur 15",
  apartment: "12",
};

describe("address validation", () => {
  it("accepts an address with city, district, street and house number", () => {
    expect(validateAddress(home)).toEqual({});
    expect(isValidAddress(home)).toBe(true);
  });

  it("uses Tashkent as the default city", () => {
    expect(EMPTY_ADDRESS.city).toBe("Tashkent");
  });

  it("asks for every required field on an empty form", () => {
    const errors = validateAddress({ ...EMPTY_ADDRESS, city: "" });
    expect(Object.keys(errors).sort()).toEqual(["city", "district", "street"]);
    expect(errors.street).toBe("Please enter the street and house number.");
  });

  it("treats fields with only spaces as empty", () => {
    expect(validateAddress({ ...home, district: "   ", street: "  " })).toMatchObject({
      district: "Please enter your district.",
      street: "Please enter the street and house number.",
    });
  });

  it("asks for a house number when the street has none", () => {
    expect(validateAddress({ ...home, street: "Amir Temur" }).street).toMatch(/house number/);
  });

  it("does not require apartment, entrance or note", () => {
    expect(validateAddress({ ...home, apartment: "", entrance: "", note: "" })).toEqual({});
  });

  it("limits the length of fields", () => {
    expect(validateAddress({ ...home, note: "x".repeat(201) }).note).toMatch(/at most 200/);
    expect(validateAddress({ ...home, apartment: "12345678901" }).apartment).toMatch(/at most 10/);
  });
});

describe("address formatting", () => {
  it("joins the filled fields into one line", () => {
    expect(formatAddress({ ...home, entrance: "2" })).toBe(
      "Amir Temur 15, apt 12, entrance 2, Yunusobod, Tashkent",
    );
    expect(formatAddress({ ...home, apartment: "" })).toBe("Amir Temur 15, Yunusobod, Tashkent");
  });
});

describe("saved address list", () => {
  it("makes the first address the default", () => {
    const list = addAddress([], home, { id: "a" });
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ id: "a", isDefault: true, street: "Amir Temur 15" });
  });

  it("keeps the old default when adding another address, unless asked", () => {
    let list = addAddress([], home, { id: "a" });
    list = addAddress(list, { ...home, street: "Navoi 42" }, { id: "b" });
    expect(defaultAddress(list)?.id).toBe("a");
    list = addAddress(list, { ...home, street: "Chilonzor 9" }, { id: "c", makeDefault: true });
    expect(defaultAddress(list)?.id).toBe("c");
    expect(list.filter((a) => a.isDefault)).toHaveLength(1);
  });

  it("changes the default address", () => {
    let list = addAddress(addAddress([], home, { id: "a" }), home, { id: "b" });
    list = setDefaultAddress(list, "b");
    expect(list.map((a) => a.isDefault)).toEqual([false, true]);
  });

  it("edits an address and trims its fields", () => {
    const list = updateAddress(addAddress([], home, { id: "a" }), "a", {
      ...home,
      street: "  Navoi 42 ",
    });
    expect(list[0]).toMatchObject({ id: "a", street: "Navoi 42", isDefault: true });
  });

  it("moves the default to another address when the default is deleted", () => {
    let list = addAddress(addAddress([], home, { id: "a" }), home, { id: "b" });
    list = removeAddress(list, "a");
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ id: "b", isDefault: true });
    expect(removeAddress(list, "b")).toEqual([]);
    expect(defaultAddress([])).toBeUndefined();
  });
});
