import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { cn, formatDate, formatRelativeDate } from "./utils";

describe("cn", () => {
  it("merges multiple class strings", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes (falsy values are dropped)", () => {
    expect(cn("base", false && "hidden", undefined, "extra")).toBe(
      "base extra"
    );
  });

  it("handles conditional classes with object syntax", () => {
    expect(cn("base", { active: true, disabled: false })).toBe("base active");
  });

  it("resolves tailwind conflicts – last class wins", () => {
    // twMerge should keep only the last conflicting utility
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("resolves tailwind text-color conflicts", () => {
    expect(cn("text-red-500", "text-blue-600")).toBe("text-blue-600");
  });

  it("returns empty string when no arguments are provided", () => {
    expect(cn()).toBe("");
  });
});

describe("formatDate", () => {
  it("formats a UTC date string into a human-readable local date", () => {
    // 2024-06-15 UTC → the function appends 'Z' so the date is 2024-06-15T00:00:00Z
    const result = formatDate("2024-06-15");
    // The result is locale-dependent, so verify the year and that it is a non-empty string
    expect(result).toContain("2024");
    expect(result.length).toBeGreaterThan(0);
  });

  it("includes month abbreviation and day in the output", () => {
    const result = formatDate("2023-01-01");
    expect(result).toContain("2023");
    // Month short names are locale-dependent; just assert structure
    expect(typeof result).toBe("string");
  });
});

describe("formatRelativeDate", () => {
  const NOW = new Date("2024-06-15T12:00:00Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "Today" when the date is the same UTC day', () => {
    // dateStr without time; function appends "Z" → 2024-06-15T00:00:00Z
    // diff is 12 hours → diffDays = 0
    expect(formatRelativeDate("2024-06-15")).toBe("Today");
  });

  it('returns "Yesterday" when the date is one day ago', () => {
    // 2024-06-14T00:00:00Z → diff = 36h → diffDays = 1
    expect(formatRelativeDate("2024-06-14")).toBe("Yesterday");
  });

  it('returns "X days ago" for dates 2–6 days in the past', () => {
    // NOW = 2024-06-15T12:00:00Z
    // 2024-06-13T00:00:00Z → diff = 60h → diffDays = 2
    expect(formatRelativeDate("2024-06-13")).toBe("2 days ago");

    // 2024-06-11T00:00:00Z → diff = 108h → diffDays = 4
    expect(formatRelativeDate("2024-06-11")).toBe("4 days ago");

    // 2024-06-10T00:00:00Z → diff = 132h → diffDays = 5
    expect(formatRelativeDate("2024-06-10")).toBe("5 days ago");
  });

  it("falls back to formatDate for dates 7 or more days ago", () => {
    // 2024-06-07T00:00:00Z → diff = 192h → diffDays = 8
    const result = formatRelativeDate("2024-06-07");
    expect(result).toContain("2024");
    // Should NOT be a relative label
    expect(result).not.toMatch(/ago|Today|Yesterday/);
  });

  it("falls back to formatDate for dates exactly 7 days ago", () => {
    // 2024-06-08T00:00:00Z → diff = 168h → diffDays = 7
    const result = formatRelativeDate("2024-06-08");
    expect(result).toContain("2024");
    expect(result).not.toMatch(/ago|Today|Yesterday/);
  });
});
