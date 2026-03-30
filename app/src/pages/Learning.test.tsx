import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { invoke } from "@tauri-apps/api/core";
import Learning from "./Learning";

const mockInvoke = vi.mocked(invoke);

describe("Learning", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === "list_learning_items") return [];
      return undefined;
    });
  });

  it("renders page heading", () => {
    render(<Learning />);
    expect(screen.getByText("Learning")).toBeTruthy();
  });

  it("renders Add Item button", () => {
    render(<Learning />);
    expect(screen.getByText("Add Item")).toBeTruthy();
  });

  it("renders filter buttons", () => {
    render(<Learning />);
    expect(screen.getByText("All")).toBeTruthy();
    expect(screen.getByText("backlog")).toBeTruthy();
    expect(screen.getByText("in_progress")).toBeTruthy();
  });

  it("shows empty state", async () => {
    render(<Learning />);
    await waitFor(() => {
      expect(screen.getByText("No learning items yet.")).toBeTruthy();
    });
  });

  it("shows form when Add Item clicked", () => {
    render(<Learning />);
    fireEvent.click(screen.getByText("Add Item"));
    expect(screen.getByPlaceholderText("Title")).toBeTruthy();
    expect(screen.getByPlaceholderText("Source URL (optional)")).toBeTruthy();
  });

  it("renders items when available", async () => {
    mockInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === "list_learning_items")
        return [
          { id: 1, title: "Rust Book", description: "Learn Rust", item_type: "book", status: "in_progress", source_url: null },
        ];
      return undefined;
    });

    render(<Learning />);
    await waitFor(() => {
      expect(screen.getByText("Rust Book")).toBeTruthy();
      expect(screen.getByText("Learn Rust")).toBeTruthy();
      expect(screen.getByText("book")).toBeTruthy();
    });
  });
});
