import { invoke } from "@tauri-apps/api/core";

export interface AiResponse {
  content: string;
  model: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const aiApi = {
  coach: (question?: string) =>
    invoke<AiResponse>("ai_coach", { question }),
  insights: () =>
    invoke<AiResponse>("ai_insights"),
  summarize: (period?: "daily" | "weekly") =>
    invoke<AiResponse>("ai_summarize", { period }),
  chat: (messages: ChatMessage[]) =>
    invoke<AiResponse>("ai_chat", { messages }),
};
