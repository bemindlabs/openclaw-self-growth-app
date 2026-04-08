import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { invoke } from "@tauri-apps/api/core";
import OcrButton from "./OcrButton";

const mockInvoke = vi.mocked(invoke);

// Mock @tauri-apps/plugin-dialog
vi.mock("@tauri-apps/plugin-dialog", () => ({
  open: vi.fn(),
}));

import { open } from "@tauri-apps/plugin-dialog";
const mockOpen = vi.mocked(open);

describe("OcrButton", () => {
  const onResult = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders default label", () => {
    render(<OcrButton onResult={onResult} />);
    expect(screen.getByText("Scan Image")).toBeTruthy();
  });

  it("renders custom label", () => {
    render(<OcrButton onResult={onResult} label="Scan Receipt" />);
    expect(screen.getByText("Scan Receipt")).toBeTruthy();
  });

  it("does nothing when no file is selected", async () => {
    mockOpen.mockResolvedValueOnce(null);
    render(<OcrButton onResult={onResult} />);

    fireEvent.click(screen.getByText("Scan Image"));

    await waitFor(() => {
      expect(mockOpen).toHaveBeenCalledOnce();
    });
    expect(mockInvoke).not.toHaveBeenCalled();
    expect(onResult).not.toHaveBeenCalled();
  });

  it("calls invoke and onResult on successful scan", async () => {
    mockOpen.mockResolvedValueOnce("/path/to/image.png" as any);
    mockInvoke.mockResolvedValueOnce("Extracted text");

    render(<OcrButton onResult={onResult} mode="lab" />);
    fireEvent.click(screen.getByText("Scan Image"));

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith("ocr_extract", {
        imagePath: "/path/to/image.png",
        mode: "lab",
      });
    });
    expect(onResult).toHaveBeenCalledWith("Extracted text");
  });

  it("shows Scanning... while processing", async () => {
    let resolveOpen: (value: any) => void;
    mockOpen.mockReturnValue(new Promise((r) => { resolveOpen = r; }));

    render(<OcrButton onResult={onResult} />);
    fireEvent.click(screen.getByText("Scan Image"));

    // Button should be disabled during scan
    resolveOpen!("/path/to/img.png");
    mockInvoke.mockResolvedValueOnce("text");

    await waitFor(() => {
      expect(onResult).toHaveBeenCalled();
    });
  });

  it("shows alert on OCR failure", async () => {
    mockOpen.mockResolvedValueOnce("/path/to/image.png" as any);
    mockInvoke.mockRejectedValueOnce(new Error("OCR engine failed"));

    render(<OcrButton onResult={onResult} />);
    fireEvent.click(screen.getByText("Scan Image"));

    await waitFor(() => {
      expect(screen.getByText("OCR failed: Error: OCR engine failed")).toBeTruthy();
    });
    expect(onResult).not.toHaveBeenCalled();
  });

  it("applies custom className", () => {
    const { container } = render(<OcrButton onResult={onResult} className="my-btn" />);
    expect(container.querySelector("button")?.classList.contains("my-btn")).toBe(true);
  });
});
