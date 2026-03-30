import { describe, it, expect, beforeEach, vi } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import { aiApi, type AiResponse, type ChatMessage } from "./ai";

const mockInvoke = vi.mocked(invoke);

const mockResponse: AiResponse = {
  content: "Here is your coaching advice...",
  model: "gpt-4",
};

describe("aiApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("coach", () => {
    it("calls ai_coach with undefined when no question given", async () => {
      mockInvoke.mockResolvedValueOnce(mockResponse);
      await aiApi.coach();
      expect(mockInvoke).toHaveBeenCalledWith("ai_coach", {
        question: undefined,
      });
    });

    it("calls ai_coach with the provided question", async () => {
      mockInvoke.mockResolvedValueOnce(mockResponse);
      await aiApi.coach("How can I improve?");
      expect(mockInvoke).toHaveBeenCalledWith("ai_coach", {
        question: "How can I improve?",
      });
    });
  });

  describe("insights", () => {
    it("calls ai_insights with no arguments", async () => {
      mockInvoke.mockResolvedValueOnce(mockResponse);
      await aiApi.insights();
      expect(mockInvoke).toHaveBeenCalledWith("ai_insights");
    });
  });

  describe("summarize", () => {
    it("calls ai_summarize with undefined when no period given", async () => {
      mockInvoke.mockResolvedValueOnce(mockResponse);
      await aiApi.summarize();
      expect(mockInvoke).toHaveBeenCalledWith("ai_summarize", {
        period: undefined,
      });
    });

    it('calls ai_summarize with period "daily"', async () => {
      mockInvoke.mockResolvedValueOnce(mockResponse);
      await aiApi.summarize("daily");
      expect(mockInvoke).toHaveBeenCalledWith("ai_summarize", {
        period: "daily",
      });
    });

    it('calls ai_summarize with period "weekly"', async () => {
      mockInvoke.mockResolvedValueOnce(mockResponse);
      await aiApi.summarize("weekly");
      expect(mockInvoke).toHaveBeenCalledWith("ai_summarize", {
        period: "weekly",
      });
    });
  });

  describe("chat", () => {
    it("calls ai_chat with the provided messages", async () => {
      mockInvoke.mockResolvedValueOnce(mockResponse);
      const messages: ChatMessage[] = [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi there!" },
        { role: "user", content: "Help me with goals" },
      ];
      await aiApi.chat(messages);
      expect(mockInvoke).toHaveBeenCalledWith("ai_chat", { messages });
    });

    it("calls ai_chat with an empty messages array", async () => {
      mockInvoke.mockResolvedValueOnce(mockResponse);
      await aiApi.chat([]);
      expect(mockInvoke).toHaveBeenCalledWith("ai_chat", { messages: [] });
    });
  });
});
