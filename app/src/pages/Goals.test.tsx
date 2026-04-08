import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { invoke } from "@tauri-apps/api/core";
import Goals from "./Goals";

const mockInvoke = vi.mocked(invoke);

describe("Goals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === "list_goals") return [];
      return undefined;
    });
  });

  it("renders page heading", () => {
    render(<Goals />);
    expect(screen.getByText("Goals")).toBeTruthy();
  });

  it("renders Add Goal button", () => {
    render(<Goals />);
    expect(screen.getByText("Add Goal")).toBeTruthy();
  });

  it("renders filter buttons", () => {
    render(<Goals />);
    expect(screen.getByText("All")).toBeTruthy();
    expect(screen.getByText("active")).toBeTruthy();
    expect(screen.getByText("completed")).toBeTruthy();
    expect(screen.getByText("paused")).toBeTruthy();
  });

  it("shows empty state when no goals", async () => {
    render(<Goals />);
    await waitFor(() => {
      expect(screen.getByText("No goals yet. Add one to get started.")).toBeTruthy();
    });
  });

  it("shows form when Add Goal clicked", () => {
    render(<Goals />);
    fireEvent.click(screen.getByText("Add Goal"));
    expect(screen.getByPlaceholderText("Goal title")).toBeTruthy();
    expect(screen.getByText("Create")).toBeTruthy();
  });

  it("renders goals when available", async () => {
    mockInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === "list_goals")
        return [
          { id: 1, title: "Learn TypeScript", description: "Master TS", status: "active", target_date: "2024-12-31", skill_id: null, created_at: "2024-01-01" },
        ];
      return undefined;
    });

    render(<Goals />);
    await waitFor(() => {
      expect(screen.getByText("Learn TypeScript")).toBeTruthy();
      expect(screen.getByText("Master TS")).toBeTruthy();
    });
  });

  it("calls create_goal on form submission", async () => {
    mockInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === "list_goals") return [];
      if (cmd === "create_goal") return { id: 1 };
      return undefined;
    });

    render(<Goals />);
    fireEvent.click(screen.getByText("Add Goal"));
    fireEvent.change(screen.getByPlaceholderText("Goal title"), { target: { value: "New Goal" } });
    fireEvent.click(screen.getByText("Create"));

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith("create_goal", {
        data: { title: "New Goal", description: undefined, target_date: undefined },
      });
    });
  });
});
