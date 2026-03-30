import { describe, it, expect, beforeEach, vi } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import { learningApi, type LearningItem } from "./learning";

const mockInvoke = vi.mocked(invoke);

const mockItem: LearningItem = {
  id: 1,
  title: "Learn TypeScript",
  description: "Deep dive into advanced types",
  item_type: "course",
  source_url: "https://example.com/ts-course",
  status: "in_progress",
  skill_id: 2,
  created_at: "2024-06-01T00:00:00",
  completed_at: null,
};

describe("learningApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("calls list_learning_items with undefined when no status given", async () => {
      mockInvoke.mockResolvedValueOnce([mockItem]);
      await learningApi.list();
      expect(mockInvoke).toHaveBeenCalledWith("list_learning_items", {
        status: undefined,
      });
    });

    it("calls list_learning_items with the provided status", async () => {
      mockInvoke.mockResolvedValueOnce([mockItem]);
      await learningApi.list("in_progress");
      expect(mockInvoke).toHaveBeenCalledWith("list_learning_items", {
        status: "in_progress",
      });
    });
  });

  describe("create", () => {
    it("calls create_learning_item with the wrapped data object", async () => {
      mockInvoke.mockResolvedValueOnce(mockItem);
      const data = {
        title: "Learn TypeScript",
        description: "Deep dive into advanced types",
        item_type: "course",
        source_url: "https://example.com/ts-course",
        skill_id: 2,
      };
      await learningApi.create(data);
      expect(mockInvoke).toHaveBeenCalledWith("create_learning_item", { data });
    });

    it("calls create_learning_item with only the required fields", async () => {
      mockInvoke.mockResolvedValueOnce(mockItem);
      await learningApi.create({ title: "Read book", item_type: "book" });
      expect(mockInvoke).toHaveBeenCalledWith("create_learning_item", {
        data: { title: "Read book", item_type: "book" },
      });
    });
  });

  describe("update", () => {
    it("calls update_learning_item with id and spread fields", async () => {
      mockInvoke.mockResolvedValueOnce(mockItem);
      await learningApi.update(1, { title: "Updated", status: "completed" });
      expect(mockInvoke).toHaveBeenCalledWith("update_learning_item", {
        id: 1,
        title: "Updated",
        status: "completed",
      });
    });

    it("calls update_learning_item with only the id when fields object is empty", async () => {
      mockInvoke.mockResolvedValueOnce(mockItem);
      await learningApi.update(4, {});
      expect(mockInvoke).toHaveBeenCalledWith("update_learning_item", {
        id: 4,
      });
    });
  });

  describe("delete", () => {
    it("calls delete_learning_item with the provided id", async () => {
      mockInvoke.mockResolvedValueOnce(undefined);
      await learningApi.delete(7);
      expect(mockInvoke).toHaveBeenCalledWith("delete_learning_item", {
        id: 7,
      });
    });
  });
});
