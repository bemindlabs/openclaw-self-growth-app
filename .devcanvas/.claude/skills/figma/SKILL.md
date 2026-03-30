---
name: figma
description: This skill should be used when the user asks to "convert Figma designs to code", "implement a Figma design", "extract design tokens from Figma", "inspect Figma file", "generate components from Figma", or discusses design-to-code workflows involving Figma.
version: 1.0.0
---

# Figma Skill

Convert Figma designs into code, extract design tokens, and bridge the design-to-development workflow.

## When to Activate

- User provides a Figma file URL or file key
- User asks to implement a UI from a Figma design
- User wants to extract colors, typography, spacing, or other design tokens
- User asks to generate component code from Figma layers
- User wants to compare implementation against a Figma design

## Prerequisites

- **Figma API Token**: Must be set as `FIGMA_ACCESS_TOKEN` environment variable
- The Figma file must be accessible with the provided token

## Figma API Usage

### Extract file key from URL

Figma URLs follow the pattern:
```
https://www.figma.com/design/<FILE_KEY>/<FILE_NAME>?node-id=<NODE_ID>
https://www.figma.com/file/<FILE_KEY>/<FILE_NAME>
```

### Core API Endpoints

Use `curl` with the Figma REST API v1:

```bash
# Get file structure
curl -s -H "X-Figma-Token: $FIGMA_ACCESS_TOKEN" \
  "https://api.figma.com/v1/files/<FILE_KEY>"

# Get specific nodes
curl -s -H "X-Figma-Token: $FIGMA_ACCESS_TOKEN" \
  "https://api.figma.com/v1/files/<FILE_KEY>/nodes?ids=<NODE_IDS>"

# Export node as image
curl -s -H "X-Figma-Token: $FIGMA_ACCESS_TOKEN" \
  "https://api.figma.com/v1/images/<FILE_KEY>?ids=<NODE_IDS>&format=png&scale=2"

# Get file styles (colors, text, effects)
curl -s -H "X-Figma-Token: $FIGMA_ACCESS_TOKEN" \
  "https://api.figma.com/v1/files/<FILE_KEY>/styles"

# Get file components
curl -s -H "X-Figma-Token: $FIGMA_ACCESS_TOKEN" \
  "https://api.figma.com/v1/files/<FILE_KEY>/components"
```

### Node ID encoding

Figma node IDs contain `:` characters (e.g., `1:23`). When passing them as URL parameters, encode `:` as `%3A` or use comma-separated lists for multiple nodes.

## Workflow

### 1. Inspect Design

1. Parse the Figma URL to extract the file key and optional node ID
2. Fetch the file or node data from the Figma API
3. Analyze the layer hierarchy, auto-layout properties, and constraints
4. Identify reusable components and design patterns

### 2. Extract Design Tokens

Map Figma properties to CSS/design tokens:

| Figma Property | Token Type |
|---|---|
| `fills[].color` | Color palette |
| `style.fontSize`, `fontFamily`, `fontWeight` | Typography |
| `paddingLeft/Right/Top/Bottom` | Spacing |
| `cornerRadius` | Border radius |
| `effects[]` (DROP_SHADOW, etc.) | Shadows |
| `strokes[]` | Borders |

### 3. Generate Code

- Map Figma auto-layout to CSS Flexbox (`layoutMode: "HORIZONTAL"` -> `flex-direction: row`)
- Convert absolute positioning to CSS when auto-layout is not used
- Translate fill colors to `background-color` or `color`
- Map constraints to responsive CSS properties
- Use component names as semantic class/component names

### 4. Export Assets

For images, icons, and illustrations:
1. Identify IMAGE fill types and vector nodes
2. Use the images endpoint to export as SVG (vectors) or PNG (raster)
3. Download exported URLs and save to project assets directory

## Design-to-Code Mapping Reference

| Figma Concept | CSS/HTML Equivalent |
|---|---|
| Frame with auto-layout | `div` with `display: flex` |
| `layoutMode: "VERTICAL"` | `flex-direction: column` |
| `layoutMode: "HORIZONTAL"` | `flex-direction: row` |
| `primaryAxisAlignItems` | `justify-content` |
| `counterAxisAlignItems` | `align-items` |
| `itemSpacing` | `gap` |
| `layoutGrow: 1` | `flex: 1` |
| `layoutAlign: "STRETCH"` | `align-self: stretch` |
| `clipsContent: true` | `overflow: hidden` |
| Component instance | Reusable component |
| Component with variants | Component with props |

## Output

- Generated component code matching the project's framework and conventions
- Design token files (CSS custom properties, JS/TS constants, or theme objects)
- Exported image assets saved to the appropriate directory
- Summary of design decisions and any manual adjustments needed
