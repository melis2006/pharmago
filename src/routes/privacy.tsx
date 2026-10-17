import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { DeleteMyDataButton } from "@/components/Privacy";
import { PageTitle, Shell } from "@/components/Shell";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () => seo("Privacy", "What PharmaGO stores, where it is kept and how to delete it."),
  component: Privacy,
});

function Privacy() {
  return (
    <Shell>
      <PageTitle sub="Short and in plain words">Privacy</PageTitle>
      <div className="grid max-w-3xl gap-4 text-lg leading-relaxed">
        <Section title="What we store">
          <ul className="list-disc space-y-1 pl-6">
            <li>Your <b>name</b> and <b>phone number</b></li>
            <li>Your <b>health conditions</b> — only if you agree to it</li>
            <li>Your <b>cart</b>, <b>saved medicines</b> and <b>orders</b></li>
            <li>Delivery addresses and the last 4 digits of cards you add</li>
          </ul>
          <p className="mt-2">We do not store your password.</p>
        </Section>

        <Section title="Where it is kept">
          <p>
            Only in <b>this browser on this device</b> (its "local storage"). It is <b>not sent to any server</b>, and no
            other company receives it. PharmaGO does not use analytics, ads or tracking.
          </p>
          <p className="mt-2">
            If other people use this device, they can see your data. Use <b>Delete my data</b> below when you are done.
          </p>
        </Section>

        <Section title="Why we keep your health conditions">
          <p>
            Only to show a red <b>"Not recommended for you"</b> warning on medicines that may not be safe for you. You can
            turn this off at any time in your <Link to="/profile" className="font-semibold text-primary underline">Profile</Link>,
            and logging out removes your health conditions.
          </p>
        </Section>

        <Section title="This is a demo">
          <p>
            PharmaGO is a university project. All pharmacies, prices and orders are <b>demo data</b>. No real orders are made
            and no real payments are taken. Information about medicines is not medical advice. In an emergency call <b>103</b>.
          </p>
        </Section>

        <Section title="How to delete your data">
          <p>Press the button below, or in your Profile. Everything PharmaGO saved on this device is removed at once.</p>
          <DeleteMyDataButton className="mt-4" />
          <p className="mt-3 text-muted-foreground">You can also clear this website's data in your browser settings.</p>
        </Section>
      </div>
    </Shell>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="card-soft p-5">
      <h2 className="mb-2 text-2xl font-bold">{title}</h2>
      {children}
    </section>
  );
}
