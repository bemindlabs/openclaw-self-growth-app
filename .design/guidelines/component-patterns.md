# Component Patterns

## Class Composition

Always use the `cn()` utility from `@/lib/utils` for conditional classes:

```tsx
import { cn } from "@/lib/utils";

<div className={cn(
  "base classes here",
  condition && "conditional classes",
  variant === "primary" ? "bg-primary" : "bg-secondary"
)} />
```

## Icon Usage

Use `lucide-react` for all icons. Standard sizes:
- **11-12px**: Inline micro icons (rename, delete in lists)
- **14px**: Small inline icons (chat avatars, sidebar items)
- **16px**: Action buttons (send, clear)
- **18-20px**: Header icons, section markers
- **48px**: Empty state illustrations

## Button Patterns

### Primary Action
```tsx
<button className="bg-primary text-primary-foreground rounded-md px-3 py-2.5 disabled:opacity-50 hover:opacity-90 transition-opacity">
```

### Ghost / Text Button
```tsx
<button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors">
```

### Icon-Only Button
```tsx
<button className="p-1 rounded hover:bg-secondary transition-colors" title="Accessible label">
  <Icon size={16} className="text-muted-foreground" />
</button>
```

## Card Pattern

```tsx
<div className="bg-card border border-border rounded-lg px-3.5 py-2.5">
```

## Input Pattern

```tsx
<input className="flex-1 bg-secondary text-sm rounded-md border border-border px-3 py-2.5 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50" />
```

## Empty State Pattern

```tsx
<div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
  <Icon size={48} className="mb-4 opacity-20" />
  <p className="text-sm font-medium">Title</p>
  <p className="text-xs mt-1 max-w-xs">Description</p>
</div>
```

## Loading Animation

Bouncing dots for AI responses:
```tsx
<div className="flex gap-1">
  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
</div>
```

## Transition Defaults

- Color changes: `transition-colors`
- Opacity changes: `transition-opacity`
- All property changes: `transition-all` (use sparingly)

## Hover Reveal Pattern

Show action buttons on parent hover:
```tsx
<div className="group ...">
  <div className="hidden group-hover:flex items-center gap-0.5">
    <button>...</button>
  </div>
</div>
```
