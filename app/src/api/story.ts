import { invoke } from "@tauri-apps/api/core";

export interface GenerateStoryInput {
  prompt?: string;
  tone?: string;
  max_tokens?: number;
}

export interface StoryGenerationResult {
  story: string;
  model: string;
  provider: string;
  context_summary: string[];
}

export interface Story {
  id: number;
  prompt: string;
  tone: string;
  story: string;
  model: string | null;
  provider: string | null;
  context_summary: string | null;
  created_at: string;
}

export const storyApi = {
  generate: (input: GenerateStoryInput) =>
    invoke<StoryGenerationResult>("generate_story", { input }),
  save: (data: { prompt: string; tone: string; story: string; model?: string; provider?: string; context_summary?: string }) =>
    invoke<Story>("save_story", { data }),
  list: () => invoke<Story[]>("list_stories"),
  delete: (id: number) => invoke<void>("delete_story", { id }),
};
