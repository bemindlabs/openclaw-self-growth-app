import { invoke } from "@tauri-apps/api/core";

export interface JournalEntry {
  id: number;
  title: string | null;
  content: string;
  mood_rating: number | null;
  created_at: string;
  updated_at: string;
}

export const journalApi = {
  list: (limit?: number) =>
    invoke<JournalEntry[]>("list_journal_entries", { limit }),
  create: (data: { title?: string; content: string; mood_rating?: number }) =>
    invoke<JournalEntry>("create_journal_entry", { data }),
  update: (id: number, fields: Partial<Pick<JournalEntry, "title" | "content" | "mood_rating">>) =>
    invoke<JournalEntry>("update_journal_entry", { id, ...fields }),
  delete: (id: number) => invoke<void>("delete_journal_entry", { id }),
};
