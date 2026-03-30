import { describe, it, expect, beforeEach, vi } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import { goalsApi, type Goal } from "./goals";

const mockInvoke = vi.mocked(invoke);

const mockGoal: Goal = {
  id: 1,
  title: "Learn Rust",
  description: "Deep dive into Rust programming",
  skill_id: 2,
  target_date: "2024-12-31",
  status: "active",
  created_at: "2024-01-01T00:00:00",
};

describe("goalsApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("calls list_goals with no arguments when status is omitted", async () => {
      mockInvoke.mockResolvedValueOnce([mockGoal]);
      await goalsApi.list();
      expect(mockInvoke).toHaveBeenCalledOnce();
      expect(mockInvoke).toHaveBeenCalledWith("list_goals", {
        status: undefined,
      });
    });

    it("calls list_goals with the provided status filter", async () => {
      mockInvoke.mockResolvedValueOnce([mockGoal]);
      await goalsApi.list("active");
      expect(mockInvoke).toHaveBeenCalledWith("list_goals", {
        status: "active",
      });
    });
  });

  describe("create", () => {
    it("calls create_goal with the wrapped data object", async () => {
      mockInvoke.mockResolvedValueOnce(mockGoal);
      const data = {
        title: "Learn Rust",
        description: "Deep dive",
        skill_id: 2,
        target_date: "2024-12-31",
      };
      await goalsApi.create(data);
      expect(mockInvoke).toHaveBeenCalledWith("create_goal", { data });
    });

    it("calls create_goal with only the required title field", async () => {
      mockInvoke.mockResolvedValueOnce(mockGoal);
      await goalsApi.create({ title: "Minimal goal" });
      expect(mockInvoke).toHaveBeenCalledWith("create_goal", {
        data: { title: "Minimal goal" },
      });
    });
  });

  describe("update", () => {
    it("calls update_goal with id and spread fields", async () => {
      mockInvoke.mockResolvedValueOnce(mockGoal);
      await goalsApi.update(1, { title: "Updated title", status: "done" });
      expect(mockInvoke).toHaveBeenCalledWith("update_goal", {
        id: 1,
        title: "Updated title",
        status: "done",
      });
    });

    it("calls update_goal with only the id when fields object is empty", async () => {
      mockInvoke.mockResolvedValueOnce(mockGoal);
      await goalsApi.update(42, {});
      expect(mockInvoke).toHaveBeenCalledWith("update_goal", { id: 42 });
    });
  });

  describe("delete", () => {
    it("calls delete_goal with the provided id", async () => {
      mockInvoke.mockResolvedValueOnce(undefined);
      await goalsApi.delete(7);
      expect(mockInvoke).toHaveBeenCalledWith("delete_goal", { id: 7 });
    });
  });
});
