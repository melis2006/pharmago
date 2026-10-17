import type { Condition } from "./data";

// Everything PharmaGO saves lives in this browser's localStorage under keys starting with this
// prefix. Bump the version when the saved data changes shape (old keys are removed on load).
export const STORAGE_PREFIX = "pharmago";
export const STORAGE_KEY = `${STORAGE_PREFIX}-v3`;

// Consent rule: health conditions are only kept if the user agreed to store them.
export function conditionsToSave(conditions: readonly Condition[], consent: boolean): Condition[] {
  return consent ? [...conditions] : [];
}

// Applies the consent rule to a saved user (e.g. data saved before consent existed).
export function sanitizeUser<U extends { conditions: Condition[]; healthConsent?: boolean }>(
  user: U,
): U & { healthConsent: boolean } {
  const healthConsent = user.healthConsent === true;
  return {
    ...user,
    healthConsent,
    conditions: conditionsToSave(user.conditions ?? [], healthConsent),
  };
}

const ourKeys = (storage: Storage) =>
  Array.from({ length: storage.length }, (_, i) => storage.key(i)).filter(
    (k): k is string => k?.startsWith(STORAGE_PREFIX) ?? false,
  );

// "Delete my data": removes every key PharmaGO stored in this browser. Returns the removed keys.
export function deleteMyData(storage: Storage): string[] {
  const keys = ourKeys(storage);
  keys.forEach((k) => storage.removeItem(k));
  return keys;
}

// Removes data saved by older versions of the app (e.g. pharmago-v1, pharmago-v2).
export function removeLegacyData(storage: Storage): string[] {
  const keys = ourKeys(storage).filter((k) => k !== STORAGE_KEY);
  keys.forEach((k) => storage.removeItem(k));
  return keys;
}
