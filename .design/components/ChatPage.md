# ChatPage Component

**Path**: `app/src/pages/Chat.tsx`
**Status**: Implemented with conversation persistence

## Overview

Full-screen chat interface with AI coach. Includes a collapsible conversation history sidebar and persistent message storage.

## Layout

```
┌──────────┬──────────────────────────────────────┐
│ History  │  Header (Bot icon + title + Clear)    │
│──────────│──────────────────────────────────────│
│ [+ New]  │                                      │
│ Chat 1 ◀│  Message Bubbles                     │
│ Chat 2   │    [Bot]  assistant message           │
│ Chat 3   │           user message  [User]        │
│          │    [Bot]  assistant message           │
│          │                                      │
│          │──────────────────────────────────────│
│          │  [Input field]              [Send]    │
└──────────┴──────────────────────────────────────┘
```

## Variants & States

| State | Description |
|-------|-------------|
| Empty | Bot icon + "Start a conversation" placeholder |
| Active | Message list with user/assistant bubbles |
| Loading | Bouncing dots animation in bot bubble |
| Error | Red error banner below messages |
| Sidebar open | 256px sidebar with conversation list |
| Sidebar closed | Full-width chat area with toggle button |
| Editing title | Inline input replaces conversation title in sidebar |

## Props / API

Self-contained page component — no external props. Uses:
- `aiApi.chat()` — sends messages to LLM
- `chatApi.*` — CRUD for conversations and messages

## Design Tokens Used

| Token | Usage |
|-------|-------|
| `primary` | Bot icon bg, user message bubble, active conversation |
| `primary-foreground` | User message text |
| `card` | Header bg, assistant bubble bg, input area bg |
| `border` | Dividers, assistant bubble border, input border |
| `secondary` | User avatar bg, sidebar hover, input bg |
| `muted-foreground` | Timestamps, metadata, placeholder text |
| `destructive` | Error banner, delete button |
| `radius-lg` | Chat bubbles (rounded-lg) |
| `radius-md` | Input field, send button |

## Accessibility

- Enter key submits message (Shift+Enter for newline in future)
- Send button disabled when input empty or loading
- Loading state visible with animation
- Inline rename supports Enter to confirm, Escape to cancel
- Delete and rename buttons appear on hover for sidebar items

## Responsive

- Sidebar toggles via PanelLeft/PanelLeftClose buttons
- Message bubbles max-width 80% of container
- Full height layout using flex column
