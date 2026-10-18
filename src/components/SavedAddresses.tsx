import { MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AddressForm } from "@/components/AddressForm";
import { Button } from "@/components/ui/button";
import {
  addAddress,
  formatAddress,
  removeAddress,
  setDefaultAddress,
  updateAddress,
} from "@/lib/address";
import { useStore } from "@/lib/store";

// Profile → Saved addresses: list, add, edit, delete and choose the default address.
export function SavedAddresses() {
  const { addresses, set } = useStore();
  // "new" = adding, an id = editing that address, null = just the list.
  const [editing, setEditing] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  return (
    <section className="card-soft p-5 text-lg md:col-span-2" aria-labelledby="saved-addresses">
      <h2
        id="saved-addresses"
        className="mb-3 flex items-center gap-2 text-xl font-bold text-primary"
      >
        <MapPin />
        Saved addresses
      </h2>

      {addresses.length === 0 && editing !== "new" && (
        <p className="mb-3">No address yet. Add one so we know where to deliver.</p>
      )}

      <ul className="grid gap-3">
        {addresses.map((a) =>
          editing === a.id ? (
            <li key={a.id} className="rounded-xl border-2 border-primary p-4">
              <p className="mb-3 text-xl font-bold">Edit address</p>
              <AddressForm
                initial={a}
                submitLabel="Save changes"
                onCancel={() => setEditing(null)}
                onSubmit={(input) => {
                  set((s) => ({ addresses: updateAddress(s.addresses, a.id, input) }));
                  setEditing(null);
                  toast.success("Address saved");
                }}
              />
            </li>
          ) : (
            <li
              key={a.id}
              className={`rounded-xl border-2 p-4 ${a.isDefault ? "border-primary bg-secondary" : "border-border"}`}
            >
              <p className="font-semibold">{formatAddress(a)}</p>
              {a.note && <p className="text-muted-foreground">Note: {a.note}</p>}
              {confirmDelete === a.id ? (
                <div className="mt-3 grid gap-2">
                  <p className="font-semibold">Delete this address?</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button
                      variant="destructive"
                      onClick={() => {
                        set((s) => ({ addresses: removeAddress(s.addresses, a.id) }));
                        setConfirmDelete(null);
                        toast("Address deleted");
                      }}
                    >
                      Yes, delete
                    </Button>
                    <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
                      Keep it
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {a.isDefault ? (
                    <span className="inline-flex min-h-12 items-center gap-1 rounded-xl bg-primary px-4 font-bold text-primary-foreground">
                      <Star className="h-5 w-5 fill-current" aria-hidden /> Default
                    </span>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() =>
                        set((s) => ({ addresses: setDefaultAddress(s.addresses, a.id) }))
                      }
                    >
                      <Star /> Make default
                    </Button>
                  )}
                  <Button variant="secondary" onClick={() => setEditing(a.id)}>
                    <Pencil /> Edit
                  </Button>
                  <Button variant="secondary" onClick={() => setConfirmDelete(a.id)}>
                    <Trash2 /> Delete
                  </Button>
                </div>
              )}
            </li>
          ),
        )}
      </ul>

      {editing === "new" ? (
        <div className="mt-3 rounded-xl border-2 border-primary p-4">
          <p className="mb-3 text-xl font-bold">New address</p>
          <AddressForm
            submitLabel="Save address"
            onCancel={() => setEditing(null)}
            onSubmit={(input) => {
              set((s) => ({ addresses: addAddress(s.addresses, input) }));
              setEditing(null);
              toast.success("Address saved");
            }}
          />
        </div>
      ) : (
        <Button size="lg" className="mt-3" onClick={() => setEditing("new")}>
          <Plus /> Add address
        </Button>
      )}
    </section>
  );
}
