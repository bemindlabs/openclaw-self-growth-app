import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { invoke } from "@tauri-apps/api/core";
import TodosPage from "./Todos";

const mockInvoke = vi.mocked(invoke);

describe("TodosPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === "get_today_todos") return [];
      if (cmd === "list_todos") return [];
      if (cmd === "get_overdue_todos") return [];
      return undefined;
    });
  });

  it("renders page heading", async () => {
    render(<TodosPage />);
    expect(screen.getByText("Todos")).toBeTruthy();
  });

  it("renders filter tabs", async () => {
    render(<TodosPage />);
    expect(screen.getByText("Today")).toBeTruthy();
    expect(screen.getByText("All")).toBeTruthy();
    expect(screen.getByText("Overdue")).toBeTruthy();
    expect(screen.getByText("Completed")).toBeTruthy();
  });

  it("renders Add Todo button", () => {
    render(<TodosPage />);
    expect(screen.getByText("Add Todo")).toBeTruthy();
  });

  it("shows empty state on today tab", async () => {
    render(<TodosPage />);
    await waitFor(() => {
      expect(screen.getByText(/Nothing due today/)).toBeTruthy();
    });
  });

  it("shows add form when button clicked", async () => {
    render(<TodosPage />);
    fireEvent.click(screen.getByText("Add Todo"));
    expect(screen.getByPlaceholderText("What needs to be done?")).toBeTruthy();
    expect(screen.getByText("Create Todo")).toBeTruthy();
    expect(screen.getByText("Cancel")).toBeTruthy();
  });

  it("renders todos when available", async () => {
    mockInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === "get_today_todos")
        return [
          {
            id: 1,
            title: "Write tests",
            priority: "high",
            status: "pending",
            due_date: null,
            due_time: null,
            description: null,
            category: null,
            completed_at: null,
          },
        ];
      return [];
    });

    render(<TodosPage />);
    await waitFor(() => {
      expect(screen.getByText("Write tests")).toBeTruthy();
      expect(screen.getByText("High")).toBeTruthy();
    });
  });

  it("switches filter tabs", async () => {
    mockInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === "get_today_todos") return [];
      if (cmd === "list_todos") return [];
      if (cmd === "get_overdue_todos") return [];
      return [];
    });

    render(<TodosPage />);
    fireEvent.click(screen.getByText("All"));

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith("list_todos", { status: undefined });
    });
  });

  it("calls complete when checkbox clicked", async () => {
    mockInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === "get_today_todos")
        return [
          {
            id: 42,
            title: "Finish task",
            priority: "medium",
            status: "pending",
            due_date: null,
            due_time: null,
            description: null,
            category: null,
            completed_at: null,
          },
        ];
      if (cmd === "complete_todo") return undefined;
      return [];
    });

    render(<TodosPage />);
    await waitFor(() => {
      expect(screen.getByText("Finish task")).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: "Complete: Finish task" }));

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith("complete_todo", { id: 42 });
    });
  });
});
