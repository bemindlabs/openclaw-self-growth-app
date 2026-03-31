# AppShell Component

**Path**: `app/src/components/layout/AppShell.tsx`
**Status**: Implemented

## Overview

Root layout shell providing navigation (desktop sidebar + mobile bottom nav) and content area with safe-area support.

## Layout

### Desktop (md+)
```
┌─────────┬───────────────────────────────┐
│  Logo   │  Page Content                 │
│─────────│                               │
│  Nav    │                               │
│  Items  │                               │
│         │                               │
│         │                               │
│─────────│                               │
│  Theme  │                               │
└─────────┴───────────────────────────────┘
```

### Mobile (<md)
```
┌─────────────────────────────────┐
│  Page Content                   │
│                                 │
│                                 │
├─────────────────────────────────┤
│  ☰  ☰  ☰  ☰  ☰  (bottom nav)  │
└─────────────────────────────────┘
```

## Design Tokens Used

| Token | Usage |
|-------|-------|
| `card` | Sidebar and bottom nav background |
| `border` | Sidebar right border, bottom nav top border |
| `primary` | Active nav icon and label |
| `muted-foreground` | Inactive nav items |
| `secondary` | Nav item hover background |
| `background` | Content area background |

## Navigation Items

Icons from `lucide-react`. Routes defined in component.
