---
name: miro
description: This skill should be used when the user asks to "create a Miro board", "add sticky notes to Miro", "build a diagram in Miro", "manage Miro frames", "extract content from Miro", "create a flowchart in Miro", or discusses collaborative whiteboarding, visual collaboration, brainstorming boards, or Miro workflows.
version: 1.0.0
---

# Miro Skill

Interact with Miro boards for visual collaboration, diagramming, brainstorming, and whiteboard management.

## When to Activate

- User asks to create or modify Miro boards or items
- User wants to extract content from a Miro board (sticky notes, text, diagrams)
- User asks to build diagrams, flowcharts, or mind maps in Miro
- User wants to organize or restructure board content
- User references a Miro board URL
- User discusses whiteboarding, visual collaboration, or brainstorming with Miro

## Prerequisites

- **Miro API Token**: Set as `MIRO_ACCESS_TOKEN` environment variable
- Obtain from https://miro.com/app/settings/user-profile/apps (create an app or use a personal token)
- The board must be accessible with the provided token

## Board URL Parsing

Miro board URLs follow the pattern:
```
https://miro.com/app/board/<BOARD_ID>/
https://miro.com/app/board/<BOARD_ID>/?moveToWidget=<WIDGET_ID>
```

## Core API Endpoints

Base URL: `https://api.miro.com/v2`

### Board Operations

```bash
# Get board info
curl -s -H "Authorization: Bearer $MIRO_ACCESS_TOKEN" \
  "https://api.miro.com/v2/boards/<BOARD_ID>"

# Create a new board
curl -s -X POST -H "Authorization: Bearer $MIRO_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.miro.com/v2/boards" \
  -d '{
    "name": "Board Name",
    "description": "Board description",
    "policy": {
      "sharingPolicy": {"access": "private", "teamAccess": "edit"}
    }
  }'

# Get all items on a board
curl -s -H "Authorization: Bearer $MIRO_ACCESS_TOKEN" \
  "https://api.miro.com/v2/boards/<BOARD_ID>/items?limit=50"

# Get items by type
curl -s -H "Authorization: Bearer $MIRO_ACCESS_TOKEN" \
  "https://api.miro.com/v2/boards/<BOARD_ID>/items?type=sticky_note&limit=50"
```

### Sticky Notes

```bash
# Create a sticky note
curl -s -X POST -H "Authorization: Bearer $MIRO_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.miro.com/v2/boards/<BOARD_ID>/sticky_notes" \
  -d '{
    "data": {"content": "Note content", "shape": "square"},
    "style": {"fillColor": "yellow", "textAlign": "center", "textAlignVertical": "middle"},
    "position": {"x": 0, "y": 0},
    "geometry": {"width": 199}
  }'

# Update a sticky note
curl -s -X PATCH -H "Authorization: Bearer $MIRO_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.miro.com/v2/boards/<BOARD_ID>/sticky_notes/<ITEM_ID>" \
  -d '{"data": {"content": "Updated content"}}'
```

Sticky note colors: `gray`, `light_yellow`, `yellow`, `orange`, `light_green`, `green`, `dark_green`, `cyan`, `light_pink`, `pink`, `violet`, `red`, `light_blue`, `blue`, `dark_blue`, `black`

### Shapes

```bash
# Create a shape (rectangle, circle, triangle, etc.)
curl -s -X POST -H "Authorization: Bearer $MIRO_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.miro.com/v2/boards/<BOARD_ID>/shapes" \
  -d '{
    "data": {"content": "Shape label", "shape": "rectangle"},
    "style": {
      "fillColor": "#ffffff",
      "borderColor": "#1a1a2e",
      "borderWidth": "2.0",
      "borderStyle": "normal",
      "fontSize": "14",
      "textAlign": "center"
    },
    "position": {"x": 100, "y": 200},
    "geometry": {"width": 200, "height": 100}
  }'
```

Shape types: `rectangle`, `round_rectangle`, `circle`, `triangle`, `rhombus`, `parallelogram`, `trapezoid`, `pentagon`, `hexagon`, `octagon`, `wedge_round_rectangle_callout`, `star`, `flow_chart_*`, `cloud`, `cross`, `can`, `right_arrow`, `left_arrow`, `left_right_arrow`

### Connectors (Lines/Arrows)

```bash
# Create a connector between two items
curl -s -X POST -H "Authorization: Bearer $MIRO_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.miro.com/v2/boards/<BOARD_ID>/connectors" \
  -d '{
    "startItem": {"id": "<START_ITEM_ID>"},
    "endItem": {"id": "<END_ITEM_ID>"},
    "style": {
      "strokeColor": "#1a1a2e",
      "strokeWidth": "2.0",
      "strokeStyle": "normal",
      "startStrokeCap": "none",
      "endStrokeCap": "stealth"
    },
    "captions": [{"content": "label text", "position": "50%"}]
  }'
```

Stroke caps: `none`, `stealth`, `diamond`, `diamond_filled`, `oval`, `oval_filled`, `arrow`, `triangle`, `triangle_filled`, `erd_one`, `erd_many`, `erd_one_or_many`, `erd_only_one`, `erd_zero_or_many`, `erd_zero_or_one`

### Frames

```bash
# Create a frame to group items
curl -s -X POST -H "Authorization: Bearer $MIRO_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.miro.com/v2/boards/<BOARD_ID>/frames" \
  -d '{
    "data": {"title": "Frame Title", "format": "custom", "type": "freeform"},
    "position": {"x": 0, "y": 0},
    "geometry": {"width": 800, "height": 600}
  }'

# Get items inside a frame
curl -s -H "Authorization: Bearer $MIRO_ACCESS_TOKEN" \
  "https://api.miro.com/v2/boards/<BOARD_ID>/items?parent_item_id=<FRAME_ID>"
```

### Text Items

```bash
# Create a text item
curl -s -X POST -H "Authorization: Bearer $MIRO_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.miro.com/v2/boards/<BOARD_ID>/texts" \
  -d '{
    "data": {"content": "<p>Rich text with <strong>bold</strong> and <em>italic</em></p>"},
    "style": {"fillColor": "transparent", "textAlign": "left", "fontSize": "14", "color": "#1a1a2e"},
    "position": {"x": 0, "y": 0},
    "geometry": {"width": 300}
  }'
```

### Tags

```bash
# Create a tag
curl -s -X POST -H "Authorization: Bearer $MIRO_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.miro.com/v2/boards/<BOARD_ID>/tags" \
  -d '{"fillColor": "red", "title": "Urgent"}'

# Attach tag to an item
curl -s -X POST -H "Authorization: Bearer $MIRO_ACCESS_TOKEN" \
  "https://api.miro.com/v2/boards/<BOARD_ID>/items/<ITEM_ID>?tag_id=<TAG_ID>"
```

### Delete Items

```bash
# Delete any item
curl -s -X DELETE -H "Authorization: Bearer $MIRO_ACCESS_TOKEN" \
  "https://api.miro.com/v2/boards/<BOARD_ID>/items/<ITEM_ID>"
```

## Workflow

### 1. Extract Board Content

1. Fetch all items from the board
2. Group items by type (sticky notes, shapes, text, connectors)
3. Identify frames and their contained items
4. Parse connector relationships to understand flow/hierarchy
5. Output structured content (markdown, JSON, or summary)

### 2. Build a Diagram

1. Create a frame for the diagram area
2. Create shape nodes at calculated positions
3. Create connectors between related nodes
4. Add labels to connectors where needed
5. Return the board URL for viewing

### 3. Brainstorming Session Setup

1. Create frames for categories (e.g., "Ideas", "Priorities", "Actions")
2. Populate sticky notes from user input, color-coded by category
3. Add tags for categorization
4. Arrange items in a grid or cluster layout within frames

### Positioning Guide

- Miro uses a coordinate system with (0,0) at the center
- Typical sticky note size: 199x228 pixels
- Recommended spacing between items: 30-50 pixels
- Grid layout: increment x by (width + gap), increment y by (height + gap)
- Frames should have ~50px padding around contained items

## Output

- Board URL for direct access
- Structured content extracted from boards (markdown/JSON)
- Summary of created/modified items with their IDs
- Visual layout description of board contents
