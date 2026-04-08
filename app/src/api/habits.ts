import { invoke } from "@tauri-apps/api/core";

export interface Habit {
  id: number;
  name: string;
  description: string | null;
  frequency: string;
  color: string;
  is_active: boolean;
  created_at: string;
  identity_statement: string | null;
}

export interface HabitLog {
  id: number;
  habit_id: number;
  logged_date: string;
  notes: string | null;
  created_at: string;
}

export const habitsApi = {
  list: () => invoke<Habit[]>("list_habits"),
  create: (data: { name: string; description?: string; frequency?: string; color?: string; identity_statement?: string }) =>
    invoke<Habit>("create_habit", { data }),
  update: (id: number, fields: Partial<Pick<Habit, "name" | "description" | "frequency" | "color" | "is_active" | "identity_statement">>) =>
    invoke<Habit>("update_habit", { id, ...fields }),
  delete: (id: number) => invoke<void>("delete_habit", { id }),
  toggle: (habitId: number, date: string) =>
    invoke<boolean>("toggle_habit", { habitId, date }),
  getLogs: (habitId: number, days?: number) =>
    invoke<HabitLog[]>("get_habit_logs", { habitId, days }),
};
