import { describe, it, expect, beforeEach, vi } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import {
  storyApi,
  type Story,
  type StoryGenerationResult,
  type GenerateStoryInput,
} from "./story";

const mockInvoke = vi.mocked(invoke);

const mockGenerationResult: StoryGenerationResult = {
  story: "Once upon a time...",
  model: "gpt-4",
  provider: "openai",
  context_summary: ["goal: learn TypeScript", "skill: programming"],
};

const mockStory: Story = {
  id: 1,
  prompt: "Write about my journey",
  tone: "inspirational",
  story: "Once upon a time...",
  model: "gpt-4",
  provider: "openai",
  context_summary: "goal: learn TypeScript, skill: programming",
  created_at: "2024-06-15T00:00:00",
};

describe("storyApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generate", () => {
    it("calls generate_story with the provided input", async () => {
      mockInvoke.mockResolvedValueOnce(mockGenerationResult);
      const input: GenerateStoryInput = {
        prompt: "Write about my journey",
        tone: "inspirational",
        max_tokens: 500,
      };
      await storyApi.generate(input);
      expect(mockInvoke).toHaveBeenCalledWith("generate_story", { input });
    });

    it("calls generate_story with an empty input object", async () => {
      mockInvoke.mockResolvedValueOnce(mockGenerationResult);
      await storyApi.generate({});
      expect(mockInvoke).toHaveBeenCalledWith("generate_story", { input: {} });
    });
  });

  describe("save", () => {
    it("calls save_story with the wrapped data object", async () => {
      mockInvoke.mockResolvedValueOnce(mockStory);
      const data = {
        prompt: "Write about my journey",
        tone: "inspirational",
        story: "Once upon a time...",
        model: "gpt-4",
        provider: "openai",
        context_summary: "goal: learn TypeScript",
      };
      await storyApi.save(data);
      expect(mockInvoke).toHaveBeenCalledWith("save_story", { data });
    });

    it("calls save_story with only the required fields", async () => {
      mockInvoke.mockResolvedValueOnce(mockStory);
      const data = {
        prompt: "Quick story",
        tone: "casual",
        story: "A short tale...",
      };
      await storyApi.save(data);
      expect(mockInvoke).toHaveBeenCalledWith("save_story", { data });
    });
  });

  describe("list", () => {
    it("calls list_stories with no arguments", async () => {
      mockInvoke.mockResolvedValueOnce([mockStory]);
      await storyApi.list();
      expect(mockInvoke).toHaveBeenCalledWith("list_stories");
    });
  });

  describe("delete", () => {
    it("calls delete_story with the provided id", async () => {
      mockInvoke.mockResolvedValueOnce(undefined);
      await storyApi.delete(1);
      expect(mockInvoke).toHaveBeenCalledWith("delete_story", { id: 1 });
    });
  });
});
