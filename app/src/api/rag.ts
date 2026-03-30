import { invoke } from "@tauri-apps/api/core";

export interface SearchResult {
  source_table: string;
  source_id: number;
  title: string;
  description: string | null;
  score: number;
}

export const ragApi = {
  search: (query: string, limit?: number) =>
    invoke<SearchResult[]>("semantic_search", { query, limit }),
  rebuildEmbeddings: () => invoke<number>("rebuild_embeddings"),
};
