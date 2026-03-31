# Color Usage Guidelines

## Semantic Color System

The design system uses **semantic color tokens** rather than raw hex values. Always reference tokens by their role, not their visual appearance.

### When to Use Each Color

| Token | Use For | Do NOT Use For |
|-------|---------|----------------|
| `primary` | CTAs, active states, brand emphasis | Decorative backgrounds |
| `secondary` | Hover states, input backgrounds | Primary actions |
| `accent` | Special highlights, badges | Regular UI chrome |
| `destructive` | Delete, errors, dangerous actions | Warnings or cautions |
| `success` | Completion, positive states, streaks | Decorative green |
| `warning` | Alerts, overdue items, cautions | Errors (use destructive) |
| `muted` | Disabled states, subtle backgrounds | Interactive elements |
| `card` | Panel/card backgrounds | Page background |
| `background` | Page background only | Card or panel backgrounds |
| `border` | Dividers, separators, outlines | Text or icons |

### Foreground Pairing

Tokens with `-foreground` variants must be used together:
- `bg-primary` + `text-primary-foreground`
- `bg-card` + `text-card-foreground`
- `bg-destructive` + `text-destructive-foreground`

### Opacity Modifiers

Use Tailwind opacity modifiers for subtle variants:
- `bg-primary/10` — subtle primary tint (bot avatar, active sidebar)
- `bg-destructive/10` — subtle error background (error banners)
- `border-border/50` — lighter dividers (sidebar item borders)

## Contrast Requirements

- Text on `primary` background: white (#fff) — ratio 4.6:1 (AA pass)
- Text on `card` background: foreground (#0f172a) — ratio 15.4:1 (AAA pass)
- `muted-foreground` on `background`: #64748b on #f8fafc — ratio 4.5:1 (AA pass, borderline)
