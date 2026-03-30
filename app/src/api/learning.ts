import { invoke } from "@tauri-apps/api/core";

export interface LearningItem {
  id: number;
  title: string;
  description: string | null;
  item_type: string;
  source_url: string | null;
  status: string;
  skill_id: number | null;
  created_at: string;
  completed_at: string | null;
}

export const learningApi = {
  list: (status?: string) => invoke<LearningItem[]>("list_learning_items", { status }),
  create: (data: {
    title: string;
    description?: string;
    item_type: string;
    source_url?: string;
    skill_id?: number;
  }) => invoke<LearningItem>("create_learning_item", { data }),
  update: (
    id: number,
    fields: Partial<Pick<LearningItem, "title" | "description" | "status" | "source_url" | "skill_id">>
  ) => invoke<LearningItem>("update_learning_item", { id, ...fields }),
  delete: (id: number) => invoke<void>("delete_learning_item", { id }),
};
