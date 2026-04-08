import { invoke } from "@tauri-apps/api/core";

export interface MoodHabitCorrelation {
  habit_name: string;
  habit_color: string;
  avg_mood_with: number;
  avg_mood_without: number;
  diff: number;
  sample_days: number;
}

export interface LifeBalanceDomain {
  domain: string;
  score: number;
}

export interface ProgressEntry {
  id: number;
  skill_id: number | null;
  learning_item_id: number | null;
  entry_type: string;
  value: number | null;
  notes: string | null;
  created_at: string;
}

export interface DashboardStats {
  total_skills: number;
  total_learning_items: number;
  active_routines: number;
  active_goals: number;
  completions_today: number;
  current_streak: number;
}

export const progressApi = {
  list: (skillId?: number, limit?: number) =>
    invoke<ProgressEntry[]>("list_progress", { skillId, limit }),
  create: (data: {
    skill_id?: number;
    learning_item_id?: number;
    entry_type: string;
    value?: number;
    notes?: string;
  }) => invoke<ProgressEntry>("create_progress_entry", { data }),
  getDashboardStats: () => invoke<DashboardStats>("get_dashboard_stats"),
  getLifeBalance: () => invoke<LifeBalanceDomain[]>("get_life_balance"),
  getMoodHabitCorrelation: () =>
    invoke<MoodHabitCorrelation[]>("get_mood_habit_correlation"),
};
