---
description: UI — shadcn/ui components, Tailwind, theming, layout, forms, and patterns
allowed-tools: Bash, Read, Write, Glob, Grep, Edit
argument-hint: [components|tailwind|theme|layout|forms|patterns|review] [action]
---

# UI

Unified command for UI development with shadcn/ui as the default design system, Tailwind CSS, theming, layout, forms, and common patterns.

## Instructions

### Route by Subcommand

Parse `$ARGUMENTS` to determine the area and action:

- `components [action]` — shadcn/ui component management
- `tailwind [action]` — Tailwind CSS utilities and configuration
- `theme [action]` — Theming, dark mode, design tokens
- `layout [action]` — Layout patterns and responsive design
- `forms [action]` — Form components and validation
- `patterns [action]` — Common UI patterns and recipes
- `review [scope]` — UI code review
- No arguments — Show UI overview

---

## Overview (default, no arguments)

Show UI setup status:

```bash
# Check shadcn/ui setup
cat components.json 2>/dev/null

# Check Tailwind config
cat tailwind.config.ts 2>/dev/null || cat tailwind.config.js 2>/dev/null

# List installed components
ls -la src/components/ui/ 2>/dev/null || ls -la components/ui/ 2>/dev/null

# Check dependencies
grep -E "tailwindcss|@radix-ui|class-variance-authority|clsx|tailwind-merge" package.json
```

Display format:
```
UI Overview
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Design System:  shadcn/ui
CSS Framework:  Tailwind CSS v4
Style:          New York
Base Color:     Zinc
CSS Variables:  enabled

Installed Components (18/50):
  button, card, input, label, dialog, dropdown-menu,
  select, table, tabs, toast, avatar, badge, separator,
  skeleton, tooltip, popover, command, sheet

Missing Common:
  form, calendar, data-table, combobox, drawer

Quick Actions:
  /ui components add form
  /ui theme dark
  /ui patterns data-table
  /ui review
```

---

## Components — shadcn/ui Management

### `components` or `components ls` — List components

```bash
# List installed
ls src/components/ui/ 2>/dev/null || ls components/ui/ 2>/dev/null

# Check components.json config
cat components.json
```

### `components init` — Initialize shadcn/ui

```bash
npx shadcn@latest init
```

Configuration options:
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### `components add <name>` — Add component

```bash
# Single component
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog

# Multiple components
npx shadcn@latest add button card input label

# All components
npx shadcn@latest add --all

# With overwrite
npx shadcn@latest add button --overwrite
```

### `components diff` — Check for updates

```bash
npx shadcn@latest diff
npx shadcn@latest diff button
```

### Component Categories

**Inputs:**
```bash
npx shadcn@latest add button input textarea select checkbox radio-group switch slider toggle toggle-group
```

**Display:**
```bash
npx shadcn@latest add card avatar badge separator skeleton alert
```

**Overlay:**
```bash
npx shadcn@latest add dialog sheet drawer alert-dialog popover tooltip hover-card
```

**Navigation:**
```bash
npx shadcn@latest add navigation-menu menubar breadcrumb tabs sidebar
```

**Data:**
```bash
npx shadcn@latest add table data-table calendar command
```

**Feedback:**
```bash
npx shadcn@latest add toast sonner progress
```

**Layout:**
```bash
npx shadcn@latest add accordion collapsible resizable scroll-area aspect-ratio
```

**Forms:**
```bash
npx shadcn@latest add form label input textarea select checkbox radio-group switch calendar date-picker combobox
```

### Component Variants with CVA

```typescript
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)
```

### `components extend <name>` — Extend a component

Guide for customizing shadcn/ui components:
1. The component is in your codebase — edit directly
2. Add new variants via CVA
3. Compose with other components
4. Keep base component clean, create wrappers for app-specific behavior

---

## Tailwind — Tailwind CSS

### `tailwind` — Tailwind setup status

```bash
# Version
npx tailwindcss --version 2>/dev/null

# Config
cat tailwind.config.ts 2>/dev/null || cat tailwind.config.js 2>/dev/null

# Check PostCSS
cat postcss.config.js 2>/dev/null || cat postcss.config.mjs 2>/dev/null
```

### `tailwind config` — Review Tailwind config

```typescript
// tailwind.config.ts (shadcn/ui compatible)
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
```

### `tailwind utilities` — Common utility patterns

**Spacing:**
```
p-4 px-6 py-2           Padding
m-4 mx-auto my-8        Margin
space-x-4 space-y-2     Between children
gap-4 gap-x-6 gap-y-2   Grid/flex gap
```

**Typography:**
```
text-sm text-base text-lg     Size
font-medium font-semibold     Weight
text-muted-foreground         Color (semantic)
leading-relaxed tracking-wide Spacing
truncate line-clamp-3         Overflow
```

**Flexbox:**
```
flex items-center justify-between   Common row
flex flex-col gap-4                 Common column
flex-1 flex-shrink-0                Sizing
```

**Grid:**
```
grid grid-cols-3 gap-4              3-column grid
grid grid-cols-1 md:grid-cols-2     Responsive grid
col-span-2                          Spanning
```

**Responsive:**
```
sm:  640px+
md:  768px+
lg:  1024px+
xl:  1280px+
2xl: 1536px+

hidden md:block           Hide mobile, show desktop
md:grid-cols-2            2 columns on tablet+
text-sm md:text-base      Responsive text
```

### `tailwind cn` — The cn() utility

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Usage
<div className={cn(
  'rounded-lg border p-4',
  isActive && 'border-primary bg-primary/5',
  className
)} />
```

---

## Theme — Theming & Dark Mode

### `theme` — Current theme overview

### `theme setup` — Setup theming

**CSS variables (globals.css):**
```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 240 5.9% 10%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 240 5.9% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 240 4.9% 83.9%;
  }
}
```

### `theme dark` — Dark mode setup

**next-themes provider:**
```typescript
// app/providers.tsx
'use client'
import { ThemeProvider } from 'next-themes'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  )
}
```

**Theme toggle:**
```typescript
'use client'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

### `theme colors` — Customize color palette

Visit https://ui.shadcn.com/themes to generate theme colors, or manually adjust CSS variables.

### `theme tokens` — Design tokens reference

| Token | Usage |
|-------|-------|
| `--background` | Page/app background |
| `--foreground` | Default text |
| `--primary` | Primary buttons, links |
| `--secondary` | Secondary elements |
| `--muted` | Subtle backgrounds |
| `--muted-foreground` | Secondary text |
| `--accent` | Hover states |
| `--destructive` | Danger/error actions |
| `--border` | Borders |
| `--input` | Input borders |
| `--ring` | Focus rings |
| `--radius` | Border radius |
| `--card` | Card backgrounds |

---

## Layout — Layout Patterns

### `layout` — Layout overview

### `layout page` — Page layout patterns

**App Shell:**
```typescript
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar className="hidden w-64 border-r lg:block" />
      <div className="flex flex-1 flex-col">
        <Header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur" />
        <main className="flex-1 p-6">{children}</main>
        <Footer className="border-t py-4" />
      </div>
    </div>
  )
}
```

**Dashboard layout:**
```typescript
<div className="flex min-h-screen">
  <aside className="hidden w-64 border-r bg-muted/40 lg:block">
    <SidebarNav />
  </aside>
  <div className="flex flex-1 flex-col">
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <MobileSidebar />
      <Breadcrumb />
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
    <main className="flex-1 space-y-4 p-4 md:p-6">{children}</main>
  </div>
</div>
```

**Content/Marketing page:**
```typescript
<div className="flex min-h-screen flex-col">
  <Navbar />
  <main className="flex-1">
    <section className="container mx-auto max-w-6xl px-4 py-16 md:py-24">
      {children}
    </section>
  </main>
  <Footer />
</div>
```

### `layout responsive` — Responsive patterns

```typescript
// Responsive grid
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

// Responsive stack → row
<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <h1>Title</h1>
  <Button>Action</Button>
</div>

// Mobile-first sidebar
<Sheet>
  <SheetTrigger asChild className="lg:hidden">
    <Button variant="ghost" size="icon"><Menu /></Button>
  </SheetTrigger>
  <SheetContent side="left">
    <SidebarNav />
  </SheetContent>
</Sheet>
```

### `layout container` — Container patterns

```typescript
// Standard container
<div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

// Narrow content
<div className="mx-auto max-w-2xl px-4">

// Full bleed with contained content
<section className="bg-muted py-16">
  <div className="container mx-auto max-w-6xl px-4">
```

---

## Forms — Form Patterns

### `forms` — Form setup

### `forms setup` — Setup forms with React Hook Form + Zod

```bash
npx shadcn@latest add form input label select textarea checkbox radio-group switch
npm install react-hook-form @hookform/resolvers zod
```

### `forms basic` — Basic form pattern

```typescript
'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
})

type FormValues = z.infer<typeof formSchema>

export function MyForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '' },
  })

  async function onSubmit(values: FormValues) {
    // Handle submission
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormDescription>Your display name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </form>
    </Form>
  )
}
```

### `forms server` — Server Action form

```typescript
'use client'
import { useActionState } from 'react'
import { createUser } from '@/app/actions'

export function CreateUserForm() {
  const [state, formAction, isPending] = useActionState(createUser, null)

  return (
    <form action={formAction} className="space-y-4">
      <FormField name="email" label="Email" error={state?.errors?.email} />
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create User'}
      </Button>
    </form>
  )
}
```

### `forms validation` — Common Zod schemas

```typescript
// Common field schemas
const email = z.string().email()
const password = z.string().min(8).regex(/[A-Z]/, 'Need uppercase').regex(/[0-9]/, 'Need number')
const phone = z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone')
const url = z.string().url()
const slug = z.string().regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, hyphens only')
const price = z.coerce.number().positive().multipleOf(0.01)
const date = z.coerce.date()
const file = z.instanceof(File).refine(f => f.size < 5_000_000, 'Max 5MB')
```

---

## Patterns — Common UI Patterns

### `patterns` — Available patterns

### `patterns data-table` — Data table with sorting/filtering/pagination

```bash
npx shadcn@latest add table
npm install @tanstack/react-table
```

### `patterns command-palette` — Command palette (Cmd+K)

```bash
npx shadcn@latest add command dialog
```

```typescript
'use client'
import { useEffect, useState } from 'react'
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'

export function CommandPalette() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(o => !o)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem>Dashboard</CommandItem>
          <CommandItem>Settings</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
```

### `patterns confirm-dialog` — Confirmation dialog

```typescript
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete project?</AlertDialogTitle>
      <AlertDialogDescription>
        This will permanently delete the project and all its data. This cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### `patterns toast` — Toast notifications

```bash
npx shadcn@latest add sonner
```

```typescript
import { toast } from 'sonner'

// Success
toast.success('Changes saved')

// Error
toast.error('Failed to save', { description: 'Check your connection and try again.' })

// Promise
toast.promise(saveData(), {
  loading: 'Saving...',
  success: 'Saved!',
  error: 'Failed to save',
})

// Action
toast('File deleted', {
  action: { label: 'Undo', onClick: () => undoDelete() },
})
```

### `patterns loading` — Loading states

```typescript
// Skeleton loading
import { Skeleton } from '@/components/ui/skeleton'

function CardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-[200px] w-full rounded-xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )
}

// Button loading
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? 'Saving...' : 'Save'}
</Button>

// Page loading (Suspense)
<Suspense fallback={<CardSkeleton />}>
  <AsyncCard />
</Suspense>
```

### `patterns empty-state` — Empty state

```typescript
function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

<EmptyState
  icon={FolderOpen}
  title="No projects yet"
  description="Create your first project to get started."
  action={<Button>Create project</Button>}
/>
```

### `patterns auth-pages` — Auth page layouts

```typescript
// Centered card layout (login/signup)
<div className="flex min-h-screen items-center justify-center px-4">
  <Card className="w-full max-w-md">
    <CardHeader className="text-center">
      <CardTitle className="text-2xl">Sign in</CardTitle>
      <CardDescription>Enter your credentials to continue</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* form fields */}
    </CardContent>
    <CardFooter className="flex-col gap-2">
      <Button className="w-full">Sign in</Button>
      <p className="text-sm text-muted-foreground">
        Don't have an account? <Link href="/signup" className="text-primary hover:underline">Sign up</Link>
      </p>
    </CardFooter>
  </Card>
</div>
```

---

## Review — UI Code Review

### `review` — Full UI review

Read components and pages, evaluate against:

**Component Quality:**
- [ ] Using shadcn/ui components (not raw HTML)
- [ ] Consistent variant usage (same buttons for same actions)
- [ ] Proper semantic HTML under the hood
- [ ] Accessible (keyboard nav, screen reader)
- [ ] Responsive (mobile-first)

**Tailwind Usage:**
- [ ] Using semantic color tokens (`text-foreground` not `text-gray-900`)
- [ ] No conflicting classes
- [ ] Responsive classes present
- [ ] Using `cn()` for conditional classes
- [ ] No inline styles

**Dark Mode:**
- [ ] All colors use CSS variables / semantic tokens
- [ ] No hardcoded colors that break in dark mode
- [ ] Tested in both light and dark

**Consistency:**
- [ ] Spacing consistent (4px grid: `p-1 p-2 p-4 p-6 p-8`)
- [ ] Typography scale consistent
- [ ] Border radius consistent (`--radius`)
- [ ] Icon sizing consistent

### `review a11y` — Accessibility review

- [ ] All interactive elements are focusable
- [ ] Focus visible indicators present
- [ ] Color contrast meets WCAG AA (4.5:1 text, 3:1 large)
- [ ] Images have alt text
- [ ] Forms have labels
- [ ] Modals trap focus
- [ ] Keyboard navigation works
- [ ] Screen reader tested

---

## Arguments

- `$ARGUMENTS` — Subcommand and action. Examples:
  - _(empty)_ — Show UI overview
  - `components` / `components init` / `components add <name>` / `components diff` / `components extend <name>`
  - `tailwind` / `tailwind config` / `tailwind utilities` / `tailwind cn`
  - `theme` / `theme setup` / `theme dark` / `theme colors` / `theme tokens`
  - `layout` / `layout page` / `layout responsive` / `layout container`
  - `forms` / `forms setup` / `forms basic` / `forms server` / `forms validation`
  - `patterns data-table` / `patterns command-palette` / `patterns confirm-dialog` / `patterns toast` / `patterns loading` / `patterns empty-state` / `patterns auth-pages`
  - `review` / `review a11y`

## Output

UI development with shadcn/ui, Tailwind CSS, theming, layout patterns, forms, and common UI recipes.
