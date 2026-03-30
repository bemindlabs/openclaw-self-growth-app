import { describe, it, expect, beforeEach, vi } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import { ragApi, type SearchResult } from "./rag";

const mockInvoke = vi.mocked(invoke);

const mockResult: SearchResult = {
  source_table: "skills",
  source_id: 1,
  title: "TypeScript",
  description: "Advanced TypeScript patterns",
  score: 0.92,
};

describe("ragApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("search", () => {
    it("calls semantic_search with query and undefined limit when omitted", async () => {
      mockInvoke.mockResolvedValueOnce([mockResult]);
      await ragApi.search("typescript");
      expect(mockInvoke).toHaveBeenCalledWith("semantic_search", {
        query: "typescript",
        limit: undefined,
      });
    });

    it("calls semantic_search with query and the provided limit", async () => {
      mockInvoke.mockResolvedValueOnce([mockResult]);
      await ragApi.search("typescript", 5);
      expect(mockInvoke).toHaveBeenCalledWith("semantic_search", {
        query: "typescript",
        limit: 5,
      });
    });
  });

  describe("rebuildEmbeddings", () => {
    it("calls rebuild_embeddings with no arguments", async () => {
      mockInvoke.mockResolvedValueOnce(150);
      await ragApi.rebuildEmbeddings();
      expect(mockInvoke).toHaveBeenCalledWith("rebuild_embeddings");
    });
  });
});
