import { invoke } from "@tauri-apps/api/core";

export interface Goal {
  id: number;
  title: string;
  description: string | null;
  skill_id: number | null;
  target_date: string | null;
  status: string;
  created_at: string;
}

export const goalsApi = {
  list: (status?: string) => invoke<Goal[]>("list_goals", { status }),
  create: (data: {
    title: string;
    description?: string;
    skill_id?: number;
    target_date?: string;
  }) => invoke<Goal>("create_goal", { data }),
  update: (
    id: number,
    fields: Partial<Pick<Goal, "title" | "description" | "status" | "target_date" | "skill_id">>
  ) => invoke<Goal>("update_goal", { id, ...fields }),
  delete: (id: number) => invoke<void>("delete_goal", { id }),
};
