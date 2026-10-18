// Checks what the real store writes to localStorage for consent, logout and "Delete my data".
import { act, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { addAddress, EMPTY_ADDRESS } from "@/lib/address";
import { STORAGE_KEY } from "@/lib/privacy";
import { StoreProvider, useStore } from "@/lib/store";

type Store = ReturnType<typeof useStore>;

function renderStore() {
  const ref: { current: Store | null } = { current: null };
  function Capture() {
    ref.current = useStore();
    return null;
  }
  render(
    <StoreProvider>
      <Capture />
    </StoreProvider>,
  );
  return ref;
}

const saved = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
};

describe("store privacy behaviour", () => {
  beforeEach(() => localStorage.clear());

  it("does not save health conditions when the user did not consent", async () => {
    const store = renderStore();
    act(() =>
      store.current!.set(() => ({
        user: { name: "Test", phone: "+998", conditions: ["diabetes"], healthConsent: false },
      })),
    );
    await waitFor(() => expect(saved()?.user?.name).toBe("Test"));
    expect(saved().user.conditions).toEqual([]);
    expect(localStorage.getItem(STORAGE_KEY)).not.toContain("diabetes");
  });

  it("saves health conditions when the user consented", async () => {
    const store = renderStore();
    act(() =>
      store.current!.set(() => ({
        user: { name: "Test", phone: "+998", conditions: ["diabetes"], healthConsent: true },
      })),
    );
    await waitFor(() => expect(saved()?.user?.conditions).toEqual(["diabetes"]));
  });

  it("log out removes the health conditions from storage", async () => {
    const store = renderStore();
    act(() =>
      store.current!.set(() => ({
        user: { name: "Test", phone: "+998", conditions: ["diabetes"], healthConsent: true },
      })),
    );
    await waitFor(() => expect(localStorage.getItem(STORAGE_KEY)).toContain("diabetes"));

    act(() => store.current!.logout());

    await waitFor(() => expect(saved()?.user).toBeNull());
    expect(localStorage.getItem(STORAGE_KEY)).not.toContain("diabetes");
  });

  it("starts with no delivery address, and log out removes saved addresses", async () => {
    const store = renderStore();
    expect(store.current!.addresses).toEqual([]);
    act(() =>
      store.current!.set(() => ({
        user: { name: "Test", phone: "+998", conditions: [], healthConsent: false },
        addresses: addAddress([], {
          ...EMPTY_ADDRESS,
          district: "Chilonzor",
          street: "Bunyodkor 7",
        }),
      })),
    );
    await waitFor(() => expect(localStorage.getItem(STORAGE_KEY)).toContain("Bunyodkor 7"));

    act(() => store.current!.logout());

    await waitFor(() => expect(saved()?.addresses).toEqual([]));
    expect(localStorage.getItem(STORAGE_KEY)).not.toContain("Bunyodkor");
  });

  it("delete my data removes everything PharmaGO stored and does not write it back", async () => {
    localStorage.setItem("pharmago-v1", JSON.stringify({ user: { conditions: ["asthma"] } }));
    const store = renderStore();
    act(() => {
      store.current!.set(() => ({
        user: { name: "Test", phone: "+998", conditions: ["diabetes"], healthConsent: true },
      }));
      store.current!.set((s) => ({ saved: [...s.saved, "teraflu"] }));
    });
    await waitFor(() => expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull());

    act(() => store.current!.deleteAllData());

    // Give effects a chance to run, then check nothing came back.
    await act(async () => {});
    const keys = Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i));
    expect(keys.filter((k) => k?.startsWith("pharmago"))).toEqual([]);
    expect(store.current!.user).toBeNull();
    expect(store.current!.saved).toEqual([]);
  });
});
