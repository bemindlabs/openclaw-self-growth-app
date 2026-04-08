# Changelog

All notable changes to Self Growth will be documented in this file.

## [2026.4.8] - 2026-04-08

First public release.

### Added

- Dashboard with streaks, completion rates, and AI quick coach
- Daily habit tracking with color-coded streaks
- Goal setting with milestones and status tracking
- Routines with ordered steps and timer
- Todo management with priorities and due dates
- Reflective journaling with mood ratings
- Skills inventory with proficiency levels
- Learning resource tracker (courses, books, articles, videos)
- AI coaching chat with multi-turn conversations
- AI-generated progress stories
- Semantic search (RAG) with local embeddings (AllMiniLM-L6-v2)
- Apple Health XML import and Google Fit OAuth sync
- Health checkup tracking
- Financial ledger with OCR receipt scanning
- Database backup and restore
- Settings page with LLM endpoint configuration
- Onboarding guide (Get Started page)
- CI workflow (TypeScript, Vitest, Vite build, Cargo check, Clippy)
- Release workflow (quality gate, macOS build, GitHub release)
- Pre-commit hook (type check + tests)
- Pre-push hook (type check + tests + build + cargo check)
- Homebrew cask (`brew tap bemindlabs/self-growth`)

### Technical

- Tauri v2 with Rust backend and React 19 frontend
- SQLite database with WAL mode and 7 migrations
- Local vector embeddings via fastembed (desktop only)
- OpenClaw LLM gateway integration
- Calendar versioning (yyyy.m.d)
