import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { invoke } from "@tauri-apps/api/core";
import Journal from "./Journal";

const mockInvoke = vi.mocked(invoke);

vi.mock("@tauri-apps/plugin-dialog", () => ({ open: vi.fn() }));
vi.mock("react-markdown", () => ({
  default: ({ children }: { children: string }) => <div>{children}</div>,
}));

describe("Journal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === "list_journal_entries") return [];
      return undefined;
    });
  });

  it("renders page heading", () => {
    render(<Journal />);
    expect(screen.getByText("Journal")).toBeTruthy();
  });

  it("renders New Entry button", () => {
    render(<Journal />);
    expect(screen.getByText("New Entry")).toBeTruthy();
  });

  it("shows empty state", async () => {
    render(<Journal />);
    await waitFor(() => {
      expect(screen.getByText(/Start writing your first journal entry/)).toBeTruthy();
    });
  });

  it("shows form when New Entry clicked", () => {
    render(<Journal />);
    fireEvent.click(screen.getByText("New Entry"));
    expect(screen.getByPlaceholderText("Title (optional)")).toBeTruthy();
    expect(screen.getByPlaceholderText("What's on your mind?")).toBeTruthy();
    expect(screen.getByText("Save Entry")).toBeTruthy();
  });

  it("renders entries when available", async () => {
    mockInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === "list_journal_entries")
        return [
          { id: 1, title: "Good Day", content: "Had a productive day", mood_rating: 4, created_at: "2024-06-15T10:00:00" },
        ];
      return undefined;
    });

    render(<Journal />);
    await waitFor(() => {
      expect(screen.getByText("Good Day")).toBeTruthy();
    });
  });
});
