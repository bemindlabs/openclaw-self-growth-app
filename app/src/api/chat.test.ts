import { describe, it, expect, beforeEach, vi } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import { chatApi, type ChatConversation, type ChatMessageRecord } from "./chat";

const mockInvoke = vi.mocked(invoke);

const mockConversation: ChatConversation = {
  id: 1,
  title: "Morning reflection",
  created_at: "2024-06-15T08:00:00",
  updated_at: "2024-06-15T08:30:00",
};

const mockMessage: ChatMessageRecord = {
  id: 10,
  conversation_id: 1,
  role: "user",
  content: "How can I improve my morning routine?",
  created_at: "2024-06-15T08:05:00",
};

describe("chatApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listConversations", () => {
    it("calls list_conversations with no arguments", async () => {
      mockInvoke.mockResolvedValueOnce([mockConversation]);
      await chatApi.listConversations();
      expect(mockInvoke).toHaveBeenCalledOnce();
      expect(mockInvoke).toHaveBeenCalledWith("list_conversations");
    });

    it("returns the list of conversations from invoke", async () => {
      mockInvoke.mockResolvedValueOnce([mockConversation]);
      const result = await chatApi.listConversations();
      expect(result).toEqual([mockConversation]);
    });
  });

  describe("createConversation", () => {
    it("calls create_conversation with the provided title", async () => {
      mockInvoke.mockResolvedValueOnce(mockConversation);
      await chatApi.createConversation("Morning reflection");
      expect(mockInvoke).toHaveBeenCalledWith("create_conversation", {
        title: "Morning reflection",
      });
    });

    it("calls create_conversation with undefined when title is omitted", async () => {
      mockInvoke.mockResolvedValueOnce(mockConversation);
      await chatApi.createConversation();
      expect(mockInvoke).toHaveBeenCalledWith("create_conversation", {
        title: undefined,
      });
    });

    it("returns the created conversation from invoke", async () => {
      mockInvoke.mockResolvedValueOnce(mockConversation);
      const result = await chatApi.createConversation("Morning reflection");
      expect(result).toEqual(mockConversation);
    });
  });

  describe("renameConversation", () => {
    it("calls rename_conversation with id and title", async () => {
      mockInvoke.mockResolvedValueOnce(undefined);
      await chatApi.renameConversation(1, "Evening review");
      expect(mockInvoke).toHaveBeenCalledWith("rename_conversation", {
        id: 1,
        title: "Evening review",
      });
    });
  });

  describe("deleteConversation", () => {
    it("calls delete_conversation with the provided id", async () => {
      mockInvoke.mockResolvedValueOnce(undefined);
      await chatApi.deleteConversation(3);
      expect(mockInvoke).toHaveBeenCalledWith("delete_conversation", { id: 3 });
    });
  });

  describe("getMessages", () => {
    it("calls get_conversation_messages with the provided conversationId", async () => {
      mockInvoke.mockResolvedValueOnce([mockMessage]);
      await chatApi.getMessages(1);
      expect(mockInvoke).toHaveBeenCalledWith("get_conversation_messages", {
        conversationId: 1,
      });
    });

    it("returns the list of messages from invoke", async () => {
      mockInvoke.mockResolvedValueOnce([mockMessage]);
      const result = await chatApi.getMessages(1);
      expect(result).toEqual([mockMessage]);
    });
  });

  describe("saveMessage", () => {
    it("calls save_chat_message with conversationId, role, and content", async () => {
      mockInvoke.mockResolvedValueOnce(mockMessage);
      await chatApi.saveMessage(1, "user", "How can I improve my morning routine?");
      expect(mockInvoke).toHaveBeenCalledWith("save_chat_message", {
        conversationId: 1,
        role: "user",
        content: "How can I improve my morning routine?",
      });
    });

    it("calls save_chat_message with assistant role", async () => {
      const assistantMessage: ChatMessageRecord = {
        ...mockMessage,
        id: 11,
        role: "assistant",
        content: "Start with a consistent wake-up time.",
      };
      mockInvoke.mockResolvedValueOnce(assistantMessage);
      await chatApi.saveMessage(1, "assistant", "Start with a consistent wake-up time.");
      expect(mockInvoke).toHaveBeenCalledWith("save_chat_message", {
        conversationId: 1,
        role: "assistant",
        content: "Start with a consistent wake-up time.",
      });
    });

    it("returns the saved message record from invoke", async () => {
      mockInvoke.mockResolvedValueOnce(mockMessage);
      const result = await chatApi.saveMessage(
        1,
        "user",
        "How can I improve my morning routine?"
      );
      expect(result).toEqual(mockMessage);
    });
  });
});
