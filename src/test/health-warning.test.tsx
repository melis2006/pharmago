// US2 at the UI level: renders the warning component used on the medicine page.
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HealthWarning } from "@/components/HealthWarning";
import { getMedicine } from "@/lib/data";

const teraflu = getMedicine("teraflu")!;

describe("US2: HealthWarning component", () => {
  it("US2-AC1: shows 'Not recommended for you' with the reason for Teraflu when Diabetes is ticked", () => {
    render(<HealthWarning m={teraflu} conditions={["diabetes"]} />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Not recommended for you");
    expect(alert).toHaveTextContent("Diabetes:");
    expect(alert).toHaveTextContent(/sugar per sachet/i);
  });

  it("US2-AC2: shows no warning for Teraflu when no conditions are ticked", () => {
    render(<HealthWarning m={teraflu} conditions={[]} />);
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByText("Not recommended for you")).toBeNull();
  });
});
