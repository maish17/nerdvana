# Nerdvana — website

Marketing and lead-generation site for Nerdvana. Static Astro site, content
edited in Keystatic, deployed on Netlify.

**Status.** The homepage, header, and footer follow the approved design, and the
brand tokens, font, and shared bands (stats, CTA) apply site-wide. Other pages'
sections are still structural. Copy not yet written is marked `[PLACEHOLDER]`
(stat figures use the design's `X,XXX+` notation). Most images are gray SVGs.

| Piece                      | What                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------ |
| Framework                  | Astro 7, `output: 'static'` — every page is plain HTML                               |
| CMS                        | Keystatic, `local` storage mode (edits files in this repo)                           |
| Styling                    | Tailwind CSS 4, reading brand values from `src/styles/tokens.css`                    |
| Font                       | Montserrat, self-hosted (`@fontsource-variable/montserrat`)                          |
| Hosting                    | Netlify (`@astrojs/netlify` adapter, `netlify.toml`)                                 |
| Forms                      | Netlify Forms (planning form on `/contact/`)                                         |
| JavaScript on public pages | Small inline scripts only: form attribution and the homepage carousel. No framework. |

React is installed **only** because the Keystatic admin needs it. It is loaded
only under `npm run dev`; production builds contain no React at all.

---

## Run it locally

Requires Node 22.12 or newer (`.nvmrc` pins the 22 line).

```bash
npm install
npm run dev
```

The site is at http://127.0.0.1:4321.

| Command          | Does                                                       |
| ---------------- | ---------------------------------------------------------- |
| `npm run dev`    | Local dev server **and** the Keystatic admin               |
| `npm run build`  | Production build into `dist/` — also validates all content |
| `npm run check`  | Type-check and content-schema check                        |
| `npm run format` | Prettier                                                   |

To look at the production build locally: `npm run build`, then
`python3 -m http.server 4322 --directory dist` and open http://localhost:4322.
(`astro preview` is not supported by the Netlify adapter.) On Netlify, every
pull request also gets its own deploy-preview URL.

## Editing content (Keystatic admin)

1. `npm run dev`
2. Open **http://127.0.0.1:4321/keystatic**
3. Edit and click **Save**. Keystatic writes the change straight into
   `src/content/` (text) and `public/images/` or `public/files/` (uploads).
4. Commit and push those file changes. Netlify rebuilds the site.

The admin only exists under `npm run dev`. In `local` mode it has no login, so
it is deliberately **not** deployed. To let the client edit from a browser
without a developer machine, switch to Keystatic's `github` storage mode (see
[Moving to GitHub storage](#moving-to-github-storage)).

What the editor can and can't do:

- **Fixed pages** (Home, the five Solutions pages, Pre-ETS, Programs, Impact,
  Resources, Parents, Homeschool, About, Contact, Policies) are _singletons_.
  Every word is editable, including headings, button text, and interface
  labels. Sections **cannot** be added, removed, or reordered: the section
  order is an approved business decision and lives in code.
- **Collections** (Programs, Case studies, Resources, Testimonials, FAQs,
  Offerings) are lists of entries. Programs and case studies get their own page.
- **Free-form pages** are the one place the editor builds a page: stack and
  reorder approved blocks (hero, proof strip, audience router, steps, program
  grid, case study grid, testimonial, FAQ accordion, CTA band, rich text). No
  arbitrary HTML.
- **Site settings** hold navigation, contact details, social links, and
  small interface labels.

If content is invalid, `npm run build` fails with a message naming the file and
field, and the live site is unchanged.

## ⚠ The schema is defined twice — keep both files in sync

| File                                             | Defines                                 |
| ------------------------------------------------ | --------------------------------------- |
| [`keystatic.config.tsx`](keystatic.config.tsx)   | What editors **can enter** in the admin |
| [`src/content.config.ts`](src/content.config.ts) | What the **build accepts**              |

Keystatic and Astro each need their own description of the content, and
neither can read the other's. **Any field added, removed, renamed, or re-typed
in one file must be changed in the other in the same commit.** This is the
most likely future bug.

Guardrails that make drift loud instead of silent:

- Both files use the same helper names (`heroSection`, `ctaSection`,
  `faqSection`, …) in the same order, so they can be read side by side.
- Option lists (audiences, formats, statuses…) and validation patterns live
  once, in [`src/lib/content-options.ts`](src/lib/content-options.ts), and
  both files import them.
- Astro objects are **strict**: a field Keystatic writes that Astro doesn't
  know fails the build with `Unrecognized key: "<field>"`. A field Astro
  requires that Keystatic doesn't provide fails as missing.

After changing either schema: run `npm run dev`, open the affected entry in
`/keystatic`, save it, then run `npm run build`. Both sides have then accepted
the same file.

## Adding a block type (free-form pages)

Example: a `logoWall` block.

1. **Keystatic** — `keystatic.config.tsx`, in the `pages` collection's
   `fields.blocks({...})`, add
   `logoWall: { label: 'Logo wall', schema: fields.object({...}) }`.
2. **Astro** — `src/content.config.ts`, in the `pages` collection's
   `z.discriminatedUnion(...)`, add `block('logoWall', obj({...}))` with the
   same fields. (Optional text → `optText()`; Keystatic omits empty text.)
3. **Component** — create `src/components/LogoWall.astro`. Plain `.astro`, no
   `client:*` directive. Section heading is an `<h2>`; any images need alt text.
4. **Renderer** — `src/components/BlockRenderer.astro`, add
   `case 'logoWall': return <LogoWall {...block.value} />;` (resolve any
   references in the `rendered` step above it, like `programGrid` does).
5. **Prove it** — add the block to `src/content/pages/example-page.yaml` (or
   via `/keystatic`), save once in the admin, then `npm run build`.

## Deploying (Netlify)

`netlify.toml` already sets the build command (`npm run build`), the publish
directory (`dist`), and the Node version (`22`).

1. In Netlify: **Add new site → Import an existing project**, pick this repo.
   The settings come from `netlify.toml`; leave the UI fields as detected.
2. **Forms → Enable form detection.** Netlify only picks up the planning form
   once detection is on. Then redeploy. Add submission email notifications
   under **Forms → Form notifications**.
3. Before launch, set the real origin in `astro.config.mjs` (`site:`) and in
   `public/robots.txt`. Canonical URLs and the sitemap use it.
4. Connect the domain under **Domain management**.

No environment variables or secrets are needed. Never put a secret in a
`PUBLIC_*` variable — those are inlined into the browser bundle.

The planning form posts to Netlify Forms and redirects to `/contact/thanks/`.
Hidden fields record `utm_source`, `utm_medium`, `utm_campaign` (captured on
the landing page for the browser session), `referrer`, and `source_page`. No
CRM is connected yet.

## Moving to GitHub storage

When the client should edit without running the project locally:

1. In `keystatic.config.tsx`, change `storage: { kind: 'local' }` to
   `storage: { kind: 'github', repo: '<owner>/<repo>' }`.
2. In `astro.config.mjs`, replace `devOnly(react())` and `devOnly(keystatic())`
   with `react()` and `keystatic()`. The admin then deploys to `/keystatic` as a
   Netlify function, behind GitHub login.
3. Follow Keystatic's GitHub-mode setup to create the GitHub App, and add its
   `KEYSTATIC_*` values as Netlify environment variables (never in the repo).

## Project structure

```
keystatic.config.tsx        Keystatic schema (twin of src/content.config.ts)
astro.config.mjs            Astro config; dev-only admin wiring
netlify.toml                Netlify build settings + Node version
src/
  content.config.ts         Astro schema (twin of keystatic.config.tsx)
  content/                  All content, as YAML written by Keystatic
    singletons/             One file per fixed page + site-settings
    programs/ case-studies/ resources/ testimonials/ faqs/ offerings/ pages/
  lib/
    content-options.ts      Shared option lists + validation patterns
    content.ts              Content helpers (singletons, references)
    markdoc.ts              Rich-text renderer (no raw HTML)
  components/               Hero, ProofStrip, AudienceRouter, … Form
  layouts/                  BaseLayout + shared page templates
  pages/                    Routes
  styles/
    tokens.css              Brand values: color, type, spacing, radius
    global.css              Tailwind setup, base styles, two button styles
public/
  images/ files/            Uploads managed by Keystatic
legacy/                     Earlier design prototype — not built (see its README)
```

## Built-in rules

These are enforced in code and the schemas. Keep them when design and copy
arrive:

- **Accessibility.** One `<h1>` per page and no skipped heading levels. There
  are landmarks and a skip link. Focus is always visible, and everything works
  by keyboard with no traps. The layout works at 320px and at 200% text size.
  Every image has alt text (`alt=""` only when decorative). Reduced motion is
  respected, and links are underlined so nothing is conveyed by color alone.
- **Hero** is one static composition. Never a carousel.
- **Carousel** (homepage card carousel) never autoplays. Without JavaScript it is
  a plain scrollable list. Arrows and dots are real buttons, and tabbing to a
  card centers it. Every card image needs alt text, and buttons can't say
  "Learn more".
- **Audience router** has 3–6 cards with descriptive labels. "Learn more" is
  rejected.
- **FAQ accordion** uses native `<details>`/`<summary>`, with no JavaScript.
- **Testimonials** need name, role, and organization, and appear only with
  "Permission on file" checked.
- **Buttons** come in two styles: filled (`btn-primary`) and outline
  (`btn-secondary`). Inside a purple or dark band (`.on-brand` / `.on-dark`) they
  invert to white automatically. The carousel's dark card buttons are part of
  that component, not a third style.
- **Brand color** `--nv-color-primary` (#91399c, from the approved design) has
  6.4:1 contrast with white. Change it in `tokens.css` only.
- **Contextual CTAs** have one action. Only the homepage CTA may add a second,
  outline button.
- **Free-form page slugs** can't reuse a fixed route (`about`, `programs`, …).
