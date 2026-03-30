import { invoke } from "@tauri-apps/api/core";

export interface HealthCheckup {
  id: number;
  title: string;
  checkup_date: string;
  provider: string | null;
  category: string;
  results: string;
  notes: string | null;
  created_at: string;
}

export const checkupsApi = {
  list: (category?: string) =>
    invoke<HealthCheckup[]>("list_health_checkups", { category }),
  create: (data: {
    title: string;
    checkup_date?: string;
    provider?: string;
    category?: string;
    results: string;
    notes?: string;
  }) => invoke<HealthCheckup>("create_health_checkup", { data }),
  update: (id: number, fields: Partial<Pick<HealthCheckup, "title" | "checkup_date" | "provider" | "category" | "results" | "notes">>) =>
    invoke<HealthCheckup>("update_health_checkup", { id, ...fields }),
  delete: (id: number) => invoke<void>("delete_health_checkup", { id }),
};
