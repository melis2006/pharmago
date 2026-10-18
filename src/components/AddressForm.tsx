import { AlertCircle } from "lucide-react";
import { useId, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  EMPTY_ADDRESS,
  MAX_LENGTH,
  TASHKENT_DISTRICTS,
  validateAddress,
  type AddressErrors,
  type AddressInput,
} from "@/lib/address";

const FIELDS: {
  key: keyof AddressInput;
  label: string;
  required: boolean;
  hint?: string;
  multiline?: boolean;
}[] = [
  { key: "city", label: "City", required: true },
  { key: "district", label: "District", required: true, hint: "For example: Yunusobod" },
  {
    key: "street",
    label: "Street and house number",
    required: true,
    hint: "For example: Amir Temur 15",
  },
  { key: "apartment", label: "Apartment", required: false },
  { key: "entrance", label: "Entrance / door code", required: false },
  {
    key: "note",
    label: "Landmark or note for the courier",
    required: false,
    hint: "For example: next to the blue pharmacy",
    multiline: true,
  },
];

const fieldCls =
  "w-full rounded-xl border-2 bg-card px-4 text-lg outline-none focus:border-primary aria-[invalid=true]:border-destructive";

// One form for delivery addresses: used in registration, Profile and checkout.
export function AddressForm({
  initial = EMPTY_ADDRESS,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: AddressInput;
  submitLabel: string;
  onSubmit: (address: AddressInput) => void;
  onCancel?: (() => void) | undefined;
}) {
  const id = useId();
  const [values, setValues] = useState<AddressInput>(initial);
  const [errors, setErrors] = useState<AddressErrors>({});
  const [tried, setTried] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const change = (key: keyof AddressInput, v: string) => {
    const next = { ...values, [key]: v };
    setValues(next);
    // After the first attempt, messages update as the user types.
    if (tried) setErrors(validateAddress(next));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found = validateAddress(values);
    setTried(true);
    setErrors(found);
    const first = FIELDS.find((f) => found[f.key]);
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first.key}"]`)?.focus();
      return;
    }
    onSubmit(values);
  };

  return (
    <form ref={formRef} noValidate onSubmit={submit} className="grid gap-4">
      {FIELDS.map((f) => {
        const inputId = `${id}-${f.key}`;
        const error = errors[f.key];
        const describedBy = [f.hint && `${inputId}-hint`, error && `${inputId}-error`]
          .filter(Boolean)
          .join(" ");
        const common = {
          id: inputId,
          name: f.key,
          value: values[f.key],
          maxLength: MAX_LENGTH[f.key],
          "aria-invalid": error ? true : undefined,
          "aria-describedby": describedBy || undefined,
          "aria-required": f.required || undefined,
          className: `${fieldCls} ${error ? "border-destructive" : "border-input"}`,
        };
        return (
          <div key={f.key} className="grid gap-1">
            <label htmlFor={inputId} className="text-lg font-semibold">
              {f.label}{" "}
              <span
                className={f.required ? "text-destructive" : "font-normal text-muted-foreground"}
              >
                {f.required ? "(required)" : "(optional)"}
              </span>
            </label>
            {f.hint && (
              <span id={`${inputId}-hint`} className="text-base text-muted-foreground">
                {f.hint}
              </span>
            )}
            {f.multiline ? (
              <textarea
                {...common}
                rows={3}
                className={`${common.className} py-3`}
                onChange={(e) => change(f.key, e.target.value)}
              />
            ) : (
              <input
                {...common}
                type="text"
                autoComplete={f.key === "street" ? "street-address" : "off"}
                list={f.key === "district" ? `${id}-districts` : undefined}
                className={`${common.className} h-14`}
                onChange={(e) => change(f.key, e.target.value)}
              />
            )}
            {error && (
              <p
                id={`${inputId}-error`}
                className="flex items-start gap-2 text-lg font-semibold text-destructive"
              >
                <AlertCircle className="mt-1 h-5 w-5 shrink-0" aria-hidden />
                {error}
              </p>
            )}
          </div>
        );
      })}
      <datalist id={`${id}-districts`}>
        {TASHKENT_DISTRICTS.map((d) => (
          <option key={d} value={d} />
        ))}
      </datalist>
      <div className="grid gap-3 sm:grid-cols-2">
        <Button size="xl" type="submit" className={onCancel ? "" : "sm:col-span-2"}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button size="xl" type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
