---
description: Storybook — stories, docs, testing, addons, config, and CI
allowed-tools: Bash, Read, Write, Glob, Grep, Edit
argument-hint: [init|story|docs|test|addons|config|ci] [action]
---

# Storybook

Unified command for Storybook setup, story creation, documentation, visual/interaction testing, addons, configuration, and CI integration.

## Instructions

### Route by Subcommand

Parse `$ARGUMENTS` to determine the area and action:

- `init [action]` — Initialize and configure Storybook
- `story [action]` — Create and manage stories
- `docs [action]` — Component documentation
- `test [action]` — Visual, interaction, and accessibility testing
- `addons [action]` — Addon management
- `config [action]` — Configuration and customization
- `ci [action]` — CI/CD integration (Chromatic, etc.)
- No arguments — Show Storybook overview

---

## Overview (default, no arguments)

Show Storybook project status:

```bash
# Check Storybook version
npx storybook --version 2>/dev/null

# Check config
ls .storybook/ 2>/dev/null

# Count stories
find . -name "*.stories.tsx" -o -name "*.stories.ts" | grep -v node_modules | wc -l

# Check addons
cat .storybook/main.ts 2>/dev/null | grep -A 20 "addons"
```

Display format:
```
Storybook Overview
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Version:     8.x.x
Framework:   @storybook/nextjs
Builder:     Vite

Stories:     42 files, ~120 stories
Docs:        18 MDX pages
Config:      .storybook/

Addons:
  @storybook/addon-essentials
  @storybook/addon-interactions
  @storybook/addon-a11y
  @chromatic-com/storybook

Quick Actions:
  /storybook story Button     Create story
  /storybook docs             Generate docs
  /storybook test             Run tests
  /storybook ci               Setup Chromatic
```

---

## Init — Initialize Storybook

### `init` — Initialize Storybook in project

```bash
npx storybook@latest init
```

### `init nextjs` — Setup for Next.js

```bash
npx storybook@latest init --type nextjs
```

Installs `@storybook/nextjs` framework with:
- Next.js Image support
- Next.js Router mocking
- CSS/Sass/Tailwind support
- Server Actions mocking

### `init upgrade` — Upgrade Storybook

```bash
npx storybook@latest upgrade
```

### `init migrate` — Run codemods for breaking changes

```bash
npx storybook@latest automigrate
```

### Project Structure

```
.storybook/
├── main.ts          # Storybook configuration
├── preview.ts       # Global decorators and parameters
├── preview-head.html # Custom head tags (fonts, etc.)
└── manager.ts       # Manager UI customization

src/
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   └── button.stories.tsx    # Co-located story
│   └── features/
│       ├── UserCard.tsx
│       └── UserCard.stories.tsx
└── stories/                       # Standalone stories/docs
    ├── Introduction.mdx
    └── Colors.mdx
```

---

## Story — Create & Manage Stories

### `story <component>` — Create story for component

Generate a story file following CSF3 (Component Story Format 3):

```typescript
// button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './button'

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'default',
  },
}

export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive',
  },
}

export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
}

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Mail className="mr-2 h-4 w-4" />
        Email
      </>
    ),
  },
}

export const Loading: Story = {
  args: {
    children: (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Saving...
      </>
    ),
    disabled: true,
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
}
```

### `story form` — Form component story

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { within, userEvent, expect } from '@storybook/test'
import { LoginForm } from './LoginForm'

const meta = {
  title: 'Forms/LoginForm',
  component: LoginForm,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof LoginForm>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Filled: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(canvas.getByLabelText('Email'), 'user@example.com')
    await userEvent.type(canvas.getByLabelText('Password'), 'password123')
  },
}

export const WithValidationErrors: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: /sign in/i }))
    await expect(canvas.getByText('Email is required')).toBeInTheDocument()
  },
}

export const SubmitSuccess: Story = {
  args: {
    onSubmit: async (data) => {
      await new Promise(r => setTimeout(r, 1000))
      return { success: true }
    },
  },
}
```

### `story page` — Page-level story

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { DashboardPage } from './DashboardPage'

const meta = {
  title: 'Pages/Dashboard',
  component: DashboardPage,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/dashboard',
      },
    },
  },
  decorators: [
    (Story) => (
      <AuthProvider user={mockUser}>
        <Story />
      </AuthProvider>
    ),
  ],
} satisfies Meta<typeof DashboardPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Empty: Story = {
  args: { data: [] },
}

export const Loading: Story = {
  args: { isLoading: true },
}

export const Error: Story = {
  args: { error: 'Failed to load dashboard data' },
}

export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
}
```

### `story list` — List all stories

```bash
find . -name "*.stories.tsx" -o -name "*.stories.ts" -o -name "*.stories.mdx" | grep -v node_modules | sort
```

### `story audit` — Audit story coverage

Compare components vs stories:

```bash
# Components without stories
for f in $(find src/components -name "*.tsx" ! -name "*.stories.*" ! -name "*.test.*" ! -name "index.*"); do
  story="${f%.tsx}.stories.tsx"
  [ ! -f "$story" ] && echo "Missing: $f"
done
```

### Story Organization

| Pattern | Title | Example |
|---------|-------|---------|
| UI primitives | `UI/ComponentName` | `UI/Button` |
| Composite | `Components/ComponentName` | `Components/UserCard` |
| Forms | `Forms/FormName` | `Forms/LoginForm` |
| Pages | `Pages/PageName` | `Pages/Dashboard` |
| Patterns | `Patterns/PatternName` | `Patterns/DataTable` |
| Foundation | `Foundation/Topic` | `Foundation/Colors` |

---

## Docs — Component Documentation

### `docs` — Documentation overview

### `docs page <topic>` — Create MDX documentation page

```mdx
{/* Introduction.mdx */}
import { Meta } from '@storybook/blocks'

<Meta title="Introduction" />

# Design System

Welcome to the component library documentation.

## Getting Started

Install the package:

```bash
npm install @myorg/ui
```

Import components:

```tsx
import { Button } from '@myorg/ui'
```

## Principles

- **Consistent** — Same patterns across the app
- **Accessible** — WCAG AA compliant
- **Composable** — Mix and match components
```

### `docs component` — Auto-generated component docs

Use `tags: ['autodocs']` in story meta:

```typescript
const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],  // Auto-generate docs page
  parameters: {
    docs: {
      description: {
        component: 'Primary action button with multiple variants and sizes.',
      },
    },
  },
} satisfies Meta<typeof Button>
```

### `docs tokens` — Design token documentation

```mdx
{/* Colors.mdx */}
import { Meta, ColorPalette, ColorItem } from '@storybook/blocks'

<Meta title="Foundation/Colors" />

# Colors

<ColorPalette>
  <ColorItem title="Primary" subtitle="--primary" colors={{ Default: 'hsl(240 5.9% 10%)' }} />
  <ColorItem title="Secondary" subtitle="--secondary" colors={{ Default: 'hsl(240 4.8% 95.9%)' }} />
  <ColorItem title="Destructive" subtitle="--destructive" colors={{ Default: 'hsl(0 84.2% 60.2%)' }} />
  <ColorItem title="Muted" subtitle="--muted" colors={{ Default: 'hsl(240 4.8% 95.9%)' }} />
</ColorPalette>
```

### `docs icons` — Icon documentation

```mdx
{/* Icons.mdx */}
import { Meta, IconGallery, IconItem } from '@storybook/blocks'
import { Home, Settings, User, Mail, Search } from 'lucide-react'

<Meta title="Foundation/Icons" />

# Icons

Using [Lucide React](https://lucide.dev) icons.

<IconGallery>
  <IconItem name="Home"><Home /></IconItem>
  <IconItem name="Settings"><Settings /></IconItem>
  <IconItem name="User"><User /></IconItem>
  <IconItem name="Mail"><Mail /></IconItem>
  <IconItem name="Search"><Search /></IconItem>
</IconGallery>
```

---

## Test — Testing

### `test` — Run all Storybook tests

```bash
npx test-storybook
```

### `test interaction` — Interaction tests

```typescript
import { within, userEvent, expect, fn } from '@storybook/test'

export const ClickTest: Story = {
  args: {
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')

    await userEvent.click(button)
    await expect(args.onClick).toHaveBeenCalledOnce()
  },
}

export const TypeTest: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByLabelText('Email')

    await userEvent.clear(input)
    await userEvent.type(input, 'test@example.com')
    await expect(input).toHaveValue('test@example.com')
  },
}

export const AsyncTest: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Load' }))

    // Wait for async result
    await expect(
      await canvas.findByText('Data loaded')
    ).toBeInTheDocument()
  },
}
```

### `test a11y` — Accessibility testing

```bash
# Install addon
npm install @storybook/addon-a11y --save-dev
```

```typescript
// .storybook/main.ts
addons: ['@storybook/addon-a11y']

// In story — override rules
export const AccessibleButton: Story = {
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
        ],
      },
    },
  },
}

// Disable for specific story
export const Decorative: Story = {
  parameters: {
    a11y: { disable: true },
  },
}
```

**Run a11y tests in CI:**
```bash
npx test-storybook --url http://localhost:6006
```

### `test visual` — Visual regression testing

```bash
# With Chromatic
npx chromatic --project-token=<token>

# With Playwright
npx playwright test --config=storybook.playwright.config.ts
```

### `test coverage` — Story coverage

```bash
# Check which components have stories
npx storybook coverage

# Or manually audit
/storybook story audit
```

### `test snapshot` — Snapshot testing

```typescript
// Using portable stories
import { composeStories } from '@storybook/react'
import { render } from '@testing-library/react'
import * as stories from './Button.stories'

const { Default, Destructive, Loading } = composeStories(stories)

test('Button renders default', () => {
  const { container } = render(<Default />)
  expect(container).toMatchSnapshot()
})

test('Button renders destructive', () => {
  const { container } = render(<Destructive />)
  expect(container).toMatchSnapshot()
})
```

---

## Addons — Addon Management

### `addons` or `addons ls` — List installed addons

```bash
cat .storybook/main.ts | grep -A 30 "addons"
```

### `addons add <name>` — Install addon

```bash
npx storybook@latest add <addon-name>
```

### Essential Addons

| Addon | Purpose |
|-------|---------|
| `@storybook/addon-essentials` | Controls, actions, viewport, backgrounds, docs |
| `@storybook/addon-interactions` | Play function testing |
| `@storybook/addon-a11y` | Accessibility checks |
| `@storybook/addon-links` | Link between stories |
| `@storybook/addon-viewport` | Responsive preview |
| `@chromatic-com/storybook` | Visual testing with Chromatic |
| `storybook-dark-mode` | Dark mode toggle |
| `@storybook/addon-designs` | Embed Figma designs |
| `@storybook/addon-measure` | Measure layout |
| `@storybook/addon-outline` | Outline elements |

### Recommended Setup

```typescript
// .storybook/main.ts
addons: [
  '@storybook/addon-essentials',
  '@storybook/addon-interactions',
  '@storybook/addon-a11y',
  '@chromatic-com/storybook',
  'storybook-dark-mode',
],
```

---

## Config — Configuration

### `config` — Show configuration

### `config main` — Main configuration

```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/nextjs'

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@chromatic-com/storybook',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  staticDirs: ['../public'],
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
}

export default config
```

### `config preview` — Preview configuration

```typescript
// .storybook/preview.ts
import type { Preview } from '@storybook/react'
import '../src/app/globals.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: 'hsl(0 0% 100%)' },
        { name: 'dark', value: 'hsl(240 10% 3.9%)' },
        { name: 'muted', value: 'hsl(240 4.8% 95.9%)' },
      ],
    },
    viewport: {
      viewports: {
        mobile: { name: 'Mobile', styles: { width: '375px', height: '812px' } },
        tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop', styles: { width: '1440px', height: '900px' } },
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="font-sans antialiased">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
}

export default preview
```

### `config dark` — Dark mode support

```typescript
// .storybook/preview.ts
import { themes } from '@storybook/theming'

parameters: {
  darkMode: {
    dark: { ...themes.dark },
    light: { ...themes.light },
    stylePreview: true,
    darkClass: 'dark',
    lightClass: 'light',
    classTarget: 'html',
  },
}
```

### `config aliases` — Path aliases

```typescript
// .storybook/main.ts
const config: StorybookConfig = {
  // ...
  webpackFinal: async (config) => {
    config.resolve!.alias = {
      ...config.resolve!.alias,
      '@': path.resolve(__dirname, '../src'),
    }
    return config
  },
  // Or with Vite:
  viteFinal: async (config) => {
    config.resolve!.alias = {
      '@': path.resolve(__dirname, '../src'),
    }
    return config
  },
}
```

### `config mocks` — Mock setup

```typescript
// .storybook/preview.ts
import { initialize, mswLoader } from 'msw-storybook-addon'

initialize()

const preview: Preview = {
  loaders: [mswLoader],
}

// In story
import { http, HttpResponse } from 'msw'

export const WithMockedAPI: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('/api/users', () =>
          HttpResponse.json([
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
          ])
        ),
      ],
    },
  },
}
```

---

## CI — CI/CD Integration

### `ci` — CI overview

### `ci chromatic` — Setup Chromatic

```bash
# Install
npm install chromatic --save-dev

# Run
npx chromatic --project-token=<token>
```

**GitHub Actions:**
```yaml
# .github/workflows/chromatic.yml
name: Chromatic

on: push

jobs:
  chromatic:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - uses: chromaui/action@latest
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          autoAcceptChanges: main
          exitZeroOnChanges: true
```

### `ci build` — Build Storybook for deployment

```bash
# Build static site
npx storybook build -o storybook-static

# Test built storybook
npx http-server storybook-static -p 6006
```

### `ci test` — Run tests in CI

```yaml
# GitHub Actions
- name: Build Storybook
  run: npx storybook build

- name: Run Storybook tests
  run: |
    npx concurrently -k -s first -n "SB,TEST" -c "magenta,blue" \
      "npx http-server storybook-static --port 6006 --silent" \
      "npx wait-on tcp:6006 && npx test-storybook"
```

### `ci deploy` — Deploy to static hosting

**Vercel:**
```json
// vercel.json
{
  "buildCommand": "npx storybook build -o storybook-static",
  "outputDirectory": "storybook-static"
}
```

**GitHub Pages:**
```yaml
- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./storybook-static
```

### `ci check` — Pre-merge checks

```yaml
# PR checks
- name: Storybook checks
  run: |
    npx storybook build           # Build check
    npx test-storybook            # Interaction tests
    npx chromatic --exit-zero-on-changes  # Visual tests
```

---

## Arguments

- `$ARGUMENTS` — Subcommand and action. Examples:
  - _(empty)_ — Show Storybook overview
  - `init` / `init nextjs` / `init upgrade` / `init migrate`
  - `story <component>` / `story form` / `story page` / `story list` / `story audit`
  - `docs` / `docs page <topic>` / `docs component` / `docs tokens` / `docs icons`
  - `test` / `test interaction` / `test a11y` / `test visual` / `test coverage` / `test snapshot`
  - `addons` / `addons ls` / `addons add <name>`
  - `config` / `config main` / `config preview` / `config dark` / `config aliases` / `config mocks`
  - `ci` / `ci chromatic` / `ci build` / `ci test` / `ci deploy` / `ci check`

## Output

Storybook management across stories, documentation, testing, addons, configuration, and CI integration.
