import { invoke } from "@tauri-apps/api/core";

export interface Skill {
  id: number;
  name: string;
  category: string;
  target_level: number;
  current_level: number;
  created_at: string;
  updated_at: string;
}

export const skillsApi = {
  list: () => invoke<Skill[]>("list_skills"),
  create: (data: { name: string; category?: string; target_level?: number }) =>
    invoke<Skill>("create_skill", { data }),
  update: (id: number, fields: Partial<Pick<Skill, "name" | "category" | "target_level" | "current_level">>) =>
    invoke<Skill>("update_skill", { id, ...fields }),
  delete: (id: number) => invoke<void>("delete_skill", { id }),
};
