import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { invoke } from "@tauri-apps/api/core";
import Habits from "./Habits";

const mockInvoke = vi.mocked(invoke);

describe("Habits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === "list_habits") return [];
      return undefined;
    });
  });

  it("renders page heading", () => {
    render(<Habits />);
    expect(screen.getByText("Habits")).toBeTruthy();
  });

  it("renders Add Habit button", () => {
    render(<Habits />);
    expect(screen.getByText("Add Habit")).toBeTruthy();
  });

  it("shows empty state when no habits", async () => {
    render(<Habits />);
    await waitFor(() => {
      expect(screen.getByText(/Add your first daily habit/)).toBeTruthy();
    });
  });

  it("shows create form when Add Habit clicked", () => {
    render(<Habits />);
    fireEvent.click(screen.getByText("Add Habit"));
    expect(screen.getByPlaceholderText("Habit name")).toBeTruthy();
    expect(screen.getByText("Create")).toBeTruthy();
  });

  it("renders habits with names", async () => {
    mockInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === "list_habits")
        return [
          { id: 1, name: "Morning Run", description: "Run 5km", color: "#22c55e" },
          { id: 2, name: "Read", description: null, color: "#3b82f6" },
        ];
      if (cmd === "get_habit_logs") return [];
      return undefined;
    });

    render(<Habits />);
    await waitFor(() => {
      expect(screen.getByText("Morning Run")).toBeTruthy();
      expect(screen.getByText("Read")).toBeTruthy();
    });
  });

  it("shows habit description when provided", async () => {
    mockInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === "list_habits")
        return [{ id: 1, name: "Meditate", description: "10 minutes", color: "#000" }];
      if (cmd === "get_habit_logs") return [];
      return undefined;
    });

    render(<Habits />);
    await waitFor(() => {
      expect(screen.getByText("10 minutes")).toBeTruthy();
    });
  });

  it("calls create habit with form data", async () => {
    mockInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === "list_habits") return [];
      if (cmd === "create_habit") return { id: 1, name: "Yoga", description: null, color: null };
      return undefined;
    });

    render(<Habits />);
    fireEvent.click(screen.getByText("Add Habit"));

    const nameInput = screen.getByPlaceholderText("Habit name");
    fireEvent.change(nameInput, { target: { value: "Yoga" } });
    fireEvent.click(screen.getByText("Create"));

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith("create_habit", {
        data: { name: "Yoga", description: undefined },
      });
    });
  });
});
