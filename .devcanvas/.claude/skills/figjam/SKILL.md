---
name: figjam
description: This skill should be used when the user asks to "create a FigJam board", "add sticky notes in FigJam", "build a diagram in FigJam", "brainstorm in FigJam", "extract FigJam content", "create a flowchart in FigJam", or discusses FigJam whiteboarding, collaborative brainstorming, or FigJam workflows.
version: 1.0.0
---

# FigJam Skill

Interact with FigJam boards for whiteboarding, brainstorming, diagramming, and collaborative planning using the Figma REST API.

## When to Activate

- User asks to create or modify FigJam boards or elements
- User wants to extract content from a FigJam board
- User asks to build diagrams, flowcharts, or mind maps in FigJam
- User wants to organize sticky notes, shapes, or connectors
- User references a FigJam board URL
- User discusses whiteboarding or brainstorming with FigJam

## Prerequisites

- **Figma API Token**: Set as `FIGMA_ACCESS_TOKEN` environment variable (same token as Figma)
- Obtain from https://www.figma.com/developers/api#access-tokens
- The FigJam file must be accessible with the provided token

## FigJam URL Parsing

FigJam URLs follow the pattern:
```
https://www.figma.com/board/<FILE_KEY>/<FILE_NAME>?node-id=<NODE_ID>
https://www.figma.com/file/<FILE_KEY>/<FILE_NAME>  (older format)
```

## Core API Endpoints

FigJam uses the same Figma REST API. Base URL: `https://api.figma.com/v1`

### Read Operations

```bash
# Get FigJam file structure
curl -s -H "X-Figma-Token: $FIGMA_ACCESS_TOKEN" \
  "https://api.figma.com/v1/files/<FILE_KEY>"

# Get specific nodes
curl -s -H "X-Figma-Token: $FIGMA_ACCESS_TOKEN" \
  "https://api.figma.com/v1/files/<FILE_KEY>/nodes?ids=<NODE_IDS>"

# Export nodes as images
curl -s -H "X-Figma-Token: $FIGMA_ACCESS_TOKEN" \
  "https://api.figma.com/v1/images/<FILE_KEY>?ids=<NODE_IDS>&format=png&scale=2"

# Get file comments
curl -s -H "X-Figma-Token: $FIGMA_ACCESS_TOKEN" \
  "https://api.figma.com/v1/files/<FILE_KEY>/comments"
```

### FigJam Node Types

FigJam files contain these node types in the API response:

| Node Type | Description |
|---|---|
| `DOCUMENT` | Root node |
| `CANVAS` | Page/board |
| `SECTION` | Section (grouping frame) |
| `STICKY` | Sticky note |
| `SHAPE_WITH_TEXT` | Shape with text (diamond, circle, square, triangle, etc.) |
| `CONNECTOR` | Line/arrow connecting two nodes |
| `TEXT` | Text element |
| `STAMP` | Reaction stamps |
| `WIDGET` | FigJam widgets |
| `TABLE` | Table element |
| `GROUP` | Grouped elements |

### Understanding FigJam Node Properties

#### Sticky Notes (`STICKY`)
```json
{
  "id": "123:456",
  "type": "STICKY",
  "name": "Sticky note text",
  "characters": "The actual text content",
  "absoluteBoundingBox": {"x": 0, "y": 0, "width": 199, "height": 228},
  "fills": [{"type": "SOLID", "color": {"r": 1, "g": 0.85, "b": 0.4, "a": 1}}],
  "authorVisible": true
}
```

#### Shapes (`SHAPE_WITH_TEXT`)
```json
{
  "id": "789:012",
  "type": "SHAPE_WITH_TEXT",
  "name": "Shape label",
  "characters": "Text inside shape",
  "shapeType": "SQUARE",
  "absoluteBoundingBox": {"x": 300, "y": 100, "width": 200, "height": 100},
  "fills": [{"type": "SOLID", "color": {"r": 0.9, "g": 0.9, "b": 1, "a": 1}}],
  "strokes": [{"type": "SOLID", "color": {"r": 0, "g": 0, "b": 0, "a": 1}}]
}
```

Shape types: `SQUARE`, `ELLIPSE`, `DIAMOND`, `TRIANGLE_UP`, `TRIANGLE_DOWN`, `ROUNDED_RECTANGLE`, `PARALLELOGRAM_RIGHT`, `PARALLELOGRAM_LEFT`, `ENG_DATABASE`, `ENG_QUEUE`, `ENG_FILE`, `ENG_FOLDER`

#### Connectors (`CONNECTOR`)
```json
{
  "id": "345:678",
  "type": "CONNECTOR",
  "connectorStart": {"endpointNodeId": "123:456", "position": {"x": 0.5, "y": 1}},
  "connectorEnd": {"endpointNodeId": "789:012", "position": {"x": 0.5, "y": 0}},
  "connectorStartStrokeCap": "NONE",
  "connectorEndStrokeCap": "ARROW_LINES",
  "textBackground": {"cornerRadius": 5},
  "characters": "connector label"
}
```

Stroke caps: `NONE`, `ARROW_LINES`, `ARROW_EQUILATERAL`, `TRIANGLE_FILLED`, `DIAMOND_FILLED`, `CIRCLE_FILLED`

#### Sections (`SECTION`)
```json
{
  "id": "901:234",
  "type": "SECTION",
  "name": "Section Title",
  "absoluteBoundingBox": {"x": -100, "y": -100, "width": 800, "height": 600},
  "fills": [{"type": "SOLID", "color": {"r": 0.95, "g": 0.95, "b": 0.95, "a": 1}}],
  "children": [...]
}
```

### Write Operations (via Figma Plugin API / REST)

FigJam content creation via REST API is limited. For creating content programmatically:

```bash
# Post a comment on the board
curl -s -X POST -H "X-Figma-Token: $FIGMA_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.figma.com/v1/files/<FILE_KEY>/comments" \
  -d '{
    "message": "Comment text",
    "client_meta": {"x": 100, "y": 200}
  }'

# Reply to a comment
curl -s -X POST -H "X-Figma-Token: $FIGMA_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.figma.com/v1/files/<FILE_KEY>/comments" \
  -d '{
    "message": "Reply text",
    "comment_id": "<PARENT_COMMENT_ID>"
  }'
```

For full write operations (creating sticky notes, shapes, connectors), use the **Figma Plugin API** or consider using the **FigJam Widget API**.

## Workflow

### 1. Extract Board Content

1. Fetch the FigJam file using the files endpoint
2. Traverse the node tree starting from `CANVAS` children
3. Categorize nodes by type:
   - **Sticky notes** (`STICKY`): Extract `characters` text and fill color
   - **Shapes** (`SHAPE_WITH_TEXT`): Extract text, shape type, and styling
   - **Connectors** (`CONNECTOR`): Map start/end node relationships
   - **Sections** (`SECTION`): Identify grouping and contained children
   - **Text** (`TEXT`): Extract standalone text content
4. Build a relationship graph from connectors
5. Output structured content grouped by sections

### 2. Analyze Board Structure

1. Fetch the file and identify all sections
2. For each section, list contained elements
3. Map connector relationships to show flow/dependencies
4. Generate a textual representation:
   - Markdown outline organized by sections
   - Mermaid diagram for flowcharts/connectors
   - Table of sticky notes with colors as categories

### 3. Convert to Actionable Items

1. Extract all sticky notes grouped by section
2. Map sticky note colors to categories:
   - Yellow: Ideas / General
   - Green: Approved / Go
   - Red/Pink: Blocked / Issues
   - Blue: Questions / Info needed
   - Purple/Violet: Action items
3. Generate task lists, user stories, or backlog items from content
4. Cross-reference connectors to establish dependencies

### 4. Board Summary Report

1. Count items by type and section
2. Extract key themes from text content
3. Identify decision points (shapes with connectors)
4. List action items and owners (if tagged)
5. Generate a structured summary document

## Color Mapping (RGBA to Semantic)

Common FigJam sticky note colors:

| Color | Approx RGB | Semantic Use |
|---|---|---|
| Yellow | `r:1.0 g:0.85 b:0.4` | Ideas, general notes |
| Light Yellow | `r:1.0 g:0.95 b:0.7` | Secondary notes |
| Orange | `r:1.0 g:0.65 b:0.3` | Warnings, attention |
| Pink | `r:1.0 g:0.7 b:0.75` | Issues, blockers |
| Red | `r:0.9 g:0.35 b:0.35` | Critical, blocked |
| Green | `r:0.55 g:0.85 b:0.55` | Approved, done |
| Light Green | `r:0.7 g:0.9 b:0.7` | In progress |
| Blue | `r:0.55 g:0.7 b:1.0` | Questions, info |
| Light Blue | `r:0.7 g:0.85 b:1.0` | Reference |
| Purple | `r:0.75 g:0.6 b:0.9` | Action items |
| Gray | `r:0.8 g:0.8 b:0.8` | Archived, deferred |

## Output

- Structured content extracted from FigJam boards (markdown, JSON, or task lists)
- Mermaid diagrams derived from connector relationships
- Board summary with item counts and key themes
- Actionable items converted from sticky notes
- Exported images of specific board areas
