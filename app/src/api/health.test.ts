import { describe, it, expect, beforeEach, vi } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import {
  healthApi,
  type HealthMetric,
  type HealthSummary,
  type HealthSync,
} from "./health";

const mockInvoke = vi.mocked(invoke);

const mockMetric: HealthMetric = {
  id: 1,
  source: "apple_health",
  metric_type: "steps",
  value: 8500,
  unit: "count",
  recorded_at: "2024-06-15T10:00:00",
  end_at: null,
  metadata: null,
  created_at: "2024-06-15T10:00:00",
};

const mockSummary: HealthSummary = {
  metric_type: "steps",
  latest_value: 8500,
  unit: "count",
  avg_7d: 7800,
  avg_30d: 7200,
  trend: "up",
};

const mockSync: HealthSync = {
  id: 1,
  source: "apple_health",
  sync_type: "import",
  records_added: 120,
  records_updated: 5,
  started_at: "2024-06-15T10:00:00",
  completed_at: "2024-06-15T10:01:00",
  status: "completed",
  error_message: null,
};

describe("healthApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("importAppleHealth", () => {
    it("calls import_apple_health with the file path", async () => {
      mockInvoke.mockResolvedValueOnce(mockSync);
      await healthApi.importAppleHealth("/path/to/export.xml");
      expect(mockInvoke).toHaveBeenCalledWith("import_apple_health", {
        filePath: "/path/to/export.xml",
      });
    });
  });

  describe("startGoogleFitAuth", () => {
    it("calls start_google_fit_auth with no arguments", async () => {
      mockInvoke.mockResolvedValueOnce("https://accounts.google.com/auth");
      await healthApi.startGoogleFitAuth();
      expect(mockInvoke).toHaveBeenCalledWith("start_google_fit_auth");
    });
  });

  describe("completeGoogleFitAuth", () => {
    it("calls complete_google_fit_auth with the auth code", async () => {
      mockInvoke.mockResolvedValueOnce(undefined);
      await healthApi.completeGoogleFitAuth("auth-code-123");
      expect(mockInvoke).toHaveBeenCalledWith("complete_google_fit_auth", {
        authCode: "auth-code-123",
      });
    });
  });

  describe("syncGoogleFit", () => {
    it("calls sync_google_fit with undefined when no daysBack given", async () => {
      mockInvoke.mockResolvedValueOnce(mockSync);
      await healthApi.syncGoogleFit();
      expect(mockInvoke).toHaveBeenCalledWith("sync_google_fit", {
        daysBack: undefined,
      });
    });

    it("calls sync_google_fit with the provided daysBack", async () => {
      mockInvoke.mockResolvedValueOnce(mockSync);
      await healthApi.syncGoogleFit(30);
      expect(mockInvoke).toHaveBeenCalledWith("sync_google_fit", {
        daysBack: 30,
      });
    });
  });

  describe("listMetrics", () => {
    it("calls list_health_metrics with all undefined when no args given", async () => {
      mockInvoke.mockResolvedValueOnce([mockMetric]);
      await healthApi.listMetrics();
      expect(mockInvoke).toHaveBeenCalledWith("list_health_metrics", {
        metricType: undefined,
        days: undefined,
        source: undefined,
      });
    });

    it("calls list_health_metrics with the provided filters", async () => {
      mockInvoke.mockResolvedValueOnce([mockMetric]);
      await healthApi.listMetrics("steps", 7, "apple_health");
      expect(mockInvoke).toHaveBeenCalledWith("list_health_metrics", {
        metricType: "steps",
        days: 7,
        source: "apple_health",
      });
    });
  });

  describe("getSummary", () => {
    it("calls get_health_summary with no arguments", async () => {
      mockInvoke.mockResolvedValueOnce([mockSummary]);
      await healthApi.getSummary();
      expect(mockInvoke).toHaveBeenCalledWith("get_health_summary");
    });
  });

  describe("listSyncs", () => {
    it("calls list_health_syncs with no arguments", async () => {
      mockInvoke.mockResolvedValueOnce([mockSync]);
      await healthApi.listSyncs();
      expect(mockInvoke).toHaveBeenCalledWith("list_health_syncs");
    });
  });

  describe("deleteData", () => {
    it("calls delete_health_data with undefined when no source given", async () => {
      mockInvoke.mockResolvedValueOnce(42);
      await healthApi.deleteData();
      expect(mockInvoke).toHaveBeenCalledWith("delete_health_data", {
        source: undefined,
      });
    });

    it("calls delete_health_data with the provided source", async () => {
      mockInvoke.mockResolvedValueOnce(10);
      await healthApi.deleteData("apple_health");
      expect(mockInvoke).toHaveBeenCalledWith("delete_health_data", {
        source: "apple_health",
      });
    });
  });
});
