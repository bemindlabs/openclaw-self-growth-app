import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { invoke } from "@tauri-apps/api/core";
import Skills from "./Skills";

const mockInvoke = vi.mocked(invoke);

describe("Skills", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === "list_skills") return [];
      return undefined;
    });
  });

  it("renders page heading", () => {
    render(<Skills />);
    expect(screen.getByText("Skills")).toBeTruthy();
  });

  it("renders Add Skill button", () => {
    render(<Skills />);
    expect(screen.getByText("Add Skill")).toBeTruthy();
  });

  it("shows empty state", async () => {
    render(<Skills />);
    await waitFor(() => {
      expect(screen.getByText("No skills tracked yet.")).toBeTruthy();
    });
  });

  it("shows form when Add Skill clicked", () => {
    render(<Skills />);
    fireEvent.click(screen.getByText("Add Skill"));
    expect(screen.getByPlaceholderText("Skill name")).toBeTruthy();
  });

  it("renders skills with progress", async () => {
    mockInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === "list_skills")
        return [
          { id: 1, name: "React", category: "technical", current_level: 3, target_level: 5 },
        ];
      return undefined;
    });

    render(<Skills />);
    await waitFor(() => {
      expect(screen.getByText("React")).toBeTruthy();
      expect(screen.getByText("technical")).toBeTruthy();
      expect(screen.getByText("3/5")).toBeTruthy();
      expect(screen.getByText("60% complete")).toBeTruthy();
    });
  });

  it("calls create skill on form submit", async () => {
    mockInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === "list_skills") return [];
      if (cmd === "create_skill") return { id: 1 };
      return undefined;
    });

    render(<Skills />);
    fireEvent.click(screen.getByText("Add Skill"));
    fireEvent.change(screen.getByPlaceholderText("Skill name"), { target: { value: "Go" } });
    fireEvent.click(screen.getByText("Create"));

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith("create_skill", {
        data: { name: "Go", category: "general", target_level: 5 },
      });
    });
  });
});
