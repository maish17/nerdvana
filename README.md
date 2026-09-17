# PLACEHOLDER_COMPANY_NAME — website

Astro 6 static site. Content lives in Markdown under `src/content/`.

## Requirements

Node >= 22.12.0 (see `.nvmrc`).

## Commands

| Command | Does |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Local dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the built site locally |
| `npm run check` | Type + content schema check |
| `npm run format` | Prettier |

## Structure

- `src/content.config.ts` — content collection schemas (schema changes go here)
- `src/content/solutions/` — one Markdown file per solution
- `src/data/site.ts` — nav, contact details, external app URL
- `src/layouts/` — page shells
- `src/pages/` — routes

## Status

Skeleton only. All copy, design tokens, and the `site` origin are placeholders
marked `TODO`. Login / enrollment / payments live on a separate origin owned by
the client; this site links out and implements no auth.

See `EDITING.md` for the content editing workflow.
