import { describe, it, expect, beforeEach, vi } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import { checkupsApi, type HealthCheckup } from "./checkups";

const mockInvoke = vi.mocked(invoke);

const mockCheckup: HealthCheckup = {
  id: 1,
  title: "Annual Physical",
  checkup_date: "2024-06-01",
  provider: "Dr. Smith",
  category: "general",
  results: "All clear",
  notes: "Follow up in 6 months",
  created_at: "2024-06-01T00:00:00",
};

describe("checkupsApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("calls list_health_checkups with undefined when no category given", async () => {
      mockInvoke.mockResolvedValueOnce([mockCheckup]);
      await checkupsApi.list();
      expect(mockInvoke).toHaveBeenCalledWith("list_health_checkups", {
        category: undefined,
      });
    });

    it("calls list_health_checkups with the provided category", async () => {
      mockInvoke.mockResolvedValueOnce([mockCheckup]);
      await checkupsApi.list("general");
      expect(mockInvoke).toHaveBeenCalledWith("list_health_checkups", {
        category: "general",
      });
    });
  });

  describe("create", () => {
    it("calls create_health_checkup with the wrapped data object", async () => {
      mockInvoke.mockResolvedValueOnce(mockCheckup);
      const data = {
        title: "Annual Physical",
        checkup_date: "2024-06-01",
        provider: "Dr. Smith",
        category: "general",
        results: "All clear",
        notes: "Follow up in 6 months",
      };
      await checkupsApi.create(data);
      expect(mockInvoke).toHaveBeenCalledWith("create_health_checkup", {
        data,
      });
    });

    it("calls create_health_checkup with only the required fields", async () => {
      mockInvoke.mockResolvedValueOnce(mockCheckup);
      await checkupsApi.create({ title: "Blood test", results: "Normal" });
      expect(mockInvoke).toHaveBeenCalledWith("create_health_checkup", {
        data: { title: "Blood test", results: "Normal" },
      });
    });
  });

  describe("update", () => {
    it("calls update_health_checkup with id and spread fields", async () => {
      mockInvoke.mockResolvedValueOnce(mockCheckup);
      await checkupsApi.update(1, { title: "Updated checkup", notes: "New notes" });
      expect(mockInvoke).toHaveBeenCalledWith("update_health_checkup", {
        id: 1,
        title: "Updated checkup",
        notes: "New notes",
      });
    });

    it("calls update_health_checkup with only the id when fields object is empty", async () => {
      mockInvoke.mockResolvedValueOnce(mockCheckup);
      await checkupsApi.update(3, {});
      expect(mockInvoke).toHaveBeenCalledWith("update_health_checkup", {
        id: 3,
      });
    });
  });

  describe("delete", () => {
    it("calls delete_health_checkup with the provided id", async () => {
      mockInvoke.mockResolvedValueOnce(undefined);
      await checkupsApi.delete(5);
      expect(mockInvoke).toHaveBeenCalledWith("delete_health_checkup", {
        id: 5,
      });
    });
  });
});
