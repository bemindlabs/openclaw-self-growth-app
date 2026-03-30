import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { invoke } from "@tauri-apps/api/core";
import SearchPage from "./Search";

const mockInvoke = vi.mocked(invoke);

describe("SearchPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page heading", () => {
    render(<SearchPage />);
    expect(screen.getByText("Smart Search")).toBeTruthy();
  });

  it("renders search input and buttons", () => {
    render(<SearchPage />);
    expect(screen.getByPlaceholderText(/Search your learning/)).toBeTruthy();
    expect(screen.getByText("Search")).toBeTruthy();
    expect(screen.getByText("Rebuild Index")).toBeTruthy();
  });

  it("shows initial empty state", () => {
    render(<SearchPage />);
    expect(screen.getByText(/Search across all your learning/)).toBeTruthy();
  });

  it("performs search and shows results", async () => {
    mockInvoke.mockResolvedValueOnce([
      { source_table: "skills", source_id: 1, title: "React", description: "Frontend framework", score: 0.95 },
    ]);

    render(<SearchPage />);
    const input = screen.getByPlaceholderText(/Search your learning/);
    fireEvent.change(input, { target: { value: "react" } });
    fireEvent.click(screen.getByText("Search"));

    await waitFor(() => {
      expect(screen.getByText("React")).toBeTruthy();
      expect(screen.getByText("Frontend framework")).toBeTruthy();
      expect(screen.getByText("95% match")).toBeTruthy();
    });
  });

  it("shows no results message", async () => {
    mockInvoke.mockResolvedValueOnce([]);

    render(<SearchPage />);
    fireEvent.change(screen.getByPlaceholderText(/Search your learning/), { target: { value: "xyz" } });
    fireEvent.click(screen.getByText("Search"));

    await waitFor(() => {
      expect(screen.getByText(/No results found/)).toBeTruthy();
    });
  });
});
