import { invoke } from "@tauri-apps/api/core";

export interface LedgerEntry {
  id: number;
  title: string;
  amount: number;
  currency: string;
  entry_type: string;
  category: string;
  description: string | null;
  entry_date: string;
  created_at: string;
}

export interface LedgerSummary {
  total_income: number;
  total_expense: number;
  balance: number;
  currency: string;
  by_category: [string, number][];
}

export const ledgerApi = {
  list: (category?: string, limit?: number) =>
    invoke<LedgerEntry[]>("list_ledger_entries", { category, limit }),
  create: (data: {
    title: string;
    amount: number;
    currency?: string;
    entry_type?: string;
    category?: string;
    description?: string;
    entry_date?: string;
  }) => invoke<LedgerEntry>("create_ledger_entry", { data }),
  update: (id: number, fields: Partial<Pick<LedgerEntry, "title" | "amount" | "currency" | "entry_type" | "category" | "description" | "entry_date">>) =>
    invoke<LedgerEntry>("update_ledger_entry", { id, ...fields }),
  delete: (id: number) => invoke<void>("delete_ledger_entry", { id }),
  summary: (period?: "week" | "month" | "year") =>
    invoke<LedgerSummary>("get_ledger_summary", { period }),
};
