---
description: Linguistics — i18n, l10n, translations, copy, content, UX review, and language tooling
allowed-tools: Bash, Read, Write, Glob, Grep, Edit
argument-hint: [i18n|l10n|translate|copy|content|ux|lint] [action]
---

# Linguistics

Unified command for internationalization, localization, translation management, copywriting, content quality, UX copy review, and language tooling.

## Instructions

### Route by Subcommand

Parse `$ARGUMENTS` to determine the area and action:

- `i18n [action]` — Internationalization setup and management
- `l10n [action]` — Localization workflows
- `translate [action]` — Translation management
- `copy [action]` — Copywriting review and improvement
- `content [action]` — Content quality and consistency
- `ux [action]` — UX copy and microcopy review
- `lint [action]` — Language linting and style checking
- No arguments — Show linguistics overview

---

## Overview (default, no arguments)

Analyze project language/i18n status:

1. **Detect i18n Setup**
   - Check for i18n libraries (next-intl, react-intl, i18next, vue-i18n, etc.)
   - Find translation files (JSON, YAML, PO, XLIFF)
   - Check locale configuration

2. **Scan for Issues**
   - Hardcoded strings in components
   - Missing translations
   - Unused translation keys
   - Inconsistent copy

Display format:
```
Linguistics Overview
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

i18n Library:    next-intl
Default Locale:  en
Locales:         en, th, ja, zh (4)
Translation Dir: messages/

Coverage:
  en:  312/312 keys (100%)
  th:  298/312 keys (95.5%)
  ja:  280/312 keys (89.7%)
  zh:  245/312 keys (78.5%)

Issues:
  Hardcoded strings:   8 found
  Missing translations: 47 across 3 locales
  Unused keys:         5

Quick Actions:
  /linguistics i18n scan        Find hardcoded strings
  /linguistics translate status  Translation coverage
  /linguistics copy review      Review copy quality
  /linguistics lint             Check language quality
```

---

## i18n — Internationalization

### `i18n` — i18n status overview

```bash
# Detect i18n library
grep -r "next-intl\|react-intl\|i18next\|vue-i18n\|@angular/localize" package.json

# Find translation files
find . -name "*.json" -path "*/messages/*" -o -name "*.json" -path "*/locales/*" -o -name "*.json" -path "*/translations/*" | head -20

# Check locale config
cat next.config.js 2>/dev/null | grep -A 10 "i18n"
cat i18n.config.ts 2>/dev/null
```

### `i18n setup` — Setup internationalization

**Next.js + next-intl:**
```typescript
// i18n/config.ts
export const locales = ['en', 'th', 'ja', 'zh'] as const
export const defaultLocale = 'en' as const
export type Locale = (typeof locales)[number]
```

```typescript
// i18n/request.ts
import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`../messages/${locale}.json`)).default
}))
```

**Directory structure:**
```
messages/
├── en.json          # English (default)
├── th.json          # Thai
├── ja.json          # Japanese
└── zh.json          # Chinese

# or namespace-based:
messages/
├── en/
│   ├── common.json
│   ├── auth.json
│   └── dashboard.json
├── th/
│   ├── common.json
│   ├── auth.json
│   └── dashboard.json
```

**Translation file format:**
```json
{
  "common": {
    "actions": {
      "save": "Save",
      "cancel": "Cancel",
      "delete": "Delete",
      "confirm": "Are you sure?"
    },
    "errors": {
      "required": "{field} is required",
      "minLength": "{field} must be at least {min} characters",
      "serverError": "Something went wrong. Please try again."
    }
  },
  "auth": {
    "login": {
      "title": "Sign In",
      "email": "Email address",
      "password": "Password",
      "submit": "Sign in",
      "forgotPassword": "Forgot password?",
      "noAccount": "Don't have an account? {signUp}"
    }
  }
}
```

### `i18n scan` — Find hardcoded strings

Scan source files for untranslated hardcoded strings:

```bash
# Find strings in JSX/TSX that aren't wrapped in translation functions
grep -rn --include="*.tsx" --include="*.jsx" \
  ">\s*[A-Z][a-z].*</" . \
  --exclude-dir=node_modules
```

Look for:
- Text content in JSX (`<p>Hello World</p>`)
- String props (`placeholder="Enter name"`, `title="Settings"`)
- Alert/confirm messages (`alert("Are you sure?")`)
- Error messages (`throw new Error("Not found")`)
- Toast/notification text
- Form labels and validation messages
- Button text
- Heading text

### `i18n extract` — Extract strings for translation

1. Scan all source files for hardcoded strings
2. Generate translation keys following project conventions
3. Add keys to default locale file
4. Replace hardcoded strings with translation function calls

```typescript
// Before
<button>Save Changes</button>
<p>Welcome back, {user.name}!</p>
<input placeholder="Search..." />

// After
<button>{t('common.actions.save')}</button>
<p>{t('dashboard.welcome', { name: user.name })}</p>
<input placeholder={t('common.search.placeholder')} />
```

### `i18n validate` — Validate i18n implementation

Checklist:
- [ ] All user-facing strings use translation functions
- [ ] No string concatenation for translations (use ICU/interpolation)
- [ ] Pluralization handled correctly
- [ ] Date/time formatting uses locale-aware functions
- [ ] Number formatting uses locale-aware functions
- [ ] Currency formatting uses locale-aware functions
- [ ] RTL support if needed (Arabic, Hebrew)
- [ ] Language switcher implemented
- [ ] SEO: hreflang tags, localized URLs
- [ ] Locale persisted (cookie/URL/user preference)

### i18n Patterns

**Pluralization (ICU):**
```json
{
  "items": "{count, plural, =0 {No items} one {1 item} other {# items}}"
}
```

**Select (gender/type):**
```json
{
  "greeting": "{gender, select, male {Mr.} female {Ms.} other {}} {name}"
}
```

**Rich text:**
```json
{
  "terms": "By continuing, you agree to our <link>Terms of Service</link>"
}
```

```typescript
t.rich('terms', {
  link: (chunks) => <a href="/terms">{chunks}</a>
})
```

**Date/time:**
```typescript
const formatter = new Intl.DateTimeFormat(locale, {
  dateStyle: 'long',
  timeStyle: 'short'
})
```

**Numbers:**
```typescript
const formatter = new Intl.NumberFormat(locale, {
  style: 'currency',
  currency: 'THB'
})
```

---

## l10n — Localization

### `l10n` — Localization status

### `l10n adapt <locale>` — Adapt for specific locale

Beyond translation, check locale-specific adaptations:

| Aspect | Check |
|--------|-------|
| **Date format** | MM/DD/YYYY vs DD/MM/YYYY vs YYYY-MM-DD |
| **Time format** | 12h vs 24h |
| **Number format** | 1,000.00 vs 1.000,00 vs 1 000,00 |
| **Currency** | Symbol position, decimal places |
| **Address format** | Field order, postal code format |
| **Phone format** | Country code, digit grouping |
| **Name format** | First/Last vs Last/First |
| **Text direction** | LTR vs RTL |
| **Calendar** | Gregorian vs Buddhist vs Islamic |
| **Color meaning** | Cultural color associations |
| **Icons/imagery** | Cultural appropriateness |
| **Legal** | Privacy laws, disclaimers |

### `l10n thai` — Thai localization specifics

```typescript
// Thai Buddhist calendar year
const thaiYear = new Date().getFullYear() + 543

// Thai date formatting
const formatter = new Intl.DateTimeFormat('th-TH', {
  calendar: 'buddhist',
  dateStyle: 'long'
})

// Thai number formatting
const num = new Intl.NumberFormat('th-TH').format(1234567.89)
// "1,234,567.89"

// Thai currency
const baht = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB'
}).format(1500)
// "฿1,500.00"

// Thai phone format: +66 XX-XXX-XXXX
// Thai postal code: 5 digits
// Thai national ID: X-XXXX-XXXXX-XX-X
```

### `l10n japanese` — Japanese localization specifics

```typescript
// Japanese era calendar
const formatter = new Intl.DateTimeFormat('ja-JP-u-ca-japanese', {
  era: 'long',
  year: 'numeric'
})

// Japanese honorifics in names
// Full-width characters for forms
// Furigana support for names
// Postal code: XXX-XXXX
```

### `l10n chinese` — Chinese localization specifics

```typescript
// Simplified vs Traditional Chinese
// zh-CN (Simplified) vs zh-TW (Traditional)
// Date: YYYY年MM月DD日
// Currency: ¥ (CNY) vs NT$ (TWD)
```

### `l10n rtl` — RTL language support

```css
/* Logical properties for RTL support */
.card {
  margin-inline-start: 1rem;  /* not margin-left */
  padding-inline-end: 1rem;   /* not padding-right */
  border-inline-start: 2px solid;
  text-align: start;          /* not text-align: left */
}

/* Direction-aware flex */
.row {
  display: flex;
  flex-direction: row; /* automatically flips in RTL */
}
```

```typescript
// HTML dir attribute
<html dir={locale === 'ar' || locale === 'he' ? 'rtl' : 'ltr'}>
```

---

## Translate — Translation Management

### `translate status` — Translation coverage report

```
Translation Coverage
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Keys: 312

| Locale | Translated | Missing | Coverage |
|--------|-----------|---------|----------|
| en     | 312       | 0       | 100%     |
| th     | 298       | 14      | 95.5%    |
| ja     | 280       | 32      | 89.7%    |
| zh     | 245       | 67      | 78.5%    |

Missing Keys (th):
  - dashboard.analytics.exportButton
  - settings.notifications.emailDigest
  - ...
```

### `translate missing <locale>` — Find missing translations

Compare locale file against default locale and list missing keys.

### `translate unused` — Find unused translation keys

Cross-reference translation keys with source code usage:
```bash
# For each key in translation file, check if used in source
# Keys not found in any source file are unused
```

### `translate sync` — Sync translation files

1. Use default locale as source of truth
2. Add missing keys to all locale files (with empty/placeholder values)
3. Remove keys from locale files that don't exist in default
4. Sort keys alphabetically for consistency
5. Report changes

### `translate sort` — Sort translation keys

Sort all keys in translation files alphabetically for consistency and easier diffing.

### `translate lint` — Lint translation files

Check for:
- [ ] Missing interpolation variables (`{name}` in en but not in th)
- [ ] Inconsistent placeholders
- [ ] Empty translation values
- [ ] Duplicate keys
- [ ] Inconsistent nesting structure
- [ ] Trailing whitespace
- [ ] HTML in translations (should use rich text)
- [ ] Untranslated values (same as default locale)

### `translate context` — Add translator context

```json
{
  "auth.login.title": {
    "value": "Sign In",
    "_context": "Button label on the login page header"
  },
  "common.save": {
    "value": "Save",
    "_context": "Generic save button, used in forms",
    "_maxLength": 10
  }
}
```

---

## Copy — Copywriting

### `copy` — Copy quality overview

### `copy review` — Review UI copy

Read source files and evaluate:

**Clarity:**
- [ ] Clear and concise language
- [ ] No jargon or technical terms for end users
- [ ] Active voice preferred
- [ ] Action-oriented button text (verbs)

**Consistency:**
- [ ] Consistent terminology (don't mix "delete/remove/erase")
- [ ] Consistent capitalization (title case vs sentence case)
- [ ] Consistent punctuation
- [ ] Consistent tone (formal/informal)

**UX Writing:**
- [ ] Error messages explain what happened AND what to do
- [ ] Empty states guide users to action
- [ ] Loading states inform users
- [ ] Success messages confirm the action
- [ ] Confirmation dialogs are clear about consequences

**Inclusive Language:**
- [ ] Gender-neutral language
- [ ] No ableist language
- [ ] Culturally neutral examples
- [ ] Accessible to non-native speakers

### `copy review <file>` — Review specific file copy

### `copy errors` — Review error messages

Check error messages follow the pattern:
```
What happened + Why + What to do next

Bad:  "Error 500"
Bad:  "Something went wrong"
Good: "We couldn't save your changes. Please check your connection and try again."
Good: "This email is already registered. Try signing in or use a different email."
```

### `copy empty-states` — Review empty states

```
Bad:  "No data"
Good: "No projects yet. Create your first project to get started."

Bad:  "No results"
Good: "No results for 'search term'. Try adjusting your search or browse all items."
```

### `copy cta` — Review call-to-action text

```
Bad:  "Submit", "Click here", "OK"
Good: "Create account", "Save changes", "Send invitation"
Good: "Start free trial", "Download report", "Join waitlist"
```

### `copy glossary` — Build/review project glossary

Create a terminology reference:

| Term | Use | Don't Use |
|------|-----|-----------|
| Sign in | For authentication | Log in, Login |
| Sign up | For registration | Register, Create account |
| Delete | For permanent removal | Remove, Erase |
| Cancel | For aborting action | Dismiss, Close, Discard |
| Settings | For configuration | Preferences, Options |
| Save | For persisting changes | Apply, Update, Submit |

---

## Content — Content Quality

### `content` — Content quality check

### `content audit` — Audit all user-facing content

1. Scan all translation files and hardcoded strings
2. Check readability level
3. Check consistency
4. Check completeness

### `content readability` — Check reading level

Evaluate text complexity:
- Sentence length (aim for <20 words average)
- Word complexity (prefer common words)
- Flesch-Kincaid readability score
- Passive voice usage

### `content tone` — Check tone consistency

Define and verify tone attributes:
```
Tone Profile:
  - Professional but friendly
  - Clear and concise
  - Helpful, not condescending
  - Action-oriented
  - Empathetic in error states
```

### `content seo` — SEO content check

For public-facing pages:
- [ ] Title tags (50-60 chars)
- [ ] Meta descriptions (150-160 chars)
- [ ] Heading hierarchy (H1 → H2 → H3)
- [ ] Alt text on images
- [ ] Structured data (schema.org)
- [ ] Open Graph tags
- [ ] hreflang for multilingual

### `content a11y` — Content accessibility

- [ ] Alt text on all images
- [ ] Descriptive link text (not "click here")
- [ ] Headings describe sections
- [ ] Form labels are descriptive
- [ ] Error messages reference the field
- [ ] ARIA labels where needed
- [ ] Color not the only indicator

---

## UX — UX Copy & Microcopy Review

### `ux` — Full UX copy review

Scan all user-facing text and evaluate the complete UX writing quality.

### `ux review` — Review UX writing across the app

Read components, pages, and translation files. Evaluate each screen/flow:

**Microcopy Audit:**

| Element | Check |
|---------|-------|
| **Buttons** | Action verb, specific outcome ("Save changes" not "Submit") |
| **Labels** | Clear, concise, no ambiguity |
| **Placeholders** | Example format, not label repeat ("jane@example.com" not "Enter email") |
| **Tooltips** | Helpful context, not restating the label |
| **Toasts/Snackbars** | Brief confirmation, dismissible |
| **Modals** | Clear title, consequence stated, action buttons match intent |
| **Navigation** | Predictable labels, consistent hierarchy |
| **Breadcrumbs** | Reflect actual page hierarchy |
| **Tabs** | Parallel structure, short labels |
| **Menu items** | Verb or noun consistently, no mixed patterns |

### `ux flows` — Review user flow copy

Evaluate copy across complete user journeys:

**Onboarding Flow:**
```
Step 1: Welcome — Set expectations, explain value
Step 2: Setup — Clear instructions, progress indication
Step 3: First action — Guide to "aha moment"
Step 4: Success — Celebrate, suggest next steps

Bad:  "Step 1 of 4" → "Step 2 of 4" → "Done"
Good: "Welcome! Let's set up your workspace" → "Almost there — connect your first app" → "You're all set! Here's what you can do next"
```

**Authentication Flow:**
```
Sign up → Verify email → Complete profile → Dashboard
- Each step: clear heading + supportive subtext
- Error states: specific, actionable
- Success: confirmation + next step
```

**Checkout/Payment Flow:**
```
Cart → Shipping → Payment → Confirmation
- Price clarity at every step
- Trust signals near payment
- Clear refund/cancel policy
- Confirmation with order details + next steps
```

**Error Recovery Flow:**
```
Error → Understand → Fix → Retry → Success
- Explain what happened (no technical jargon)
- Say what to do next
- Offer alternatives if primary action fails
- Confirm recovery success
```

### `ux forms` — Review form UX copy

```
Form UX Copy Checklist:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Labels:
  ✓ Above the field (not inside as placeholder)
  ✓ Required fields marked (asterisk or "optional" label)
  ✓ Help text below field for complex inputs

Placeholders:
  ✓ Show format example ("MM/DD/YYYY")
  ✓ Never used as the only label
  ✓ Lighter color, disappears on focus

Validation:
  ✓ Inline, real-time (not only on submit)
  ✓ Error text below the field, in red
  ✓ Specific: "Password needs 8+ characters" not "Invalid"
  ✓ Success indicator when field is valid

Submit:
  ✓ Button text describes the action ("Create account")
  ✓ Loading state with progress text ("Creating...")
  ✓ Disabled state when form is invalid
  ✓ Success confirmation after submission
```

**Validation message patterns:**
```
Bad:  "Invalid input"
Bad:  "This field is required"
Good: "Enter your email address"
Good: "Password must be at least 8 characters"
Good: "Phone number should be 10 digits (e.g., 0812345678)"
```

### `ux notifications` — Review notification copy

| Type | Pattern | Example |
|------|---------|---------|
| **Success** | Confirm action briefly | "Changes saved" |
| **Error** | What happened + what to do | "Couldn't save. Check your connection and try again." |
| **Warning** | Risk + how to avoid | "You have unsaved changes. Save before leaving?" |
| **Info** | Neutral update | "New version available. Refresh to update." |
| **Loading** | What's happening | "Uploading your file..." |
| **Progress** | Step + context | "Processing 3 of 12 images..." |

**Notification copy rules:**
- Max 2 sentences
- Lead with the most important info
- Include action if user needs to do something
- Use sentence case
- No periods on single-sentence notifications
- Dismissible unless action required

### `ux empty` — Review empty states

Every list/page/section needs an empty state:

```
Structure: Illustration (optional) + Headline + Description + CTA

Bad:
  "No data available"

Good:
  "No projects yet"
  "Create your first project to start collaborating with your team."
  [Create project]

Good:
  "All caught up!"
  "You've completed all your tasks. Enjoy the rest of your day."

Good (search):
  "No results for 'quantum physics'"
  "Try different keywords or check your spelling."
  [Clear search]

Good (filtered):
  "No archived items"
  "Items you archive will appear here."
  [View all items]

Good (permission):
  "You don't have access to this page"
  "Ask your team admin for permission."
  [Request access]
```

### `ux loading` — Review loading states

```
Short operations (<2s):
  Spinner only, no text needed

Medium operations (2-10s):
  "Loading your dashboard..."
  "Fetching latest data..."

Long operations (>10s):
  Progress bar + context:
  "Importing contacts... 45 of 200"
  "Generating report — this may take a minute"

Skeleton screens:
  Preferred over spinners for page/section loads
  Show content structure before data arrives
```

### `ux permissions` — Review permission-related copy

```
Denied access:
  Bad:  "403 Forbidden"
  Good: "You need admin access to view this page. Contact your team owner."

Upgrade required:
  Bad:  "Feature not available"
  Good: "Team dashboards are available on the Pro plan. Upgrade to unlock."

Read-only:
  Bad:  (disabled button with no explanation)
  Good: "You can view this document but need edit access to make changes. Request access"
```

### `ux destructive` — Review destructive action copy

```
Delete confirmation:
  Title:   "Delete project 'My App'?"
  Body:    "This will permanently delete the project and all its data.
            This action cannot be undone."
  Cancel:  "Keep project"
  Confirm: "Delete project" (red/danger style)

Account deletion:
  Title:   "Delete your account?"
  Body:    "All your data, projects, and settings will be permanently removed.
            You won't be able to recover any of this information."
  Input:   "Type DELETE to confirm"
  Confirm: "Permanently delete account"
```

### UX Copy Report Format

```
UX Copy Review Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pages Reviewed:  12
Components:      34
Issues Found:    18

| Category         | Issues | Severity |
|------------------|--------|----------|
| Unclear labels   | 3      | Medium   |
| Missing empty    | 4      | Medium   |
| Bad error msgs   | 5      | High     |
| Placeholder-as   | 2      | Medium   |
| Generic buttons  | 3      | Low      |
| Missing loading  | 1      | Low      |

Top Priorities:
1. [HIGH] /checkout — error messages don't explain how to fix
2. [MED] /dashboard — no empty state for projects list
3. [MED] /settings — form labels used as placeholders
```

---

## Lint — Language Linting

### `lint` — Run language quality checks

### `lint spelling` — Check spelling

```bash
# If cspell available
npx cspell "**/*.{ts,tsx,js,jsx,md}" --no-progress

# Check project dictionary
cat .cspell.json 2>/dev/null || cat cspell.json 2>/dev/null
```

### `lint grammar` — Check grammar

Review for:
- Subject-verb agreement
- Tense consistency
- Article usage
- Comma splices
- Run-on sentences
- Fragment sentences

### `lint style` — Check writing style

Based on style guide:
- [ ] Sentence case for headings (not Title Case)
- [ ] Oxford comma usage (or not — be consistent)
- [ ] Numbers: spell out 1-9, digits for 10+
- [ ] Abbreviations defined on first use
- [ ] No double spaces
- [ ] Consistent quote marks
- [ ] Em dash vs en dash usage

### `lint inclusive` — Check inclusive language

Flag and suggest alternatives:
| Avoid | Use Instead |
|-------|-------------|
| whitelist/blacklist | allowlist/blocklist |
| master/slave | primary/replica |
| guys | everyone, folks, team |
| dummy | placeholder, sample |
| sanity check | confidence check, review |
| grandfathered | legacy, exempt |
| cripple | disable, impair |
| blind spot | gap, oversight |

### `lint dict` — Manage project dictionary

```json
// .cspell.json
{
  "version": "0.2",
  "language": "en",
  "words": [
    "supabase", "prisma", "vercel", "nextjs",
    "upsert", "middleware", "webhook"
  ],
  "ignorePaths": [
    "node_modules", ".next", "*.lock"
  ]
}
```

---

## Arguments

- `$ARGUMENTS` — Subcommand and action. Examples:
  - _(empty)_ — Show linguistics overview
  - `i18n` / `i18n setup` / `i18n scan` / `i18n extract` / `i18n validate`
  - `l10n` / `l10n adapt <locale>` / `l10n thai` / `l10n japanese` / `l10n rtl`
  - `translate status` / `translate missing <locale>` / `translate unused` / `translate sync` / `translate sort` / `translate lint`
  - `copy` / `copy review` / `copy errors` / `copy empty-states` / `copy cta` / `copy glossary`
  - `content` / `content audit` / `content readability` / `content tone` / `content seo` / `content a11y`
  - `ux` / `ux review` / `ux flows` / `ux forms` / `ux notifications` / `ux empty` / `ux loading` / `ux permissions` / `ux destructive`
  - `lint` / `lint spelling` / `lint grammar` / `lint style` / `lint inclusive` / `lint dict`

## Output

Linguistics management across internationalization, localization, translations, copywriting, content quality, UX copy review, and language tooling.
