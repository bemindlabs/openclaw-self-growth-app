import { describe, it, expect, beforeEach, vi } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import { habitsApi, type Habit, type HabitLog } from "./habits";

const mockInvoke = vi.mocked(invoke);

const mockHabit: Habit = {
  id: 1,
  name: "Morning run",
  description: "Run 5km every morning",
  frequency: "daily",
  color: "#FF5733",
  is_active: true,
  created_at: "2024-01-01T00:00:00",
  identity_statement: "I'm becoming someone who prioritizes health",
};

const mockHabitLog: HabitLog = {
  id: 10,
  habit_id: 1,
  logged_date: "2024-06-15",
  notes: "Felt great",
  created_at: "2024-06-15T07:30:00",
};

describe("habitsApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("calls list_habits with no arguments", async () => {
      mockInvoke.mockResolvedValueOnce([mockHabit]);
      await habitsApi.list();
      expect(mockInvoke).toHaveBeenCalledOnce();
      expect(mockInvoke).toHaveBeenCalledWith("list_habits");
    });
  });

  describe("create", () => {
    it("calls create_habit with the wrapped data object", async () => {
      mockInvoke.mockResolvedValueOnce(mockHabit);
      const data = {
        name: "Morning run",
        description: "Run 5km every morning",
        frequency: "daily",
        color: "#FF5733",
      };
      await habitsApi.create(data);
      expect(mockInvoke).toHaveBeenCalledWith("create_habit", { data });
    });

    it("calls create_habit with only the required name field", async () => {
      mockInvoke.mockResolvedValueOnce(mockHabit);
      await habitsApi.create({ name: "Meditate" });
      expect(mockInvoke).toHaveBeenCalledWith("create_habit", {
        data: { name: "Meditate" },
      });
    });

    it("calls create_habit with identity_statement when provided", async () => {
      mockInvoke.mockResolvedValueOnce(mockHabit);
      const data = {
        name: "Morning run",
        identity_statement: "I'm becoming someone who prioritizes health",
      };
      await habitsApi.create(data);
      expect(mockInvoke).toHaveBeenCalledWith("create_habit", { data });
    });
  });

  describe("update", () => {
    it("calls update_habit with id and spread fields", async () => {
      mockInvoke.mockResolvedValueOnce(mockHabit);
      await habitsApi.update(1, { name: "Evening run", is_active: false });
      expect(mockInvoke).toHaveBeenCalledWith("update_habit", {
        id: 1,
        name: "Evening run",
        is_active: false,
      });
    });

    it("calls update_habit with only the id when fields object is empty", async () => {
      mockInvoke.mockResolvedValueOnce(mockHabit);
      await habitsApi.update(2, {});
      expect(mockInvoke).toHaveBeenCalledWith("update_habit", { id: 2 });
    });

    it("calls update_habit with identity_statement when provided", async () => {
      mockInvoke.mockResolvedValueOnce(mockHabit);
      await habitsApi.update(1, { identity_statement: "I'm becoming someone who prioritizes health" });
      expect(mockInvoke).toHaveBeenCalledWith("update_habit", {
        id: 1,
        identity_statement: "I'm becoming someone who prioritizes health",
      });
    });
  });

  describe("delete", () => {
    it("calls delete_habit with the provided id", async () => {
      mockInvoke.mockResolvedValueOnce(undefined);
      await habitsApi.delete(5);
      expect(mockInvoke).toHaveBeenCalledWith("delete_habit", { id: 5 });
    });
  });

  describe("toggle", () => {
    it("calls toggle_habit with habitId and date", async () => {
      mockInvoke.mockResolvedValueOnce(true);
      await habitsApi.toggle(1, "2024-06-15");
      expect(mockInvoke).toHaveBeenCalledWith("toggle_habit", {
        habitId: 1,
        date: "2024-06-15",
      });
    });

    it("returns the boolean result from invoke", async () => {
      mockInvoke.mockResolvedValueOnce(false);
      const result = await habitsApi.toggle(1, "2024-06-15");
      expect(result).toBe(false);
    });
  });

  describe("identity_statement", () => {
    it("list returns habits with identity_statement field", async () => {
      mockInvoke.mockResolvedValueOnce([mockHabit]);
      const result = await habitsApi.list();
      expect(result[0].identity_statement).toBe("I'm becoming someone who prioritizes health");
    });

    it("list returns habits with null identity_statement when unset", async () => {
      const habitWithoutIdentity: Habit = { ...mockHabit, identity_statement: null };
      mockInvoke.mockResolvedValueOnce([habitWithoutIdentity]);
      const result = await habitsApi.list();
      expect(result[0].identity_statement).toBeNull();
    });
  });

  describe("getLogs", () => {
    it("calls get_habit_logs with habitId and no days when omitted", async () => {
      mockInvoke.mockResolvedValueOnce([mockHabitLog]);
      await habitsApi.getLogs(1);
      expect(mockInvoke).toHaveBeenCalledWith("get_habit_logs", {
        habitId: 1,
        days: undefined,
      });
    });

    it("calls get_habit_logs with habitId and the provided days limit", async () => {
      mockInvoke.mockResolvedValueOnce([mockHabitLog]);
      await habitsApi.getLogs(1, 30);
      expect(mockInvoke).toHaveBeenCalledWith("get_habit_logs", {
        habitId: 1,
        days: 30,
      });
    });
  });
});
