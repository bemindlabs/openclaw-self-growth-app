import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { invoke } from "@tauri-apps/api/core";
import HealthPage from "./Health";

const mockInvoke = vi.mocked(invoke);

// Mock recharts to avoid rendering issues in jsdom
vi.mock("recharts", () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
}));

describe("HealthPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === "get_health_summary") return [];
      if (cmd === "list_health_syncs") return [];
      if (cmd === "list_health_metrics") return [];
      return undefined;
    });
  });

  it("renders page heading", () => {
    render(<HealthPage />);
    expect(screen.getByText("Health")).toBeTruthy();
  });

  it("shows empty state when no health data", async () => {
    render(<HealthPage />);
    await waitFor(() => {
      expect(screen.getByText(/No health data yet/)).toBeTruthy();
    });
  });

  it("renders Apple Health import section", async () => {
    render(<HealthPage />);
    await waitFor(() => {
      expect(screen.getByText("Apple Health")).toBeTruthy();
      expect(screen.getByText("Import XML Export")).toBeTruthy();
    });
  });

  it("renders Google Fit section", async () => {
    render(<HealthPage />);
    await waitFor(() => {
      expect(screen.getByText("Google Fit")).toBeTruthy();
      expect(screen.getByText("Connect")).toBeTruthy();
      expect(screen.getByText("Sync")).toBeTruthy();
    });
  });

  it("renders manage data section", async () => {
    render(<HealthPage />);
    await waitFor(() => {
      expect(screen.getByText("Manage Data")).toBeTruthy();
      expect(screen.getByText("Delete Apple Health")).toBeTruthy();
      expect(screen.getByText("Delete Google Fit")).toBeTruthy();
    });
  });

  it("renders summary cards when data available", async () => {
    mockInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === "get_health_summary")
        return [
          { metric_type: "steps", latest_value: 10000, avg_7d: 8500, trend: "up" },
          { metric_type: "heart_rate", latest_value: 72, avg_7d: 70, trend: "stable" },
        ];
      if (cmd === "list_health_syncs") return [];
      if (cmd === "list_health_metrics") return [];
      return undefined;
    });

    render(<HealthPage />);
    await waitFor(() => {
      expect(screen.getByText("Steps")).toBeTruthy();
      expect(screen.getByText("Heart Rate")).toBeTruthy();
    });
  });

  it("renders sync history when syncs exist", async () => {
    mockInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === "get_health_summary") return [];
      if (cmd === "list_health_syncs")
        return [
          { id: 1, source: "apple_health", sync_type: "import", records_added: 150, status: "completed" },
        ];
      if (cmd === "list_health_metrics") return [];
      return undefined;
    });

    render(<HealthPage />);
    await waitFor(() => {
      expect(screen.getByText("Sync History")).toBeTruthy();
      expect(screen.getByText("apple_health")).toBeTruthy();
      expect(screen.getByText("+150 records")).toBeTruthy();
    });
  });
});
