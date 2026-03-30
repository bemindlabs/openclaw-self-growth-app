import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { invoke } from "@tauri-apps/api/core";
import StoryPage from "./Story";

const mockInvoke = vi.mocked(invoke);

vi.mock("react-markdown", () => ({
  default: ({ children }: { children: string }) => <div>{children}</div>,
}));

describe("StoryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page heading", () => {
    render(<StoryPage />);
    expect(screen.getByText("Story Lab")).toBeTruthy();
  });

  it("renders prompt textarea with default text", () => {
    render(<StoryPage />);
    const textarea = screen.getByPlaceholderText(/Describe the kind of story/);
    expect((textarea as HTMLTextAreaElement).value).toContain("becoming a little better");
  });

  it("renders tone options", () => {
    render(<StoryPage />);
    expect(screen.getByText("encouraging")).toBeTruthy();
    expect(screen.getByText("reflective")).toBeTruthy();
    expect(screen.getByText("cinematic")).toBeTruthy();
    expect(screen.getByText("playful")).toBeTruthy();
    expect(screen.getByText("calm")).toBeTruthy();
  });

  it("renders Generate story button", () => {
    render(<StoryPage />);
    expect(screen.getByText("Generate story")).toBeTruthy();
  });

  it("generates and displays a story", async () => {
    mockInvoke.mockResolvedValueOnce({
      story: "Once upon a time...",
      model: "gpt-4",
      provider: "openai",
      context_summary: ["3 active skills", "2 learning items"],
    });

    render(<StoryPage />);
    fireEvent.click(screen.getByText("Generate story"));

    await waitFor(() => {
      expect(screen.getByText("Once upon a time...")).toBeTruthy();
      expect(screen.getByText("Generated story")).toBeTruthy();
      expect(screen.getByText("Context used")).toBeTruthy();
      expect(screen.getByText("3 active skills")).toBeTruthy();
    });
  });

  it("shows error on failure", async () => {
    mockInvoke.mockRejectedValueOnce(new Error("AI unavailable"));

    render(<StoryPage />);
    fireEvent.click(screen.getByText("Generate story"));

    await waitFor(() => {
      expect(screen.getByText(/AI unavailable/)).toBeTruthy();
    });
  });
});
