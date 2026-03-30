import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

// Mock all page components to avoid their side effects (API calls)
vi.mock("./pages/Dashboard", () => ({ default: () => <div>Dashboard Page</div> }));
vi.mock("./pages/Routines", () => ({ default: () => <div>Routines Page</div> }));
vi.mock("./pages/Learning", () => ({ default: () => <div>Learning Page</div> }));
vi.mock("./pages/Skills", () => ({ default: () => <div>Skills Page</div> }));
vi.mock("./pages/Goals", () => ({ default: () => <div>Goals Page</div> }));
vi.mock("./pages/Habits", () => ({ default: () => <div>Habits Page</div> }));
vi.mock("./pages/Journal", () => ({ default: () => <div>Journal Page</div> }));
vi.mock("./pages/Search", () => ({ default: () => <div>Search Page</div> }));
vi.mock("./pages/Story", () => ({ default: () => <div>Story Page</div> }));
vi.mock("./pages/Chat", () => ({ default: () => <div>Chat Page</div> }));
vi.mock("./pages/Settings", () => ({ default: () => <div>Settings Page</div> }));
vi.mock("./pages/Health", () => ({ default: () => <div>Health Page</div> }));
vi.mock("./pages/Todos", () => ({ default: () => <div>Todos Page</div> }));
vi.mock("./pages/Ledger", () => ({ default: () => <div>Ledger Page</div> }));
vi.mock("./pages/Checkups", () => ({ default: () => <div>Checkups Page</div> }));
vi.mock("./pages/GetStarted", () => ({ default: () => <div>GetStarted Page</div> }));

describe("App", () => {
  it("renders the Dashboard at the root route", () => {
    render(<App />);
    expect(screen.getByText("Dashboard Page")).toBeTruthy();
  });

  it("renders the AppShell layout with navigation", () => {
    render(<App />);
    // AppShell navigation items should be present
    expect(screen.getAllByText("Dashboard").length).toBeGreaterThanOrEqual(1);
  });
});
