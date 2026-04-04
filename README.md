# Bracket Generator

A bracket visualization web app for Taekwondo (AAU) tournaments. Renders double-sided single-elimination brackets where competitors enter from both sides and converge toward a champion slot in the center.

## Features

- **Double-sided bracket** — left and right sides converge to a center champion match
- **Auto-sizing** — bracket scales to the next power of 2 (e.g. 7 competitors → 8-slot bracket)
- **BYE handling** — byes are distributed evenly across both sides
- **Drag-and-drop** — swap any two competitor positions by dragging
- **Shuffle** — re-randomize all matchups with one click
- **Multi-division support** — load a single division or an array of divisions, switch between them with a dropdown
- **Background image** — upload a custom background image
- **Print** — print to US Letter landscape paper with clean formatting

## Stack

React, TypeScript, Vite, Tailwind CSS, @dnd-kit/core

## Getting Started

```bash
npm install
npm run dev
```

Then open http://localhost:5173 and click **Load JSON** to import bracket data.

## Input Format

Accepts JSON exported from the AAU tournament pipeline (`tkd_bracket_system`).

**Single division:**

```json
{
  "division": "World Class Cadets - Female Under 33 Black Belt",
  "competitors": [
    { "id": "1", "name": "Alice Kim", "school": "Tigers ATA", "photoUrl": "" },
    { "id": "2", "name": "Bob Lee", "school": "Dragon TKD", "photoUrl": "" }
  ]
}
```

**Multi-division (array):**

```json
[
  { "division": "...", "competitors": [...] },
  { "division": "...", "competitors": [...] }
]
```

A sample file is included at `sample-bracket.json`.

## Print

Click the **Print** button or use Ctrl/Cmd+P. The bracket prints in landscape orientation on US Letter paper with controls hidden.
