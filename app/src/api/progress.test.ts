import { describe, it, expect, beforeEach, vi } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import {
  progressApi,
  type ProgressEntry,
  type DashboardStats,
} from "./progress";

const mockInvoke = vi.mocked(invoke);

const mockEntry: ProgressEntry = {
  id: 1,
  skill_id: 2,
  learning_item_id: null,
  entry_type: "practice",
  value: 60,
  notes: "Practiced for 60 minutes",
  created_at: "2024-06-15T00:00:00",
};

const mockStats: DashboardStats = {
  total_skills: 5,
  total_learning_items: 12,
  active_routines: 3,
  active_goals: 4,
  completions_today: 2,
  current_streak: 7,
};

describe("progressApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("calls list_progress with all undefined when no args given", async () => {
      mockInvoke.mockResolvedValueOnce([mockEntry]);
      await progressApi.list();
      expect(mockInvoke).toHaveBeenCalledWith("list_progress", {
        skillId: undefined,
        limit: undefined,
      });
    });

    it("calls list_progress with the provided skillId and limit", async () => {
      mockInvoke.mockResolvedValueOnce([mockEntry]);
      await progressApi.list(2, 10);
      expect(mockInvoke).toHaveBeenCalledWith("list_progress", {
        skillId: 2,
        limit: 10,
      });
    });
  });

  describe("create", () => {
    it("calls create_progress_entry with the wrapped data object", async () => {
      mockInvoke.mockResolvedValueOnce(mockEntry);
      const data = {
        skill_id: 2,
        entry_type: "practice",
        value: 60,
        notes: "Practiced for 60 minutes",
      };
      await progressApi.create(data);
      expect(mockInvoke).toHaveBeenCalledWith("create_progress_entry", {
        data,
      });
    });

    it("calls create_progress_entry with only the required entry_type", async () => {
      mockInvoke.mockResolvedValueOnce(mockEntry);
      await progressApi.create({ entry_type: "milestone" });
      expect(mockInvoke).toHaveBeenCalledWith("create_progress_entry", {
        data: { entry_type: "milestone" },
      });
    });
  });

  describe("getDashboardStats", () => {
    it("calls get_dashboard_stats with no arguments", async () => {
      mockInvoke.mockResolvedValueOnce(mockStats);
      await progressApi.getDashboardStats();
      expect(mockInvoke).toHaveBeenCalledWith("get_dashboard_stats");
    });
  });
});
