import { invoke } from "@tauri-apps/api/core";

export interface Todo {
  id: number;
  title: string;
  description: string | null;
  due_date: string | null;
  due_time: string | null;
  priority: string;
  status: string;
  category: string | null;
  goal_id: number | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const todosApi = {
  list: (status?: string, priority?: string, days?: number) =>
    invoke<Todo[]>("list_todos", { status, priority, days }),
  create: (data: {
    title: string;
    description?: string;
    due_date?: string;
    due_time?: string;
    priority?: string;
    category?: string;
    goal_id?: number;
  }) => invoke<Todo>("create_todo", { data }),
  update: (
    id: number,
    fields: Partial<
      Pick<
        Todo,
        | "title"
        | "description"
        | "due_date"
        | "due_time"
        | "priority"
        | "status"
        | "category"
        | "goal_id"
      >
    >
  ) => invoke<Todo>("update_todo", { id, ...fields }),
  delete: (id: number) => invoke<void>("delete_todo", { id }),
  complete: (id: number) => invoke<Todo>("complete_todo", { id }),
  getOverdue: () => invoke<Todo[]>("get_overdue_todos"),
  getToday: () => invoke<Todo[]>("get_today_todos"),
};
