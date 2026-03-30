import { describe, it, expect, beforeEach, vi } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import {
  routinesApi,
  type Routine,
  type RoutineStep,
  type RoutineLog,
} from "./routines";

const mockInvoke = vi.mocked(invoke);

const mockRoutine: Routine = {
  id: 1,
  name: "Morning routine",
  description: "Start the day right",
  frequency: "daily",
  is_active: true,
  created_at: "2024-01-01T00:00:00",
};

const mockStep: RoutineStep = {
  id: 10,
  routine_id: 1,
  title: "Stretch",
  duration_min: 10,
  sort_order: 1,
};

const mockLog: RoutineLog = {
  id: 100,
  routine_id: 1,
  completed_at: "2024-06-15T08:00:00",
  notes: "Felt refreshed",
  mood_rating: 4,
};

describe("routinesApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("calls list_routines with no arguments", async () => {
      mockInvoke.mockResolvedValueOnce([mockRoutine]);
      await routinesApi.list();
      expect(mockInvoke).toHaveBeenCalledOnce();
      expect(mockInvoke).toHaveBeenCalledWith("list_routines");
    });
  });

  describe("create", () => {
    it("calls create_routine with the wrapped data object", async () => {
      mockInvoke.mockResolvedValueOnce(mockRoutine);
      const data = {
        name: "Morning routine",
        description: "Start the day right",
        frequency: "daily",
      };
      await routinesApi.create(data);
      expect(mockInvoke).toHaveBeenCalledWith("create_routine", { data });
    });

    it("calls create_routine with only the required name field", async () => {
      mockInvoke.mockResolvedValueOnce(mockRoutine);
      await routinesApi.create({ name: "Evening wind-down" });
      expect(mockInvoke).toHaveBeenCalledWith("create_routine", {
        data: { name: "Evening wind-down" },
      });
    });
  });

  describe("update", () => {
    it("calls update_routine with id and spread fields", async () => {
      mockInvoke.mockResolvedValueOnce(mockRoutine);
      await routinesApi.update(1, { name: "Updated routine", is_active: false });
      expect(mockInvoke).toHaveBeenCalledWith("update_routine", {
        id: 1,
        name: "Updated routine",
        is_active: false,
      });
    });

    it("calls update_routine with only the id when fields object is empty", async () => {
      mockInvoke.mockResolvedValueOnce(mockRoutine);
      await routinesApi.update(3, {});
      expect(mockInvoke).toHaveBeenCalledWith("update_routine", { id: 3 });
    });
  });

  describe("delete", () => {
    it("calls delete_routine with the provided id", async () => {
      mockInvoke.mockResolvedValueOnce(undefined);
      await routinesApi.delete(7);
      expect(mockInvoke).toHaveBeenCalledWith("delete_routine", { id: 7 });
    });
  });

  describe("getSteps", () => {
    it("calls get_routine_steps with the provided routineId", async () => {
      mockInvoke.mockResolvedValueOnce([mockStep]);
      await routinesApi.getSteps(1);
      expect(mockInvoke).toHaveBeenCalledWith("get_routine_steps", {
        routineId: 1,
      });
    });
  });

  describe("addStep", () => {
    it("calls add_routine_step with the wrapped data object", async () => {
      mockInvoke.mockResolvedValueOnce(mockStep);
      const data = {
        routine_id: 1,
        title: "Stretch",
        duration_min: 10,
        sort_order: 1,
      };
      await routinesApi.addStep(data);
      expect(mockInvoke).toHaveBeenCalledWith("add_routine_step", { data });
    });

    it("calls add_routine_step without optional duration_min", async () => {
      mockInvoke.mockResolvedValueOnce(mockStep);
      await routinesApi.addStep({ routine_id: 1, title: "Read", sort_order: 2 });
      expect(mockInvoke).toHaveBeenCalledWith("add_routine_step", {
        data: { routine_id: 1, title: "Read", sort_order: 2 },
      });
    });
  });

  describe("deleteStep", () => {
    it("calls delete_routine_step with the provided id", async () => {
      mockInvoke.mockResolvedValueOnce(undefined);
      await routinesApi.deleteStep(10);
      expect(mockInvoke).toHaveBeenCalledWith("delete_routine_step", { id: 10 });
    });
  });

  describe("complete", () => {
    it("calls complete_routine with routineId only when optional args are omitted", async () => {
      mockInvoke.mockResolvedValueOnce(mockLog);
      await routinesApi.complete(1);
      expect(mockInvoke).toHaveBeenCalledWith("complete_routine", {
        routineId: 1,
        notes: undefined,
        moodRating: undefined,
      });
    });

    it("calls complete_routine with routineId, notes and moodRating", async () => {
      mockInvoke.mockResolvedValueOnce(mockLog);
      await routinesApi.complete(1, "Great session", 5);
      expect(mockInvoke).toHaveBeenCalledWith("complete_routine", {
        routineId: 1,
        notes: "Great session",
        moodRating: 5,
      });
    });
  });

  describe("getLogs", () => {
    it("calls get_routine_logs with routineId and no limit when omitted", async () => {
      mockInvoke.mockResolvedValueOnce([mockLog]);
      await routinesApi.getLogs(1);
      expect(mockInvoke).toHaveBeenCalledWith("get_routine_logs", {
        routineId: 1,
        limit: undefined,
      });
    });

    it("calls get_routine_logs with routineId and the provided limit", async () => {
      mockInvoke.mockResolvedValueOnce([mockLog]);
      await routinesApi.getLogs(1, 20);
      expect(mockInvoke).toHaveBeenCalledWith("get_routine_logs", {
        routineId: 1,
        limit: 20,
      });
    });
  });
});
