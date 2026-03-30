import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { invoke } from "@tauri-apps/api/core";
import Ledger from "./Ledger";

const mockInvoke = vi.mocked(invoke);

// Mock @tauri-apps/plugin-dialog for OcrButton
vi.mock("@tauri-apps/plugin-dialog", () => ({
  open: vi.fn(),
}));

describe("Ledger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === "list_ledger_entries") return [];
      if (cmd === "get_ledger_summary")
        return {
          total_income: 0,
          total_expense: 0,
          balance: 0,
          currency: "USD",
          by_category: [],
        };
      return undefined;
    });
  });

  it("renders page heading", () => {
    render(<Ledger />);
    expect(screen.getByText("Ledger")).toBeTruthy();
  });

  it("renders Add Entry button", () => {
    render(<Ledger />);
    expect(screen.getByText("Add Entry")).toBeTruthy();
  });

  it("shows empty state when no entries", async () => {
    render(<Ledger />);
    await waitFor(() => {
      expect(screen.getByText(/No ledger entries yet/)).toBeTruthy();
    });
  });

  it("renders summary cards", async () => {
    mockInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === "list_ledger_entries") return [];
      if (cmd === "get_ledger_summary")
        return {
          total_income: 5000,
          total_expense: 2500,
          balance: 2500,
          currency: "USD",
          by_category: [],
        };
      return undefined;
    });

    render(<Ledger />);
    await waitFor(() => {
      expect(screen.getByText("Income")).toBeTruthy();
      expect(screen.getByText("Expense")).toBeTruthy();
      expect(screen.getByText("Balance")).toBeTruthy();
    });
  });

  it("renders period filter buttons", async () => {
    render(<Ledger />);
    expect(screen.getByText("week")).toBeTruthy();
    expect(screen.getByText("month")).toBeTruthy();
    expect(screen.getByText("year")).toBeTruthy();
  });

  it("renders category filter buttons", async () => {
    render(<Ledger />);
    expect(screen.getByText("All")).toBeTruthy();
    expect(screen.getByText("course")).toBeTruthy();
    expect(screen.getByText("book")).toBeTruthy();
  });

  it("shows form when Add Entry clicked", () => {
    render(<Ledger />);
    fireEvent.click(screen.getByText("Add Entry"));
    expect(screen.getByPlaceholderText("Title")).toBeTruthy();
    expect(screen.getByPlaceholderText("Amount")).toBeTruthy();
    expect(screen.getByText("Add")).toBeTruthy();
  });

  it("renders entries when available", async () => {
    mockInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === "list_ledger_entries")
        return [
          {
            id: 1,
            title: "Udemy Course",
            amount: 14.99,
            entry_type: "expense",
            category: "course",
            description: null,
            currency: "USD",
            entry_date: "2024-06-01",
          },
        ];
      if (cmd === "get_ledger_summary")
        return {
          total_income: 0,
          total_expense: 14.99,
          balance: -14.99,
          currency: "USD",
          by_category: [["course", 14.99]],
        };
      return undefined;
    });

    render(<Ledger />);
    await waitFor(() => {
      expect(screen.getByText("Udemy Course")).toBeTruthy();
    });
  });
});
