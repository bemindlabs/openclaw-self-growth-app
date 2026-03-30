import { invoke } from "@tauri-apps/api/core";

export interface HealthMetric {
  id: number;
  source: string;
  metric_type: string;
  value: number;
  unit: string;
  recorded_at: string;
  end_at: string | null;
  metadata: string | null;
  created_at: string;
}

export interface HealthSummary {
  metric_type: string;
  latest_value: number;
  unit: string;
  avg_7d: number | null;
  avg_30d: number | null;
  trend: string;
}

export interface HealthSync {
  id: number;
  source: string;
  sync_type: string;
  records_added: number;
  records_updated: number;
  started_at: string;
  completed_at: string | null;
  status: string;
  error_message: string | null;
}

export const healthApi = {
  importAppleHealth: (filePath: string) =>
    invoke<HealthSync>("import_apple_health", { filePath }),
  startGoogleFitAuth: () =>
    invoke<string>("start_google_fit_auth"),
  completeGoogleFitAuth: (authCode: string) =>
    invoke<void>("complete_google_fit_auth", { authCode }),
  syncGoogleFit: (daysBack?: number) =>
    invoke<HealthSync>("sync_google_fit", { daysBack }),
  listMetrics: (metricType?: string, days?: number, source?: string) =>
    invoke<HealthMetric[]>("list_health_metrics", { metricType, days, source }),
  getSummary: () =>
    invoke<HealthSummary[]>("get_health_summary"),
  listSyncs: () =>
    invoke<HealthSync[]>("list_health_syncs"),
  deleteData: (source?: string) =>
    invoke<number>("delete_health_data", { source }),
};
