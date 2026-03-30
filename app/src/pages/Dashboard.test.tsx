import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { invoke } from "@tauri-apps/api/core";
import Dashboard from "./Dashboard";

const mockInvoke = vi.mocked(invoke);

// Mock react-router-dom (Dashboard doesn't use it directly, but imports might)
vi.mock("react-markdown", () => ({
  default: ({ children }: { children: string }) => <div data-testid="markdown">{children}</div>,
}));

const mockStats = {
  current_streak: 5,
  completions_today: 3,
  active_goals: 2,
  active_routines: 4,
  total_skills: 7,
};

describe("Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up default mock responses for all API calls Dashboard makes on mount
    mockInvoke.mockImplementation(async (cmd: string) => {
      switch (cmd) {
        case "get_dashboard_stats":
          return mockStats;
        case "get_today_todos":
          return [];
        case "get_health_summary":
          return [];
        case "list_habits":
          return [];
        default:
          return undefined;
      }
    });
  });

  it("shows loading state initially", () => {
    // Override to never resolve
    mockInvoke.mockImplementation(() => new Promise(() => {}));
    render(<Dashboard />);
    expect(screen.getByText("Loading...")).toBeTruthy();
  });

  it("renders dashboard heading after data loads", async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeTruthy();
    });
  });

  it("renders stat cards with correct values", async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText("5d")).toBeTruthy(); // streak
      expect(screen.getByText("3")).toBeTruthy(); // completions today
      expect(screen.getByText("2")).toBeTruthy(); // active goals
      expect(screen.getByText("4")).toBeTruthy(); // active routines
      expect(screen.getByText("7")).toBeTruthy(); // total skills
    });
  });

  it("renders stat labels", async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText("Streak")).toBeTruthy();
      expect(screen.getByText("Today")).toBeTruthy();
      expect(screen.getByText("Goals")).toBeTruthy();
      expect(screen.getByText("Routines")).toBeTruthy();
      expect(screen.getByText("Skills")).toBeTruthy();
    });
  });

  it("shows empty todos message when no todos", async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText(/All caught up/)).toBeTruthy();
    });
  });

  it("renders todos when present", async () => {
    mockInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === "get_dashboard_stats") return mockStats;
      if (cmd === "get_today_todos")
        return [
          { id: 1, title: "Buy groceries", priority: "medium", status: "pending", due_date: null },
        ];
      if (cmd === "get_health_summary") return [];
      if (cmd === "list_habits") return [];
      return undefined;
    });

    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText("Buy groceries")).toBeTruthy();
    });
  });

  it("renders Quick Coach section", async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText("Quick Coach")).toBeTruthy();
      expect(screen.getByPlaceholderText("Ask your coach anything...")).toBeTruthy();
    });
  });

  it("renders Insights and Weekly Summary sections", async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText("Insights")).toBeTruthy();
      expect(screen.getByText("Weekly Summary")).toBeTruthy();
    });
  });

  it("shows health snapshot when health data is available", async () => {
    mockInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === "get_dashboard_stats") return mockStats;
      if (cmd === "get_today_todos") return [];
      if (cmd === "get_health_summary")
        return [
          { metric_type: "steps", latest_value: 8500, avg_7d: 7200, trend: "up" },
        ];
      if (cmd === "list_habits") return [];
      return undefined;
    });

    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText("Health Snapshot")).toBeTruthy();
    });
  });

  it("shows habits when present", async () => {
    mockInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === "get_dashboard_stats") return mockStats;
      if (cmd === "get_today_todos") return [];
      if (cmd === "get_health_summary") return [];
      if (cmd === "list_habits")
        return [{ id: 1, name: "Meditate", description: null, color: "#22c55e" }];
      if (cmd === "get_habit_logs") return [];
      return undefined;
    });

    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText("Meditate")).toBeTruthy();
    });
  });
});
