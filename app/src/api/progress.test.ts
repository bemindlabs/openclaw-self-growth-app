import { describe, it, expect, beforeEach, vi } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import {
  progressApi,
  type ProgressEntry,
  type DashboardStats,
  type MoodHabitCorrelation,
  type LifeBalanceDomain,
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

const mockLifeBalance: LifeBalanceDomain[] = [
  { domain: "Health", score: 80 },
  { domain: "Habits", score: 60 },
  { domain: "Skills", score: 75 },
  { domain: "Learning", score: 50 },
  { domain: "Goals", score: 90 },
  { domain: "Journal", score: 40 },
  { domain: "Finance", score: 30 },
];

const mockCorrelation: MoodHabitCorrelation = {
  habit_name: "Morning run",
  habit_color: "#6366f1",
  avg_mood_with: 7.8,
  avg_mood_without: 5.4,
  diff: 2.4,
  sample_days: 30,
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

  describe("getLifeBalance", () => {
    it("calls get_life_balance with no arguments", async () => {
      mockInvoke.mockResolvedValueOnce(mockLifeBalance);
      await progressApi.getLifeBalance();
      expect(mockInvoke).toHaveBeenCalledWith("get_life_balance");
    });

    it("returns all 7 life domains", async () => {
      mockInvoke.mockResolvedValueOnce(mockLifeBalance);
      const result = await progressApi.getLifeBalance();
      expect(result).toHaveLength(7);
      expect(result[0].domain).toBe("Health");
      expect(result[0].score).toBe(80);
      expect(result[6].domain).toBe("Finance");
    });

    it("returns empty array when no data", async () => {
      mockInvoke.mockResolvedValueOnce([]);
      const result = await progressApi.getLifeBalance();
      expect(result).toEqual([]);
    });
  });

  describe("getMoodHabitCorrelation", () => {
    it("calls get_mood_habit_correlation with no arguments", async () => {
      mockInvoke.mockResolvedValueOnce([mockCorrelation]);
      await progressApi.getMoodHabitCorrelation();
      expect(mockInvoke).toHaveBeenCalledOnce();
      expect(mockInvoke).toHaveBeenCalledWith("get_mood_habit_correlation");
    });

    it("returns an empty array when insufficient data", async () => {
      mockInvoke.mockResolvedValueOnce([]);
      const result = await progressApi.getMoodHabitCorrelation();
      expect(result).toEqual([]);
    });

    it("returns typed correlation entries", async () => {
      mockInvoke.mockResolvedValueOnce([mockCorrelation]);
      const result = await progressApi.getMoodHabitCorrelation();
      expect(result).toHaveLength(1);
      expect(result[0].habit_name).toBe("Morning run");
      expect(result[0].avg_mood_with).toBe(7.8);
      expect(result[0].avg_mood_without).toBe(5.4);
      expect(result[0].diff).toBe(2.4);
      expect(result[0].sample_days).toBe(30);
    });
  });
});
