import { invoke } from "@tauri-apps/api/core";

export interface ChatConversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageRecord {
  id: number;
  conversation_id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export const chatApi = {
  listConversations: () =>
    invoke<ChatConversation[]>("list_conversations"),
  createConversation: (title?: string) =>
    invoke<ChatConversation>("create_conversation", { title }),
  renameConversation: (id: number, title: string) =>
    invoke<void>("rename_conversation", { id, title }),
  deleteConversation: (id: number) =>
    invoke<void>("delete_conversation", { id }),
  getMessages: (conversationId: number) =>
    invoke<ChatMessageRecord[]>("get_conversation_messages", { conversationId }),
  saveMessage: (conversationId: number, role: string, content: string) =>
    invoke<ChatMessageRecord>("save_chat_message", { conversationId, role, content }),
};
