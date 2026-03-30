import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { invoke } from "@tauri-apps/api/core";
import Routines from "./Routines";

const mockInvoke = vi.mocked(invoke);

describe("Routines", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === "list_routines") return [];
      return undefined;
    });
  });

  it("renders page heading", () => {
    render(<Routines />);
    expect(screen.getByText("Routines")).toBeTruthy();
  });

  it("renders Add Routine button", () => {
    render(<Routines />);
    expect(screen.getByText("Add Routine")).toBeTruthy();
  });

  it("shows empty state", async () => {
    render(<Routines />);
    await waitFor(() => {
      expect(screen.getByText(/No routines yet/)).toBeTruthy();
    });
  });

  it("shows form when Add Routine clicked", () => {
    render(<Routines />);
    fireEvent.click(screen.getByText("Add Routine"));
    expect(screen.getByPlaceholderText("Routine name")).toBeTruthy();
  });

  it("renders routines when available", async () => {
    mockInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === "list_routines")
        return [
          { id: 1, name: "Morning Exercise", description: "30 min workout", frequency: "daily" },
        ];
      return undefined;
    });

    render(<Routines />);
    await waitFor(() => {
      expect(screen.getByText("Morning Exercise")).toBeTruthy();
      expect(screen.getByText("30 min workout")).toBeTruthy();
      expect(screen.getByText("daily")).toBeTruthy();
    });
  });

  it("calls complete_routine when check button clicked", async () => {
    mockInvoke.mockImplementation(async (cmd: string) => {
      if (cmd === "list_routines")
        return [{ id: 5, name: "Stretch", description: null, frequency: "daily" }];
      if (cmd === "complete_routine") return undefined;
      return undefined;
    });

    render(<Routines />);
    await waitFor(() => {
      expect(screen.getByText("Stretch")).toBeTruthy();
    });

    fireEvent.click(screen.getByTitle("Mark complete"));

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith("complete_routine", { routineId: 5 });
    });
  });
});
