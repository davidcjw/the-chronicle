# The Chronicle — local extensible web dashboard with draggable/resizable widgets (Notion, Google Calendar, Apple Reminders, GitLab MRs, news feeds).

## Installation / Setup

```bash
cd dashboard
npm install
cp .env.example .env   # fill in keys for desired widgets
npm run dev            # → http://localhost:3000
```

Plugins with missing env vars are silently skipped — only configure what you need.

## Folder Structure

```
/plugins        # individual widget/plugin implementations
/lib            # shared library code
/public         # frontend static assets (vanilla JS, no build step)
/docs           # documentation and preview images
/tests          # test files
/.claude        # Claude agent config
server.js       # Express entry point
dashboard.config.js  # widget configuration (topics, calendar IDs, statuses, etc.)
```

## Executable Commands

```bash
npm run dev        # start with --watch (auto-restart on changes)
npm run start      # production start
npm run test       # run tests with vitest (single run)
npm run test:watch # run vitest in watch mode
```

## Coding/Development Guidelines

- No build step — vanilla JS frontend, Node.js/Express backend with ES modules (`"type": "module"`)
- Widget configuration lives in `dashboard.config.js`, not in `.env`
- Env vars control credentials only; feature config (filters, IDs, limits) goes in `dashboard.config.js`
- Plugins must degrade gracefully when their required env vars are absent (silently skip at startup)

## Testing Instructions

```bash
npm run test         # vitest single run
npm run test:watch   # vitest watch mode
```

Tests live in `/tests`.

## Do-Not Rules

- Do not add a frontend build step — the project intentionally requires none
- Do not commit `tokens.json` (OAuth tokens, already gitignored)
- Do not commit `.env` (already gitignored)
- Do not require env vars inside plugin code without allowing silent skip when vars are missing
