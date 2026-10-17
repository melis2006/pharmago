import { Link, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStore } from "@/lib/store";

// Consent checkbox shown whenever health conditions can be saved.
export function HealthConsent({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={`flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 text-lg font-semibold ${checked ? "border-primary bg-secondary" : "border-fast bg-card"}`}>
      <input type="checkbox" className="mt-1 h-7 w-7 shrink-0 accent-[var(--primary)]" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      I agree that my health conditions are saved on this device to warn me about unsuitable medicines
    </label>
  );
}

export function LocalOnlyNote() {
  return (
    <p className="flex items-start gap-2 text-lg text-muted-foreground">
      <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden />
      <span>
        Your data never leaves this device. <Link to="/privacy" className="font-semibold text-primary underline">Privacy</Link>
      </span>
    </p>
  );
}

// "Delete my data": asks first, then removes everything PharmaGO stored in this browser.
export function DeleteMyDataButton({ className = "" }: { className?: string }) {
  const { deleteAllData } = useStore();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="xl" variant="outline" className={`border-destructive text-destructive hover:bg-destructive-soft ${className}`} onClick={() => setOpen(true)}>
        <Trash2 /> Delete my data
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">Delete all your data?</DialogTitle>
            <DialogDescription className="text-lg text-foreground">
              This removes your name, phone, health conditions, cart, saved medicines, addresses, cards and orders from this
              device. It cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button size="xl" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              size="xl"
              variant="destructive"
              onClick={() => {
                deleteAllData();
                setOpen(false);
                toast.success("All your data was deleted from this device");
                nav({ to: "/" });
              }}
            >
              Yes, delete everything
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
