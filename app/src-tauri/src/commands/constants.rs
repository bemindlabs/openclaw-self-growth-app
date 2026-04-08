// ---------------------------------------------------------------------------
// Centralized AI configuration constants
// ---------------------------------------------------------------------------
//
// All LLM parameters, system prompts, query limits, and search thresholds live
// here. Import what you need with `use crate::commands::constants::*;` or by
// naming specific items.

// ---------------------------------------------------------------------------
// LLM temperature
// ---------------------------------------------------------------------------

/// General coaching / chat — warm, conversational.
pub const TEMP_COACH: f64 = 0.7;

/// Analytical insights — lower temperature for structured, data-driven output.
pub const TEMP_INSIGHTS: f64 = 0.5;

/// Progress summaries — slightly creative but still grounded.
pub const TEMP_SUMMARIZE: f64 = 0.6;

/// Chat completion — same balance as coaching.
pub const TEMP_CHAT: f64 = 0.7;

/// Story generation — higher temperature for creative prose.
pub const TEMP_STORY: f32 = 0.9;

/// OCR / document extraction — near-deterministic, accuracy matters most.
pub const TEMP_OCR: f32 = 0.1;

/// Semantic search ranking — fully deterministic.
pub const TEMP_SEARCH: f32 = 0.0;

// ---------------------------------------------------------------------------
// max_tokens
// ---------------------------------------------------------------------------

/// Coach response token budget.
pub const MAX_TOKENS_COACH: u32 = 600;

/// Insights response token budget.
pub const MAX_TOKENS_INSIGHTS: u32 = 700;

/// Summary response token budget.
pub const MAX_TOKENS_SUMMARIZE: u32 = 400;

/// Chat response token budget.
pub const MAX_TOKENS_CHAT: u32 = 600;

/// Story generation token budget.
pub const MAX_TOKENS_STORY: u32 = 700;

/// OCR / document extraction token budget.
pub const MAX_TOKENS_OCR: u32 = 2000;

/// Search ranking token budget (short enumeration of indices).
pub const MAX_TOKENS_SEARCH: u32 = 100;

// ---------------------------------------------------------------------------
// Context query limits (LIMIT clauses in SQL)
// ---------------------------------------------------------------------------

/// Number of recent skills included in AI context.
pub const LIMIT_CONTEXT_SKILLS: usize = 10;

/// Number of active routines included in AI context.
pub const LIMIT_CONTEXT_ROUTINES: usize = 10;

/// Number of recent goals included in AI context.
pub const LIMIT_CONTEXT_GOALS: usize = 10;

/// Number of recent learning items included in AI context.
pub const LIMIT_CONTEXT_LEARNING: usize = 10;

/// Number of top-streaked routines included in AI context.
pub const LIMIT_CONTEXT_STREAKS: usize = 5;

/// Number of recent health metrics included in AI context.
pub const LIMIT_CONTEXT_HEALTH_METRICS: usize = 7; // days window, not row limit

/// Number of recent health checkups included in AI context.
pub const LIMIT_CONTEXT_CHECKUPS: usize = 5;

/// Number of pending todos included in AI context.
pub const LIMIT_CONTEXT_TODOS: usize = 10;

/// Number of items included in story-generation context (per category).
pub const LIMIT_STORY_CONTEXT: usize = 5;

// ---------------------------------------------------------------------------
// Search / embedding thresholds
// ---------------------------------------------------------------------------

/// Minimum cosine-similarity score for a result to be included in semantic
/// search output.
pub const SEARCH_RELEVANCE_THRESHOLD: f32 = 0.1;

// ---------------------------------------------------------------------------
// System prompts — ai.rs
// ---------------------------------------------------------------------------

pub const COACH_SYSTEM: &str = "You are a supportive personal development coach. You give clear, actionable advice grounded in the user's actual tracked data (skills, routines, goals, learning items). Be specific — reference their data when relevant. Keep responses concise (3-5 paragraphs max). Focus on:\n- What they're doing well\n- One concrete next step they can take today\n- How their current activities connect to their goals";

pub const INSIGHTS_SYSTEM: &str = "You are an analytical self-development advisor. Given the user's tracked data, identify patterns and provide structured insights. Format your response as:\n\n**Strengths**: What's working well (1-2 points)\n**Gaps**: Areas that need attention (1-2 points)\n**Recommendations**: Specific actions ranked by priority (2-3 items)\n**Connection**: How their skills, learning, and routines connect to their goals\n\nBe data-driven — reference their actual tracked items. Keep it concise and actionable.";

pub const SUMMARIZE_SYSTEM: &str = "You are a concise progress summarizer for a self-development app. Write a brief, motivating narrative summary of the user's progress. Highlight:\n- Key activities and completions\n- Skill growth\n- Routine consistency\n- Progress toward goals\n\nKeep it to 2-3 short paragraphs. Use an encouraging but honest tone. Reference their actual data.";

pub const CHAT_SYSTEM: &str = "You are a supportive AI coach embedded in Self Growth, a self-development app. The user tracks their skills, routines, learning items, and goals in this app. You have access to their current data as context.\n\nGuidelines:\n- Be warm, concise, and actionable\n- Reference their actual tracked data when relevant\n- Help them reflect on progress, overcome obstacles, and stay motivated\n- Suggest concrete next steps when appropriate\n- Keep responses focused (2-4 paragraphs unless they ask for more)\n- You can discuss routines, learning strategies, skill development, goal setting, habits, productivity, and personal growth";

// ---------------------------------------------------------------------------
// System prompts — story.rs
// ---------------------------------------------------------------------------

pub const STORY_SYSTEM: &str = "You write vivid, emotionally clear stories that stay grounded in provided context. Use the context as inspiration and factual anchors, but do not invent claims about the user's saved data that are not supported. If context is thin, keep the story more universal than specific.";

// ---------------------------------------------------------------------------
// System prompts — ocr.rs
// ---------------------------------------------------------------------------

pub const OCR_SYSTEM: &str = "You are an OCR assistant. Extract all text from the provided image accurately. Preserve the structure — use markdown tables for tabular data, bullet points for lists, and headings for sections. For medical/lab results, extract each metric with its value, unit, and reference range if visible. Be thorough and precise.";

pub const RECEIPT_SYSTEM: &str = "You are a receipt scanner. Extract all items, amounts, and totals from the provided receipt image. Format as a markdown table with columns: Item, Amount. Include the total, date, and merchant name if visible.";

pub const LAB_SYSTEM: &str = "You are a medical lab result scanner. Extract all test results from the image. Format as a markdown table with columns: Test, Result, Unit, Reference Range, Status (Normal/High/Low). Be precise with numbers and units.";

// ---------------------------------------------------------------------------
// System prompts — rag.rs (mobile LLM-based search)
// ---------------------------------------------------------------------------

pub const SEARCH_RANKING_SYSTEM: &str = "You are a search ranking system. Given a query and a numbered list of items, return ONLY the numbers of the most relevant items in order of relevance, separated by commas. Return at most the requested number of results. If nothing is relevant, return \"none\". Do not explain.";
