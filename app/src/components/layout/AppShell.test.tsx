import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AppShell from "./AppShell";

function renderWithRouter(initialEntry = "/") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AppShell />
    </MemoryRouter>
  );
}

describe("AppShell", () => {
  it("renders the Logo", () => {
    renderWithRouter();
    expect(screen.getAllByText("Bemind").length).toBeGreaterThan(0);
  });

  it("renders the tagline", () => {
    renderWithRouter();
    expect(screen.getByText("Self Development Platform")).toBeTruthy();
  });

  it("renders all navigation items", () => {
    renderWithRouter();
    const expectedLabels = [
      "Dashboard",
      "Goals",
      "Todos",
      "Habits",
      "Routines",
      "Health",
      "Checkups",
      "Skills",
      "Learning",
      "Journal",
      "Chat",
      "Stories",
      "Ledger",
      "Search",
      "Settings",
      "Get Started",
    ];

    for (const label of expectedLabels) {
      // Each label appears in both desktop sidebar and mobile bottom nav
      const elements = screen.getAllByText(label);
      expect(elements.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("renders the footer text", () => {
    renderWithRouter();
    const footers = screen.getAllByText(/Powered by Bemind Technology/);
    expect(footers.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the version number", () => {
    renderWithRouter();
    const version = screen.getAllByText(/v0\.1\.0/);
    expect(version.length).toBeGreaterThanOrEqual(1);
  });
});
