# Standup Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a standup notes widget that reads and writes daily bullet-point notes to a Notion page via toggle blocks.

**Architecture:** A new `standup` plugin (backend + frontend) follows the exact same pattern as existing plugins — a default-exported object with `id`, `label`, `env`, and `routes`. Pure helper functions are exported separately for testing. The frontend widget uses a textarea (one line per bullet) with an explicit Save button.

**Tech Stack:** Node.js/Express, `@notionhq/client` SDK (already installed), vanilla JS frontend, vitest

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `dashboard.config.js` | Add `standup.pageId` config key |
| Create | `plugins/standup/index.js` | Backend plugin — Notion API, routes |
| Create | `public/widgets/standup/widget.js` | Frontend widget — textarea UI |
| Create | `tests/plugins/standup.test.js` | Unit tests for pure helpers |
| Modify | `README.md` | Document setup + config reference |

---

## Task 1: Add standup config

**Files:**
- Modify: `dashboard.config.js`

- [ ] **Add the standup section to `dashboard.config.js`** — insert after the `gitlab` block and before `disabled`:

```js
  standup: {
    // ID of the Notion page to append standup notes to.
    // Find it in the page URL: notion.so/<PAGE_ID>
    pageId: null,
  },
```

The full `disabled` line stays as-is. No other changes.

- [ ] **Commit**

```bash
git add dashboard.config.js
git commit -m "config: add standup.pageId placeholder"
```

---

## Task 2: Plugin helper functions + tests

**Files:**
- Create: `plugins/standup/index.js` (helpers only — routes added in Task 3)
- Create: `tests/plugins/standup.test.js`

- [ ] **Write the failing tests** — create `tests/plugins/standup.test.js`:

```js
import { describe, it, expect } from "vitest";
import { todayKey, findToggleForDate, extractBullets } from "../../plugins/standup/index.js";

describe("todayKey", () => {
  it("returns YYYY-MM-DD format", () => {
    expect(todayKey()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("matches the current local date", () => {
    const d = new Date();
    const expected = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0"),
    ].join("-");
    expect(todayKey()).toBe(expected);
  });
});

describe("findToggleForDate", () => {
  const blocks = [
    {
      type: "toggle",
      id: "block-1",
      toggle: { rich_text: [{ plain_text: "[2026-05-25]" }] },
    },
    {
      type: "paragraph",
      id: "block-2",
      paragraph: { rich_text: [{ plain_text: "some text" }] },
    },
    {
      type: "toggle",
      id: "block-3",
      toggle: { rich_text: [{ plain_text: "[2026-05-24]" }] },
    },
  ];

  it("returns the toggle matching the given date", () => {
    expect(findToggleForDate(blocks, "2026-05-25").id).toBe("block-1");
  });

  it("returns null when no toggle matches", () => {
    expect(findToggleForDate(blocks, "2026-05-20")).toBeNull();
  });

  it("ignores non-toggle blocks", () => {
    expect(findToggleForDate(blocks, "some text")).toBeNull();
  });

  it("returns null for empty array", () => {
    expect(findToggleForDate([], "2026-05-25")).toBeNull();
  });
});

describe("extractBullets", () => {
  const children = [
    {
      type: "bulleted_list_item",
      bulleted_list_item: { rich_text: [{ plain_text: "first note" }] },
    },
    {
      type: "paragraph",
      paragraph: { rich_text: [{ plain_text: "ignored" }] },
    },
    {
      type: "bulleted_list_item",
      bulleted_list_item: {
        rich_text: [{ plain_text: "second " }, { plain_text: "note" }],
      },
    },
  ];

  it("extracts text from bulleted_list_item blocks", () => {
    expect(extractBullets(children)).toEqual(["first note", "second note"]);
  });

  it("ignores non-bullet blocks", () => {
    expect(extractBullets(children)).not.toContain("ignored");
  });

  it("returns empty array when no bullet blocks present", () => {
    expect(extractBullets([children[1]])).toEqual([]);
  });

  it("concatenates multiple rich_text segments", () => {
    expect(extractBullets([children[2]])[0]).toBe("second note");
  });
});
```

- [ ] **Run tests — expect them to fail** (module not found):

```bash
npm test -- tests/plugins/standup.test.js
```

Expected: `Error: Cannot find module '../../plugins/standup/index.js'`

- [ ] **Create `plugins/standup/index.js`** with the helpers (routes placeholder added in Task 3):

```js
import { Client } from "@notionhq/client";
import config from "../../dashboard.config.js";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const pageId = config.standup?.pageId;

export function todayKey() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

export function findToggleForDate(blocks, dateKey) {
  return (
    blocks.find(
      (b) =>
        b.type === "toggle" &&
        b.toggle?.rich_text?.[0]?.plain_text === `[${dateKey}]`
    ) ?? null
  );
}

export function extractBullets(children) {
  return children
    .filter((b) => b.type === "bulleted_list_item")
    .map((b) =>
      b.bulleted_list_item.rich_text.map((t) => t.plain_text).join("")
    );
}

async function fetchAllChildren(blockId) {
  const blocks = [];
  let cursor;
  do {
    const res = await notion.blocks.children.list({
      block_id: blockId,
      page_size: 100,
      ...(cursor ? { start_cursor: cursor } : {}),
    });
    blocks.push(...res.results);
    cursor = res.has_more ? res.next_cursor : null;
  } while (cursor);
  return blocks;
}

export default {
  id: "standup",
  label: "Standup",
  env: ["NOTION_TOKEN"],
  routes: [],
};
```

- [ ] **Run tests — expect them to pass**:

```bash
npm test -- tests/plugins/standup.test.js
```

Expected: all 10 tests pass.

- [ ] **Commit**

```bash
git add plugins/standup/index.js tests/plugins/standup.test.js
git commit -m "feat: standup plugin helpers + tests"
```

---

## Task 3: Plugin routes (GET + POST)

**Files:**
- Modify: `plugins/standup/index.js` — replace `routes: []` with full GET + POST handlers

- [ ] **Replace `routes: []` in `plugins/standup/index.js`** with:

```js
  routes: [
    {
      method: "GET",
      path: "/api/standup",
      handler: async (_req, res) => {
        if (!pageId)
          return res
            .status(400)
            .json({ error: "standup.pageId not set in dashboard.config.js" });
        try {
          const children = await fetchAllChildren(pageId);
          const toggle = findToggleForDate(children, todayKey());
          if (!toggle) return res.json({ bullets: [] });
          const toggleChildren = await fetchAllChildren(toggle.id);
          res.json({ bullets: extractBullets(toggleChildren) });
        } catch (err) {
          console.error("[standup] GET error:", err.message);
          res.status(500).json({ error: err.message });
        }
      },
    },
    {
      method: "POST",
      path: "/api/standup",
      handler: async (req, res) => {
        if (!pageId)
          return res
            .status(400)
            .json({ error: "standup.pageId not set in dashboard.config.js" });
        const { bullets } = req.body;
        if (!Array.isArray(bullets))
          return res.status(400).json({ error: "bullets must be an array" });

        const lines = bullets.map((s) => s.trim()).filter(Boolean);
        const bulletBlocks = lines.map((text) => ({
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: text } }],
          },
        }));

        try {
          const children = await fetchAllChildren(pageId);
          const toggle = findToggleForDate(children, todayKey());

          if (toggle) {
            const existing = await fetchAllChildren(toggle.id);
            await Promise.all(
              existing.map((b) => notion.blocks.delete({ block_id: b.id }))
            );
            if (lines.length) {
              await notion.blocks.children.append({
                block_id: toggle.id,
                children: bulletBlocks,
              });
            }
          } else {
            await notion.blocks.children.append({
              block_id: pageId,
              children: [
                {
                  object: "block",
                  type: "toggle",
                  toggle: {
                    rich_text: [
                      {
                        type: "text",
                        text: { content: `[${todayKey()}]` },
                      },
                    ],
                    children: bulletBlocks,
                  },
                },
              ],
            });
          }
          res.json({ ok: true });
        } catch (err) {
          console.error("[standup] POST error:", err.message);
          res.status(500).json({ error: err.message });
        }
      },
    },
  ],
```

- [ ] **Run tests to confirm helpers still pass**:

```bash
npm test -- tests/plugins/standup.test.js
```

Expected: all 10 tests pass.

- [ ] **Commit**

```bash
git add plugins/standup/index.js
git commit -m "feat: standup GET and POST routes"
```

---

## Task 4: Frontend widget

**Files:**
- Create: `public/widgets/standup/widget.js`

- [ ] **Create `public/widgets/standup/widget.js`**:

```js
export default {
  id: "standup",
  title: "Standup",
  icon: "📝",
  size: "normal",

  async load() {
    const res = await fetch("/api/standup");
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  render(data, el) {
    if (data.error) {
      el.innerHTML = `<p class="widget-error">${data.error}</p>`;
      return;
    }

    const today = new Date().toLocaleDateString("en-SG", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const text = (data.bullets || []).join("\n");

    el.innerHTML = `
      <style>
        .standup-wrap { display: flex; flex-direction: column; height: 100%; }
        .standup-date { font-size: .72rem; color: var(--text-muted); margin-bottom: .6rem; letter-spacing: .02em; flex-shrink: 0; }
        .standup-textarea {
          flex: 1;
          width: 100%;
          min-height: 80px;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          color: var(--text);
          font-size: .85rem;
          line-height: 1.6;
          padding: .5rem .7rem;
          resize: none;
          outline: none;
          font-family: inherit;
        }
        .standup-textarea:focus { border-color: var(--accent); }
        .standup-footer {
          display: flex;
          align-items: center;
          gap: .6rem;
          margin-top: .5rem;
          flex-shrink: 0;
        }
        .standup-hint { font-size: .7rem; color: var(--text-muted); flex: 1; }
        .standup-status { font-size: .72rem; color: var(--text-muted); }
        .standup-save {
          background: var(--accent-dim);
          color: var(--accent);
          border: 1px solid var(--accent);
          border-radius: var(--radius-sm);
          padding: .35rem .8rem;
          font-size: .825rem;
          cursor: pointer;
          transition: background .15s;
          flex-shrink: 0;
        }
        .standup-save:hover { background: #818cf840; }
        .standup-save:disabled { opacity: .5; cursor: default; }
      </style>
      <div class="standup-wrap">
        <p class="standup-date">${today}</p>
        <textarea
          class="standup-textarea"
          placeholder="What did you do yesterday?&#10;What will you do today?&#10;Any blockers?"
        >${text}</textarea>
        <div class="standup-footer">
          <span class="standup-hint">One note per line → saves as bullets</span>
          <span class="standup-status"></span>
          <button class="standup-save">Save</button>
        </div>
      </div>`;

    const textarea = el.querySelector(".standup-textarea");
    const saveBtn = el.querySelector(".standup-save");
    const status = el.querySelector(".standup-status");

    saveBtn.addEventListener("click", async () => {
      saveBtn.disabled = true;
      const bullets = textarea.value
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      try {
        const res = await fetch("/api/standup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bullets }),
        });
        const result = await res.json();
        if (result.error) throw new Error(result.error);
        status.textContent = "Saved ✓";
        setTimeout(() => {
          status.textContent = "";
        }, 2500);
      } catch (err) {
        status.textContent = "Error saving";
        console.error("[standup] save failed:", err);
      } finally {
        saveBtn.disabled = false;
      }
    });
  },
};
```

- [ ] **Commit**

```bash
git add public/widgets/standup/widget.js
git commit -m "feat: standup frontend widget"
```

---

## Task 5: README update

**Files:**
- Modify: `README.md`

- [ ] **Add standup setup section** — insert after the `### Reminders` section and before `### GitLab`:

```markdown
### Standup

Appends daily standup notes to a Notion page as toggle blocks (one toggle per day, bullet items as children). Reuses the existing `NOTION_TOKEN` — no new env var needed.

1. Create a dedicated Notion page for your standup log (e.g. "Daily Standup")
2. Copy its ID from the URL: `notion.so/`**`<PAGE_ID>`**`?v=...`
3. Grant your Notion connection access to that page under **Content Access**
4. Set `standup.pageId` in `dashboard.config.js`

```js
standup: {
  pageId: "your-page-id-here",
},
```

Each day's entry is appended as a toggle block `[YYYY-MM-DD]` with bullet children. History is browsed directly in Notion.
```

- [ ] **Add standup config reference section** — insert after the `### \`apple-reminders\`` section and before `### \`gitlab\``:

````markdown
### `standup`

```js
standup: {
  pageId: "your-notion-page-id",
},
```

| Key | Type | Description |
|-----|------|-------------|
| `pageId` | `string \| null` | ID of the Notion page to write standup notes to. Copy from the page URL. `null` disables the widget even if `NOTION_TOKEN` is set. |
````

- [ ] **Update the valid plugin IDs line** in the `### \`disabled\`` section — add `"standup"`:

```
Valid IDs: `"notion"`, `"calendar"`, `"apple-reminders"`, `"google-tasks"`, `"standup"`, `"news"`, `"gitlab"`, or any custom plugin ID you've added.
```

- [ ] **Update the project structure tree** — add standup to both `plugins/` and `public/widgets/`:

```
├── plugins/
│   ├── apple-reminders/
│   │   ├── index.js
│   │   ├── reminders-cli.swift
│   │   └── reminders-cli
│   ├── calendar/index.js
│   ├── gitlab/index.js
│   ├── google-tasks/index.js
│   ├── news/index.js
│   ├── notion/index.js
│   └── standup/index.js
└── public/
    └── widgets/
        ├── apple-reminders/widget.js
        ├── calendar/widget.js
        ├── gitlab/widget.js
        ├── google-tasks/widget.js
        ├── news/widget.js
        ├── notion/widget.js
        └── standup/widget.js
```

- [ ] **Commit and push**

```bash
git add README.md
git -c user.email=davidcjw@gmail.com -c user.name="David Chong" commit -m "docs: add standup widget setup and config reference"
git push origin master
```

---

## Self-Review Checklist

- [x] `standup.pageId` config → Task 1
- [x] `todayKey()` local date → exported in Task 2, tested
- [x] `findToggleForDate()` → exported in Task 2, tested
- [x] `extractBullets()` → exported in Task 2, tested
- [x] `fetchAllChildren()` pagination → Task 2 (internal, uses SDK)
- [x] GET route: find toggle, return bullets → Task 3
- [x] POST route: create or update toggle → Task 3
- [x] `pageId` not set → 400 error in both routes → Task 3
- [x] Frontend textarea, save, status feedback → Task 4
- [x] Function names consistent across tasks (`todayKey`, `findToggleForDate`, `extractBullets`, `fetchAllChildren`, `bulletBlocks`)
- [x] README setup + config ref + valid IDs + tree → Task 5
