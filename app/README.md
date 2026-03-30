# Self Growth

Self-development tracking desktop app with AI-powered coaching, insights, and semantic search.

## Tech Stack

- **Frontend**: React 19, Tailwind CSS 4, React Router 7
- **Backend**: Rust (Tauri v2), SQLite (rusqlite)
- **Embeddings**: fastembed (AllMiniLM-L6-v2, local on desktop)
- **LLM**: Any `/v1/chat/completions` compatible endpoint (e.g. OpenClaw Gateway)

## Features

| Feature | Description |
|---------|-------------|
| Dashboard | Stats overview with streak, completions, active routines/goals |
| Skills | Track skills with categories and levels |
| Routines | Daily/weekly routines with steps, completion logs, mood ratings |
| Learning | Track courses, books, articles with status |
| Goals | Goal setting with target dates and status |
| AI Coach | Ask questions, get personalized advice based on your data |
| AI Insights | Pattern analysis across skills, routines, goals |
| Weekly Summary | AI-generated progress narrative |
| AI Chat | Multi-turn conversational coaching |
| Stories | AI-generated inspirational stories from your context |
| Smart Search | Semantic search across all your data using vector embeddings |
| Settings | LLM endpoint config, connection test, reset |

## Architecture

```
Self Growth (Tauri Desktop App)
├── src/                    # React frontend
│   ├── pages/              # Dashboard, Skills, Routines, Learning, Chat, Search, Stories, Settings
│   ├── api/                # Tauri IPC wrappers (ai.ts, story.ts, rag.ts, etc.)
│   └── components/         # AppShell, Logo
├── src-tauri/
│   ├── src/
│   │   ├── commands/       # Tauri IPC command handlers
│   │   │   ├── ai.rs       # Coach, insights, summarize, chat (with embedded prompts)
│   │   │   ├── story.rs    # Story generation
│   │   │   ├── rag.rs      # Semantic search + rebuild embeddings
│   │   │   ├── settings.rs # Settings CRUD + connection test
│   │   │   ├── skills.rs   # Skills CRUD
│   │   │   ├── routines.rs # Routines CRUD + steps + logs
│   │   │   ├── learning.rs # Learning items CRUD
│   │   │   ├── goals.rs    # Goals CRUD
│   │   │   └── progress.rs # Progress entries + dashboard stats
│   │   ├── gateway.rs      # LLM client (chat completions, context formatting)
│   │   ├── db.rs           # SQLite init + migrations
│   │   ├── embedder.rs     # Local vector embeddings (fastembed)
│   │   ├── search.rs       # Cosine similarity
│   │   └── models.rs       # Shared data types
│   └── migrations/
│       └── 001_initial.sql # Database schema
└── package.json
```

## Getting Started

### Prerequisites

- [Rust](https://rustup.rs/)
- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/)
- An LLM endpoint (e.g. [OpenClaw](https://github.com/nicepkg/openclaw))

### Install

```bash
pnpm install
```

### Development

```bash
pnpm tauri dev
```

### Build

```bash
pnpm tauri build
```

### Configure LLM

In the app, go to **Settings** and configure:

| Setting | Example |
|---------|---------|
| Endpoint | `http://127.0.0.1:18789/v1` |
| Gateway Token | Your OpenClaw gateway token |
| Model | `openclaw/default` |

Click **Test Connection** to verify.

## Database

SQLite with WAL mode, stored at:

- **macOS**: `~/Library/Application Support/com.bemindlabs.growth.v2/bemind-growth.db`
- **Linux**: `~/.local/share/bemind-growth/bemind-growth.db`
- **Windows**: `%AppData%\BemindLabs\Self Growth\bemind-growth.db`

### Tables

| Table | Purpose |
|-------|---------|
| `skills` | Skills with category, current/target levels |
| `learning_items` | Courses, books, articles with status |
| `routines` | Daily/weekly routines |
| `routine_steps` | Ordered steps within routines |
| `routine_logs` | Completion logs with mood ratings |
| `progress_entries` | Progress data points |
| `goals` | Goals with target dates |
| `embeddings` | Vector embeddings for semantic search |
| `settings` | Key-value app configuration |

## RAG / Semantic Search

- **Desktop**: Local embeddings via `fastembed` (AllMiniLM-L6-v2)
- **Mobile**: Remote embeddings via LLM endpoint `/v1/embeddings`

Use **Rebuild Index** in the Search page to generate embeddings for all skills, learning items, and routines.
