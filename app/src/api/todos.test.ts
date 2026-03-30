import { describe, it, expect, beforeEach, vi } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import { todosApi, type Todo } from "./todos";

const mockInvoke = vi.mocked(invoke);

const mockTodo: Todo = {
  id: 1,
  title: "Write tests",
  description: "Add unit tests for the API layer",
  due_date: "2024-06-20",
  due_time: "09:00",
  priority: "high",
  status: "pending",
  category: "work",
  goal_id: 3,
  completed_at: null,
  created_at: "2024-06-01T00:00:00",
  updated_at: "2024-06-01T00:00:00",
};

describe("todosApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("calls list_todos with all undefined when no args given", async () => {
      mockInvoke.mockResolvedValueOnce([mockTodo]);
      await todosApi.list();
      expect(mockInvoke).toHaveBeenCalledWith("list_todos", {
        status: undefined,
        priority: undefined,
        days: undefined,
      });
    });

    it("calls list_todos with the provided filters", async () => {
      mockInvoke.mockResolvedValueOnce([mockTodo]);
      await todosApi.list("pending", "high", 7);
      expect(mockInvoke).toHaveBeenCalledWith("list_todos", {
        status: "pending",
        priority: "high",
        days: 7,
      });
    });
  });

  describe("create", () => {
    it("calls create_todo with the wrapped data object", async () => {
      mockInvoke.mockResolvedValueOnce(mockTodo);
      const data = {
        title: "Write tests",
        description: "Unit tests",
        due_date: "2024-06-20",
        due_time: "09:00",
        priority: "high",
        category: "work",
        goal_id: 3,
      };
      await todosApi.create(data);
      expect(mockInvoke).toHaveBeenCalledWith("create_todo", { data });
    });

    it("calls create_todo with only the required title", async () => {
      mockInvoke.mockResolvedValueOnce(mockTodo);
      await todosApi.create({ title: "Minimal todo" });
      expect(mockInvoke).toHaveBeenCalledWith("create_todo", {
        data: { title: "Minimal todo" },
      });
    });
  });

  describe("update", () => {
    it("calls update_todo with id and spread fields", async () => {
      mockInvoke.mockResolvedValueOnce(mockTodo);
      await todosApi.update(1, { title: "Updated", status: "done" });
      expect(mockInvoke).toHaveBeenCalledWith("update_todo", {
        id: 1,
        title: "Updated",
        status: "done",
      });
    });

    it("calls update_todo with only the id when fields object is empty", async () => {
      mockInvoke.mockResolvedValueOnce(mockTodo);
      await todosApi.update(5, {});
      expect(mockInvoke).toHaveBeenCalledWith("update_todo", { id: 5 });
    });
  });

  describe("delete", () => {
    it("calls delete_todo with the provided id", async () => {
      mockInvoke.mockResolvedValueOnce(undefined);
      await todosApi.delete(9);
      expect(mockInvoke).toHaveBeenCalledWith("delete_todo", { id: 9 });
    });
  });

  describe("complete", () => {
    it("calls complete_todo with the provided id", async () => {
      mockInvoke.mockResolvedValueOnce({ ...mockTodo, status: "done" });
      await todosApi.complete(1);
      expect(mockInvoke).toHaveBeenCalledWith("complete_todo", { id: 1 });
    });
  });

  describe("getOverdue", () => {
    it("calls get_overdue_todos with no arguments", async () => {
      mockInvoke.mockResolvedValueOnce([mockTodo]);
      await todosApi.getOverdue();
      expect(mockInvoke).toHaveBeenCalledWith("get_overdue_todos");
    });
  });

  describe("getToday", () => {
    it("calls get_today_todos with no arguments", async () => {
      mockInvoke.mockResolvedValueOnce([mockTodo]);
      await todosApi.getToday();
      expect(mockInvoke).toHaveBeenCalledWith("get_today_todos");
    });
  });
});
