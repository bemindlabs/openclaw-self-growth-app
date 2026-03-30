import { describe, it, expect, beforeEach, vi } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import { skillsApi, type Skill } from "./skills";

const mockInvoke = vi.mocked(invoke);

const mockSkill: Skill = {
  id: 1,
  name: "TypeScript",
  category: "programming",
  target_level: 9,
  current_level: 6,
  created_at: "2024-06-01T00:00:00",
  updated_at: "2024-06-01T00:00:00",
};

describe("skillsApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("calls list_skills with no arguments", async () => {
      mockInvoke.mockResolvedValueOnce([mockSkill]);
      await skillsApi.list();
      expect(mockInvoke).toHaveBeenCalledWith("list_skills");
    });
  });

  describe("create", () => {
    it("calls create_skill with the wrapped data object", async () => {
      mockInvoke.mockResolvedValueOnce(mockSkill);
      const data = {
        name: "TypeScript",
        category: "programming",
        target_level: 9,
      };
      await skillsApi.create(data);
      expect(mockInvoke).toHaveBeenCalledWith("create_skill", { data });
    });

    it("calls create_skill with only the required name", async () => {
      mockInvoke.mockResolvedValueOnce(mockSkill);
      await skillsApi.create({ name: "Rust" });
      expect(mockInvoke).toHaveBeenCalledWith("create_skill", {
        data: { name: "Rust" },
      });
    });
  });

  describe("update", () => {
    it("calls update_skill with id and spread fields", async () => {
      mockInvoke.mockResolvedValueOnce(mockSkill);
      await skillsApi.update(1, { name: "Updated Skill", current_level: 7 });
      expect(mockInvoke).toHaveBeenCalledWith("update_skill", {
        id: 1,
        name: "Updated Skill",
        current_level: 7,
      });
    });

    it("calls update_skill with only the id when fields object is empty", async () => {
      mockInvoke.mockResolvedValueOnce(mockSkill);
      await skillsApi.update(2, {});
      expect(mockInvoke).toHaveBeenCalledWith("update_skill", { id: 2 });
    });
  });

  describe("delete", () => {
    it("calls delete_skill with the provided id", async () => {
      mockInvoke.mockResolvedValueOnce(undefined);
      await skillsApi.delete(3);
      expect(mockInvoke).toHaveBeenCalledWith("delete_skill", { id: 3 });
    });
  });
});
