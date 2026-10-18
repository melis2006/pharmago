import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AddressForm } from "@/components/AddressForm";
import { Logo, Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { HealthConsent, LocalOnlyNote } from "@/components/Privacy";
import { addAddress, EMPTY_ADDRESS, type AddressInput } from "@/lib/address";
import { CONDITIONS, type Condition } from "@/lib/data";
import { conditionsToSave } from "@/lib/privacy";
import { seo } from "@/lib/seo";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => seo("Sign in", "Sign in or create a PharmaGO account with your health profile."),
  component: Login,
});

export const inputCls =
  "h-14 w-full rounded-xl border-2 border-input bg-card px-4 text-lg outline-none focus:border-primary";

function Login() {
  const { set } = useStore();
  const nav = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [f, setF] = useState({ name: "", phone: "+998 ", password: "" });
  const [addr, setAddr] = useState<AddressInput | null>(null);
  const [conds, setConds] = useState<Condition[]>([]);
  const [consent, setConsent] = useState(false);
  const finish = () => {
    const saved = conditionsToSave(conds, consent);
    set(() => ({
      user: {
        name: f.name.trim(),
        phone: f.phone,
        conditions: saved,
        healthConsent: consent && saved.length > 0,
      },
      // The address from step 2 becomes the first (default) delivery address.
      addresses: addr ? addAddress([], addr) : [],
    }));
    toast.success(
      `Welcome, ${f.name.trim()}!`,
      conds.length > 0 && saved.length === 0
        ? { description: "Your health conditions were not saved." }
        : undefined,
    );
    nav({ to: "/home" });
  };
  return (
    <Shell>
      <div className="mx-auto max-w-lg">
        <div className="mb-6 text-center">
          <Logo size="text-4xl" />
        </div>
        {step === 1 ? (
          <form
            className="card-soft grid gap-4 p-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (
                !f.name.trim() ||
                f.phone.replace(/\D/g, "").length < 12 ||
                f.password.length < 4
              ) {
                toast.error("Please enter name, full phone number and a password (4+ characters)");
                return;
              }
              setStep(2);
            }}
          >
            <StepLabel step={1} />
            <h1 className="text-3xl font-bold">Sign in / Register</h1>
            <label className="text-lg font-semibold">
              Name
              <input
                className={inputCls}
                value={f.name}
                onChange={(e) => setF({ ...f, name: e.target.value })}
              />
            </label>
            <label className="text-lg font-semibold">
              Phone number
              <input
                className={inputCls}
                inputMode="tel"
                value={f.phone}
                onChange={(e) => setF({ ...f, phone: e.target.value })}
              />
            </label>
            <label className="text-lg font-semibold">
              Password
              <input
                type="password"
                className={inputCls}
                value={f.password}
                onChange={(e) => setF({ ...f, password: e.target.value })}
              />
            </label>
            <Button size="xl" type="submit">
              Continue
            </Button>
          </form>
        ) : step === 2 ? (
          <div className="card-soft grid gap-4 p-6">
            <StepLabel step={2} />
            <h1 className="text-3xl font-bold">Delivery address</h1>
            <p className="text-lg text-muted-foreground">
              Where should we bring your medicines? You can change it later in your Profile.
            </p>
            <AddressForm
              initial={addr ?? EMPTY_ADDRESS}
              submitLabel="Continue"
              onSubmit={(a) => {
                setAddr(a);
                setStep(3);
              }}
            />
            <Button size="xl" variant="outline" onClick={() => setStep(1)}>
              Previous step
            </Button>
          </div>
        ) : (
          <div className="card-soft grid gap-4 p-6">
            <StepLabel step={3} />
            <h1 className="text-3xl font-bold">Your health profile</h1>
            <p className="text-lg text-muted-foreground">
              Tick any conditions you have. We will warn you about unsuitable medicines.
            </p>
            <div className="grid gap-2">
              {CONDITIONS.map((c) => {
                const on = conds.includes(c.id);
                return (
                  <label
                    key={c.id}
                    className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 text-lg font-semibold ${on ? "border-primary bg-secondary" : "border-border"}`}
                  >
                    <input
                      type="checkbox"
                      className="h-7 w-7 accent-[var(--primary)]"
                      checked={on}
                      onChange={() =>
                        setConds(on ? conds.filter((x) => x !== c.id) : [...conds, c.id])
                      }
                    />
                    {c.label}
                  </label>
                );
              })}
            </div>
            {conds.length > 0 && (
              <>
                <HealthConsent checked={consent} onChange={setConsent} />
                {!consent && (
                  <p role="status" className="text-lg font-semibold">
                    Without your agreement your health conditions will not be saved, and you will
                    not get warnings.
                  </p>
                )}
              </>
            )}
            <LocalOnlyNote />
            <Button size="xl" onClick={finish}>
              Finish
            </Button>
            <Button size="xl" variant="outline" onClick={() => setStep(2)}>
              Previous step
            </Button>
          </div>
        )}
      </div>
    </Shell>
  );
}

function StepLabel({ step }: { step: 1 | 2 | 3 }) {
  return <p className="text-lg font-semibold text-primary">Step {step} of 3</p>;
}
