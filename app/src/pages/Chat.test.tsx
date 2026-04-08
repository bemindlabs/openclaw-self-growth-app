import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { invoke } from "@tauri-apps/api/core";
import ChatPage from "./Chat";

vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

const mockInvoke = vi.mocked(invoke);

vi.mock("react-markdown", () => ({
  default: ({ children }: { children: string }) => <div>{children}</div>,
}));

describe("ChatPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: return [] for list_conversations and undefined for everything else
    mockInvoke.mockResolvedValue([]);
    // jsdom doesn't implement scrollTo
    Element.prototype.scrollTo = vi.fn();
  });

  it("renders chat header", () => {
    render(<ChatPage />);
    expect(screen.getByText("Chat with AI")).toBeTruthy();
    expect(screen.getByText("Powered by BemindAI")).toBeTruthy();
  });

  it("shows empty state initially", () => {
    render(<ChatPage />);
    expect(screen.getByText("Start a conversation")).toBeTruthy();
  });

  it("renders input and send button", () => {
    render(<ChatPage />);
    expect(screen.getByPlaceholderText("Type a message...")).toBeTruthy();
  });

  it("sends a message and displays response", async () => {
    // On mount: list_conversations -> [] (default)
    // On send: create_conversation, save_chat_message (user), ai_chat, save_chat_message (assistant), list_conversations
    mockInvoke
      .mockResolvedValueOnce([])                                                  // mount: list_conversations
      .mockResolvedValueOnce({ id: 1, title: "Hello", created_at: "", updated_at: "" }) // create_conversation
      .mockResolvedValueOnce({})                                                  // save_chat_message (user)
      .mockResolvedValueOnce({ content: "Hello! I'm your AI coach.", model: "test" }) // ai_chat
      .mockResolvedValueOnce({})                                                  // save_chat_message (assistant)
      .mockResolvedValueOnce([]);                                                 // list_conversations refresh

    render(<ChatPage />);
    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "Hello" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByText("Hello")).toBeTruthy();
      expect(screen.getByText("Hello! I'm your AI coach.")).toBeTruthy();
    });
  });

  it("shows Clear button after messages", async () => {
    // On mount: list_conversations -> [] (default)
    // On send: create_conversation, save_chat_message (user), ai_chat, save_chat_message (assistant), list_conversations
    mockInvoke
      .mockResolvedValueOnce([])                                                  // mount: list_conversations
      .mockResolvedValueOnce({ id: 1, title: "Hi", created_at: "", updated_at: "" }) // create_conversation
      .mockResolvedValueOnce({})                                                  // save_chat_message (user)
      .mockResolvedValueOnce({ content: "Hi!", model: "test" })                  // ai_chat
      .mockResolvedValueOnce({})                                                  // save_chat_message (assistant)
      .mockResolvedValueOnce([]);                                                 // list_conversations refresh

    render(<ChatPage />);
    fireEvent.change(screen.getByPlaceholderText("Type a message..."), { target: { value: "Hi" } });
    fireEvent.keyDown(screen.getByPlaceholderText("Type a message..."), { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByText("Clear")).toBeTruthy();
    });
  });
});
