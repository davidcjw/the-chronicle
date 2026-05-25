# Standup Notes Widget — Design Spec

_Date: 2026-05-25_

## Overview

A dashboard widget for writing and persisting daily standup notes to a Notion page. Notes are stored as toggle blocks (one per day) with bullet list items as children. The widget shows today's entry only; historical entries are browsed directly in Notion.

---

## Architecture

Two new files; one config addition. No changes to existing plugins or shared code.

```
plugins/standup/index.js          — Express plugin (backend)
public/widgets/standup/widget.js  — Widget (frontend)
dashboard.config.js               — add standup.pageId
```

---

## Data Model

Notes are stored in a flat Notion page (not a database). Each day is a **toggle block** whose children are `bulleted_list_item` blocks:

```
[2026-05-25]        ← toggle block (plain text heading)
  • note one        ← bulleted_list_item child
  • note two
[2026-05-24]
  • ...
```

- Entries append to the **end** of the page (chronological order, oldest first).
- The widget reads and writes today's toggle only.
- History is browsed in Notion directly — the page is human-readable as-is.

---

## Configuration

`dashboard.config.js`:

```js
standup: {
  pageId: "your-notion-page-id",  // copy from the Notion page URL
},
```

No new env vars. Reuses `NOTION_TOKEN` already required by the Notion tasks plugin. If `NOTION_TOKEN` is missing, the plugin is skipped at startup (standard plugin eligibility check). If `pageId` is not set, the API returns a descriptive error surfaced in the widget.

---

## API

### `GET /api/standup`

Paginates through the standup page's children, finds the toggle block whose text equals `[YYYY-MM-DD]` for today (local date), fetches its children, and returns the bullet text.

**Response:**
```json
{ "bullets": ["note one", "note two"] }
```
Returns `{ "bullets": [] }` if no entry exists for today.

---

### `POST /api/standup`

**Body:** `{ "bullets": ["note one", "note two"] }`

- Empty/whitespace lines are stripped before saving.
- If today's toggle **exists**: delete all its children, append new `bulleted_list_item` blocks to it.
- If today's toggle **does not exist**: append a new toggle block (with children) to the page.

**Response:** `{ "ok": true }` on success, `{ "error": "..." }` on failure.

---

## Widget UI

- **Header:** today's date (e.g. "Monday, 25 May 2026")
- **Textarea:** one line per bullet; placeholder text prompts Yesterday / Today / Blockers
- **Footer:** "One note per line → saves as bullets" hint · status text · Save button
- Textarea fills available card height (`flex: 1`)
- `size: "normal"` (4 columns by default; user can resize)

**Interactions:**
- On load: `GET /api/standup` populates the textarea with today's bullets joined by newlines
- Save button: splits textarea by newline, strips blanks, `POST /api/standup`
- On success: brief "Saved ✓" status (clears after 2.5 s)
- On failure: "Error saving" status; button re-enables; textarea content preserved

---

## Error Handling

| Condition | Behaviour |
|-----------|-----------|
| `pageId` not configured | Widget shows config error message |
| `NOTION_TOKEN` missing | Plugin skipped at startup (not loaded) |
| Notion API error on GET | Widget shows error state via standard `widget-error` class |
| Notion API error on POST | Inline "Error saving" status; no data loss |

---

## Out of Scope

- History browsing in the widget (use Notion directly)
- Structured Yesterday / Today / Blockers fields (free-form textarea is intentional)
- Auto-save on blur (explicit Save keeps the round-trip predictable)
- Prepending entries (append-to-end is reliable with the Notion API; newest-first ordering not needed since the widget never shows history)
