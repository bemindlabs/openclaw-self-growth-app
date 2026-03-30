import { describe, it, expect, beforeEach, vi } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import { journalApi, type JournalEntry } from "./journal";

const mockInvoke = vi.mocked(invoke);

const mockEntry: JournalEntry = {
  id: 1,
  title: "Good day",
  content: "Today was productive...",
  mood_rating: 8,
  created_at: "2024-06-15T00:00:00",
  updated_at: "2024-06-15T00:00:00",
};

describe("journalApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("calls list_journal_entries with undefined when no limit given", async () => {
      mockInvoke.mockResolvedValueOnce([mockEntry]);
      await journalApi.list();
      expect(mockInvoke).toHaveBeenCalledWith("list_journal_entries", {
        limit: undefined,
      });
    });

    it("calls list_journal_entries with the provided limit", async () => {
      mockInvoke.mockResolvedValueOnce([mockEntry]);
      await journalApi.list(10);
      expect(mockInvoke).toHaveBeenCalledWith("list_journal_entries", {
        limit: 10,
      });
    });
  });

  describe("create", () => {
    it("calls create_journal_entry with the wrapped data object", async () => {
      mockInvoke.mockResolvedValueOnce(mockEntry);
      const data = {
        title: "Good day",
        content: "Today was productive...",
        mood_rating: 8,
      };
      await journalApi.create(data);
      expect(mockInvoke).toHaveBeenCalledWith("create_journal_entry", { data });
    });

    it("calls create_journal_entry with only the required content", async () => {
      mockInvoke.mockResolvedValueOnce(mockEntry);
      await journalApi.create({ content: "Quick note" });
      expect(mockInvoke).toHaveBeenCalledWith("create_journal_entry", {
        data: { content: "Quick note" },
      });
    });
  });

  describe("update", () => {
    it("calls update_journal_entry with id and spread fields", async () => {
      mockInvoke.mockResolvedValueOnce(mockEntry);
      await journalApi.update(1, { title: "Updated title", mood_rating: 9 });
      expect(mockInvoke).toHaveBeenCalledWith("update_journal_entry", {
        id: 1,
        title: "Updated title",
        mood_rating: 9,
      });
    });

    it("calls update_journal_entry with only the id when fields object is empty", async () => {
      mockInvoke.mockResolvedValueOnce(mockEntry);
      await journalApi.update(2, {});
      expect(mockInvoke).toHaveBeenCalledWith("update_journal_entry", {
        id: 2,
      });
    });
  });

  describe("delete", () => {
    it("calls delete_journal_entry with the provided id", async () => {
      mockInvoke.mockResolvedValueOnce(undefined);
      await journalApi.delete(3);
      expect(mockInvoke).toHaveBeenCalledWith("delete_journal_entry", {
        id: 3,
      });
    });
  });
});
