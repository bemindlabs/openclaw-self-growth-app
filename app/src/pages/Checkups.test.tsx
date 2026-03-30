import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { invoke } from "@tauri-apps/api/core";
import Checkups from "./Checkups";

const mockInvoke = vi.mocked(invoke);

vi.mock("@tauri-apps/plugin-dialog", () => ({ open: vi.fn() }));
vi.mock("react-markdown", () => ({
  default: ({ children }: { children: string }) => <div>{children}</div>,
}));

describe("Checkups", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === "list_health_checkups") return [];
      return [];
    });
  });

  it("renders page heading", () => {
    render(<Checkups />);
    expect(screen.getByText("Health Checkups")).toBeTruthy();
  });

  it("renders Add Result button", () => {
    render(<Checkups />);
    expect(screen.getByText("Add Result")).toBeTruthy();
  });

  it("renders category filter buttons", () => {
    render(<Checkups />);
    expect(screen.getByText("All")).toBeTruthy();
    expect(screen.getByText("Blood Test")).toBeTruthy();
    expect(screen.getByText("Dental")).toBeTruthy();
  });

  it("shows empty state", async () => {
    render(<Checkups />);
    await waitFor(() => {
      expect(screen.getByText(/No health checkup results yet/)).toBeTruthy();
    });
  });

  it("shows form when Add Result clicked", () => {
    render(<Checkups />);
    fireEvent.click(screen.getByText("Add Result"));
    expect(screen.getByPlaceholderText(/Title/)).toBeTruthy();
    expect(screen.getByText("Save")).toBeTruthy();
  });

  it("renders checkups when available", async () => {
    mockInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === "list_health_checkups")
        return [
          {
            id: 1,
            title: "Annual Blood Test",
            checkup_date: "2024-06-01",
            provider: "City Hospital",
            category: "blood_test",
            results: "All normal",
            notes: null,
          },
        ];
      return [];
    });

    render(<Checkups />);
    await waitFor(() => {
      expect(screen.getByText("Annual Blood Test")).toBeTruthy();
      expect(screen.getByText("2024-06-01")).toBeTruthy();
      expect(screen.getByText("at City Hospital")).toBeTruthy();
    });
  });
});
