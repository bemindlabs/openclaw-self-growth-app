---
description: UX/UI management — design system, accessibility, prototyping, handoff, reviews, and research
allowed-tools: Bash, Read, Write, Glob, Grep, Edit
argument-hint: [handoff|a11y|prototype|design-system|review|research] [action]
---

# UX/UI Management

Unified command for design system management, accessibility auditing, prototyping, design handoff, design reviews, and user research.

## Instructions

### Route by Subcommand

Parse `$ARGUMENTS` to determine the area and action:

- `handoff [action]` — Design-to-development handoff
- `a11y [action]` — Accessibility audit and compliance
- `prototype [action]` — Prototyping, wireframes, and user flows
- `design-system [action]` — Design tokens and component libraries
- `review [action]` — Design reviews and feedback
- `research [action]` — User research, personas, and journey maps
- No arguments — Show UX/UI status overview

---

## Status Overview (default, no arguments)

Show a combined UX/UI dashboard by scanning project directories:

```
UX/UI Overview
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Design System:     .design/        ✓ Initialized (12 tokens, 8 components)
Accessibility:     .a11y/          ! Last audit: 76/100 (3 critical issues)
Prototypes:        .prototypes/    ✓ 4 flows, 12 screens
Handoff:           .handoff/       ✓ 6 specs ready
Reviews:           .design-reviews/ ○ 2 pending reviews
Research:          research/      ✓ 3 personas, 2 journeys

Quick Actions:
  /uxui a11y audit          Run accessibility audit
  /uxui design-system sync  Sync tokens from Figma
  /uxui handoff validate    Validate implementation
```

---

## Handoff — Design-to-Development

### `handoff init` — Initialize handoff structure

1. Create `.handoff/` directory
2. Set up specification templates
3. Configure asset export settings

### `handoff spec add {component}` — Create component specification

Generate detailed component spec with:
- Visual design (spacing, colors, typography)
- Interaction behavior
- States and variants
- Responsive breakpoints
- Accessibility requirements
- Code snippets and design token references

### `handoff assets export` — Export design assets

1. Extract assets from Figma (icons SVG, images PNG/JPG at 1x/2x/3x, illustrations)
2. Optimize assets for web/mobile
3. Organize in directory structure
4. Generate asset manifest

### `handoff checklist` — Implementation checklist

Create developer checklist with:
- Components to implement
- Design tokens to apply
- Assets to integrate
- Interactions to build
- Accessibility requirements
- Track implementation progress

### `handoff validate` — Validate implementation against design

1. Compare implementation against design
2. Check component states and variants
3. Verify responsive behavior
4. Test accessibility compliance
5. Generate validation report

---

## A11y — Accessibility

### `a11y audit` — Run comprehensive accessibility audit

1. Detect project type and framework
2. Run automated tests:
   - **axe-core**: `npx @axe-core/cli {url}`
   - **pa11y**: `npx pa11y {url}`
   - **Lighthouse**: `lighthouse {url} --only-categories=accessibility`

3. Manual checks for keyboard navigation, screen reader compatibility, color contrast, focus management, semantic HTML, ARIA usage

4. Generate audit report:

   ```
   Accessibility Audit Report
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Overall Score: 76/100
   WCAG Level: AA (Partial Compliance)

   Critical Issues (6):
     ✗ Images missing alt text (WCAG 1.1.1)
     ✗ Form inputs without labels (WCAG 1.3.1)
     ✗ Insufficient color contrast (WCAG 1.4.3)

   Serious Issues (12):
     ! Missing skip navigation link (WCAG 2.4.1)
     ! Keyboard trap in modal (WCAG 2.1.2)

   By Category:
     Perceivable:     18/24 ████████████████░░░░░░░░ 75%
     Operable:        14/20 ██████████████░░░░░░░░░░ 70%
     Understandable:  16/18 ████████████████████░░░░ 89%
     Robust:          8/12  ████████████████░░░░░░░░ 67%
   ```

5. Save report to `.a11y/audit-{date}.md`

### `a11y fix {issue-id}` — Auto-fix accessibility issue

Common auto-fixes:
- **Missing alt text**: Analyze image context, suggest appropriate alt text, apply fixes
- **Color contrast**: Calculate contrast ratios, suggest WCAG AA/AAA compliant alternatives
- **Missing form labels**: Add proper `<label>` association or `aria-label`
- **Keyboard navigation**: Add `tabindex`, keyboard event handlers, focus indicators

### `a11y report` — Generate WCAG compliance report

Full WCAG 2.1 AA compliance report with:
- Executive summary and overall compliance percentage
- Compliance by principle (Perceivable, Operable, Understandable, Robust)
- Detailed findings with code examples
- Remediation plan with priorities
- Testing methodology documentation
- Save to `.a11y/compliance-report-{date}.md`

### `a11y checklist` — Generate accessibility development checklist

Checklist covering:
- Semantic HTML (elements, headings, lists, tables)
- Images & Media (alt text, captions, transcripts)
- Forms (labels, required fields, errors)
- Keyboard Navigation (tab order, focus, skip nav)
- ARIA (roles, labels, live regions, states)
- Color & Contrast (ratios, color-only information)
- Responsive & Zoom (reflow, touch targets, text resize)
- Testing procedures

### `a11y test {component}` — Test component accessibility

1. Load component file
2. Run focused tests: keyboard navigation, screen reader, ARIA, contrast, focus
3. Generate component-specific report with code fixes

### A11y Priority Reference

| Label | Priority | WCAG |
|-------|----------|------|
| Missing alt text | P0 | 1.1.1 |
| Color contrast | P0 | 1.4.3 |
| Keyboard trap | P0 | 2.1.2 |
| Missing labels | P1 | 1.3.1 |
| Skip navigation | P1 | 2.4.1 |
| Focus order | P2 | 2.4.3 |
| ARIA roles | P2 | 4.1.2 |

---

## Prototype — Wireframes & User Flows

### `prototype init` — Initialize prototyping structure

Create `.prototypes/` directory:

```
.prototypes/
├── flows/                  # User flow diagrams
├── wireframes/             # Low-fidelity wireframes
├── screens/                # Screen specifications
├── interactions/           # Interaction definitions
├── assets/                 # Prototype assets
└── prototype.json          # Prototype manifest
```

### `prototype flow add {name}` — Create user flow

Create flow document with:
- User goal and entry points
- Flow steps with actions, validations, error handling
- Decision points and branching
- Error states and success metrics
- Mermaid diagram for visualization
- Save to `.prototypes/flows/{name}.md`

### `prototype screen add {name}` — Document screen specification

Create screen spec with:
- ASCII wireframe layout
- Component inventory (variant, props, state)
- Content specifications
- States (loading, empty, error, success)
- Interactions and responsive breakpoints
- Accessibility notes
- Save to `.prototypes/screens/{name}.md`

### `prototype interaction add {name}` — Define interaction

Create interaction spec (JSON) with:
- Trigger (click, hover, scroll, etc.)
- Action sequence (validate, animate, API call, navigate)
- Conditional branches
- Timing and easing
- Save to `.prototypes/interactions/{name}.json`

### `prototype export {format}` — Export prototype

Formats:
- `html` — Interactive HTML/CSS/JS standalone prototype
- `pdf` — Annotated PDF with screen images and flow
- `video` — User flow video walkthrough
- `code` — Code scaffolding from prototype

### `prototype test {flow}` — Run usability test

Generate usability test script with:
- Test objective and participant profile
- Task scenarios with success criteria
- Observer notes template
- Post-test questionnaire
- Metrics tracking (completion rate, time, errors, satisfaction)
- Save to `.prototypes/tests/{flow}-test.md`

### `prototype analyze {test-results}` — Analyze usability test results

1. Calculate metrics (success rate, completion time, error frequency)
2. Identify patterns and pain points
3. Generate insights report with recommendations

---

## Design System — Tokens & Components

### `design-system init` — Initialize design system

Create `.design/` directory:

```
.design/
├── tokens/                  # Design tokens
│   ├── colors.json
│   ├── typography.json
│   ├── spacing.json
│   ├── shadows.json
│   └── breakpoints.json
├── components/              # Component specs
├── patterns/                # Design patterns
├── guidelines/              # Style guidelines
└── system.json              # Design system manifest
```

Detect project tech stack for token format (CSS variables, CSS-in-JS, Dart, etc.)

### `design-system tokens export` — Export tokens from Figma

1. Fetch styles from Figma REST API
2. Parse and categorize: colors, typography, shadows
3. Save to `.design/tokens/`

### `design-system tokens import {source}` — Import tokens

Sources: `figma:{file-id}`, `tailwind`, `bootstrap`, `material`, `file:{path}`

### `design-system tokens build` — Build token outputs

Generate from `.design/tokens/`:

| Format | Output |
|--------|--------|
| CSS Variables | `--color-primary-500: #3b82f6;` |
| SCSS Variables | `$color-primary-500: #3b82f6;` |
| JavaScript/TS | `export const tokens = { ... }` |
| JSON | Platform-agnostic tokens |
| Tailwind | `tailwind.config.js` theme extension |
| iOS Swift | `UIColor` constants |
| Android XML | `<color>` resources |

### `design-system component add {name}` — Document component

Create component spec with:
- Overview, variants, states
- Props/API table
- Design tokens used
- Accessibility requirements
- Usage guidelines (Do/Don't)
- Code examples
- Save to `.design/components/{name}.md`

### `design-system audit` — Audit design system consistency

Check:
- All components reference valid tokens
- Token naming conventions
- Unused tokens
- Missing documentation
- Accessibility compliance
- Figma sync status
- Generate audit report with score

### `design-system sync figma` — Sync with Figma

1. Fetch latest styles and components from Figma
2. Show diff of changes (added, modified, removed)
3. Prompt for confirmation
4. Apply changes and rebuild tokens

### `design-system document` — Generate documentation site

Generate static docs using Markdown, Storybook, or Docusaurus with token reference, component library, design principles, usage guidelines, and code examples.

---

## Review — Design Reviews & Feedback

### `review init` — Initialize design review structure

Create `.design-reviews/` directory with templates and guidelines.

### `review create {name}` — Create new design review session

Generate review document with:
- Feedback collection structure
- Review criteria and templates
- Design decision tracking
- Action items

### `review feedback add` — Add structured design feedback

1. Collect feedback on specific designs
2. Categorize by severity and type
3. Track resolution status

### `review summary` — Generate review summary

1. Aggregate all feedback
2. Identify common themes
3. Prioritize action items
4. Generate insights report

### `review export` — Export review documentation

Export reviews to PDF or Markdown with screenshots, annotations, and decisions.

---

## Research — User Research & Insights

### `research init` — Initialize research structure

Create `research/` directory with templates for personas, journey maps, and interviews.

### `research persona add {name}` — Create user persona

Generate persona with:
- Demographics, goals, pain points
- Behavioral patterns and motivations
- Use cases and scenarios

### `research journey add {name}` — Create user journey map

Map journey with:
- Stages and touchpoints
- Emotions and pain points
- Opportunities for improvement

### `research interview add` — Document user interview

1. Record interview notes
2. Tag key insights and quotes
3. Link findings to research themes

### `research insights` — Synthesize research insights

1. Aggregate data from all research sources
2. Identify patterns and themes
3. Generate actionable recommendations

### `research report` — Generate research report

Compile all findings with executive summary, personas, journeys, and key insights.

---

## Arguments

- `$ARGUMENTS` — Subcommand and action. Examples:
  - _(empty)_ — Show UX/UI status overview
  - `handoff init` / `handoff spec add Button` / `handoff assets export` / `handoff checklist` / `handoff validate`
  - `a11y audit` / `a11y fix contrast` / `a11y report` / `a11y checklist` / `a11y test Modal`
  - `prototype init` / `prototype flow add checkout` / `prototype screen add login` / `prototype export html` / `prototype test checkout`
  - `design-system init` / `design-system tokens export` / `design-system tokens build` / `design-system component add Button` / `design-system audit` / `design-system sync figma`
  - `review create sprint-5` / `review feedback add` / `review summary` / `review export`
  - `research persona add "Power User"` / `research journey add onboarding` / `research insights` / `research report`

## Output

Unified UX/UI management across design systems, accessibility, prototyping, handoff, reviews, and user research.
