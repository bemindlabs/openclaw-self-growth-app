import { invoke } from "@tauri-apps/api/core";

export interface Routine {
  id: number;
  name: string;
  description: string | null;
  frequency: string;
  is_active: boolean;
  created_at: string;
}

export interface RoutineStep {
  id: number;
  routine_id: number;
  title: string;
  duration_min: number | null;
  sort_order: number;
}

export interface RoutineLog {
  id: number;
  routine_id: number;
  completed_at: string;
  notes: string | null;
  mood_rating: number | null;
}

export const routinesApi = {
  list: () => invoke<Routine[]>("list_routines"),
  create: (data: { name: string; description?: string; frequency?: string }) =>
    invoke<Routine>("create_routine", { data }),
  update: (id: number, fields: Partial<Pick<Routine, "name" | "description" | "frequency" | "is_active">>) =>
    invoke<Routine>("update_routine", { id, ...fields }),
  delete: (id: number) => invoke<void>("delete_routine", { id }),
  getSteps: (routineId: number) => invoke<RoutineStep[]>("get_routine_steps", { routineId }),
  addStep: (data: { routine_id: number; title: string; duration_min?: number; sort_order: number }) =>
    invoke<RoutineStep>("add_routine_step", { data }),
  deleteStep: (id: number) => invoke<void>("delete_routine_step", { id }),
  complete: (routineId: number, notes?: string, moodRating?: number) =>
    invoke<RoutineLog>("complete_routine", { routineId, notes, moodRating }),
  getLogs: (routineId: number, limit?: number) =>
    invoke<RoutineLog[]>("get_routine_logs", { routineId, limit }),
};
