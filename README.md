# Nerdvana — website

The marketing and lead-generation site for Nerdvana (STEM education, Edinburg,
Texas). It's built with Astro, edited in Keystatic, and hosted on Netlify.

This README covers four things:

1. [What's here and how it fits together](#1-how-it-works)
2. [What you can change in the editor vs. what needs code](#4-what-you-can-edit-vs-what-needs-code)
3. [How to extend it](#6-developer-guide)
4. [A step-by-step roadmap](#7-roadmap-from-someone-elses-repo-to-a-site-ready-to-host)
   from "I just opened someone else's repo" to "this site is ready to host"

> **Current status: skeleton with an approved homepage.**
> The homepage, header, footer, colours and font follow the approved design.
> Every other page works end to end (routes, content, forms) but uses plain
> structural styling. Copy that hasn't been written yet is marked
> `[PLACEHOLDER]`, and most images are grey placeholder SVGs. Nothing is
> deployed yet.

---

## 0. Quick start

You need **Node 22.12 or newer**. Check with `node -v`. If you use nvm, run
`nvm use`, which reads `.nvmrc`.

```bash
git clone git@github.com:maish17/nerdvana.git
cd nerdvana
git checkout skeleton        # only if it hasn't been merged into main yet
npm install
npm run dev
```

| URL                             | What                                               |
| ------------------------------- | -------------------------------------------------- |
| http://127.0.0.1:4321           | The site                                           |
| http://127.0.0.1:4321/keystatic | The content editor (only while `npm run dev` runs) |

Stop the server with **Ctrl+C**.

| Command          | Does                                                                  |
| ---------------- | --------------------------------------------------------------------- |
| `npm run dev`    | Dev server + Keystatic editor. Changes appear immediately.            |
| `npm run build`  | Production build into `dist/`. **Also validates every content file.** |
| `npm run check`  | TypeScript and content-schema check                                   |
| `npm run format` | Prettier (code only — content YAML is formatted by Keystatic)         |

To view the production build locally, run `npm run build`, then
`python3 -m http.server 4322 --directory dist`, then open
http://localhost:4322. (`astro preview` doesn't work with the Netlify adapter.)

---

## 1. How it works

```
   You edit in Keystatic (/keystatic)          or a developer edits files
                 │                                         │
                 ▼                                         ▼
   src/content/**/*.yaml  +  public/images, public/files      src/**
                 │                                         │
                 └──────────────► npm run build ◄──────────┘
                                       │   validates content against the schema,
                                       │   fails loudly if anything is wrong
                                       ▼
                                dist/  (plain HTML + CSS)
                                       │
                                       ▼
                       Netlify (rebuilds on every push to main)
```

- **The site is static.** Every page is plain HTML generated at build time.
  There's no database or server and no logged-in state. A page can't break at
  runtime because of bad content: bad content fails the _build_, and the live
  site stays as it was.
- **Content is files in this repo.** Keystatic is a friendly form over YAML
  files in `src/content/`. Every content change is a normal git commit.
- **Keystatic runs only on your computer, for now.** It's in `local` mode: it
  edits files on disk, has no login, and is deliberately **not deployed**.
  [Moving to GitHub mode](#moving-keystatic-to-github-mode) lets the client
  edit from a browser without a developer machine.
- **No JavaScript framework on public pages.** React is installed only because
  the Keystatic editor needs it, and it's loaded only under `npm run dev`. The
  public site has three small inline scripts: form attribution (on every
  page), the planning form, and the homepage carousel.

### The stack

| Piece     | What                                                               |
| --------- | ------------------------------------------------------------------ |
| Framework | Astro 7 (`output: 'static'`)                                       |
| CMS       | Keystatic (`local` storage)                                        |
| Styling   | Tailwind CSS 4, reading design tokens from `src/styles/tokens.css` |
| Font      | Montserrat, self-hosted (`@fontsource-variable/montserrat`)        |
| Rich text | Markdoc (Keystatic's format; raw HTML not allowed)                 |
| Hosting   | Netlify (`@astrojs/netlify` adapter, `netlify.toml`)               |
| Forms     | Netlify Forms (planning form on `/contact/`), no CRM yet           |
| Sitemap   | `@astrojs/sitemap` (generated at build)                            |

---

## 2. Repo map

```
README.md                    This file
keystatic.config.tsx         ★ Keystatic schema — what editors can enter
astro.config.mjs             Astro config: site URL, adapter, dev-only editor wiring
netlify.toml                 Netlify build command, publish dir, Node 22
.nvmrc / package.json        Node version, scripts, dependencies

src/
  content.config.ts          ★ Astro schema — what the build accepts (twin of keystatic.config.tsx)
  content/                   ALL CONTENT (YAML, written by Keystatic)
    singletons/              One file per fixed page, plus site-settings.yaml
    programs/  case-studies/  resources/  testimonials/  faqs/  offerings/  pages/
  lib/
    content-options.ts       Shared dropdown options + validation rules (used by both schemas)
    content.ts               Helpers: load a page's content, resolve references
    markdoc.ts               Rich-text renderer (safe links, no raw HTML)
    ids.ts, types.ts         Small utilities
  components/                Reusable building blocks (see §6)
  layouts/
    BaseLayout.astro         <html>, <head>, skip link, header, footer — every page
    SolutionPage.astro       Shared template: 5 Solutions pages + Pre-ETS
    FamilyPage.astro         Shared template: Parents + Homeschool
  pages/                     ★ ROUTES — one file per URL (see §3)
  styles/
    tokens.css               ★ Brand values: colours, type, spacing, radius, shadows
    global.css               Tailwind setup, base styles, buttons, bands

public/
  images/  files/            Uploads (managed by Keystatic)
  favicon.svg, robots.txt    Static files served as-is

legacy/design-prototype/     Earlier homepage prototype + original assets. Not built.
```

★ = the files you'll touch most.

---

## 3. Pages and routes

Every URL is a file in `src/pages/`. URLs are lowercase, hyphenated and end
with a slash.

| URL                                 | File                                    | Content in Keystatic                                            | Design status            |
| ----------------------------------- | --------------------------------------- | --------------------------------------------------------------- | ------------------------ |
| `/`                                 | `index.astro`                           | Fixed pages → **Home**                                          | ✅ Approved design       |
| `/solutions/`                       | `solutions/index.astro`                 | Fixed pages → Solutions overview                                | Structural               |
| `/solutions/district-partnerships/` | `solutions/district-partnerships.astro` | Fixed pages → Solutions: District partnerships                  | Structural               |
| `/solutions/ace-expanded-learning/` | `solutions/ace-expanded-learning.astro` | Fixed pages → Solutions: ACE expanded learning                  | Structural               |
| `/solutions/cte-stem-innovation/`   | `solutions/cte-stem-innovation.astro`   | Fixed pages → Solutions: CTE & STEM innovation                  | Structural               |
| `/solutions/charter-networks/`      | `solutions/charter-networks.astro`      | Fixed pages → Solutions: Charter networks                       | Structural               |
| `/solutions/independent-schools/`   | `solutions/independent-schools.astro`   | Fixed pages → Solutions: Independent schools                    | Structural               |
| `/workforce/pre-ets/`               | `workforce/pre-ets.astro`               | Fixed pages → Workforce: Pre-ETS                                | Structural               |
| `/programs/`                        | `programs/index.astro`                  | Fixed pages → Programs overview (lists all programs)            | Structural               |
| `/programs/<slug>/`                 | `programs/[slug].astro`                 | Content → **Programs** (one page per entry)                     | Structural               |
| `/impact/`                          | `impact/index.astro`                    | Fixed pages → Impact hub (lists all case studies)               | Structural               |
| `/impact/<slug>/`                   | `impact/[slug].astro`                   | Content → **Case studies** (one page per entry)                 | Structural               |
| `/resources/`                       | `resources.astro`                       | Fixed pages → Resources index (lists all resources)             | Structural               |
| `/families/parents/`                | `families/parents.astro`                | Fixed pages → Families: Parents (lists offerings)               | Structural               |
| `/families/homeschool/`             | `families/homeschool.astro`             | Fixed pages → Families: Homeschool (lists offerings)            | Structural               |
| `/about/`                           | `about.astro`                           | Fixed pages → About                                             | Structural               |
| `/contact/`                         | `contact/index.astro`                   | Fixed pages → Planning & contact                                | Structural               |
| `/contact/thanks/`                  | `contact/thanks.astro`                  | Planning & contact → _Thank-you page_                           | Structural (not indexed) |
| `/policies/`                        | `policies.astro`                        | Fixed pages → Policies (`#privacy`, `#accessibility`, `#other`) | Structural               |
| `/<slug>/`                          | `[...slug].astro`                       | Free-form pages (block builder)                                 | Structural               |
| _(404)_                             | `404.astro`                             | Site settings → Interface labels                                | Structural               |

"Structural" means the page works and every word is editable, but it uses the
shared components with plain styling. The header, footer, font, colours, and
the purple stats and CTA bands already match the approved design on every
page.

---

## 4. What you can edit vs. what needs code

### Editable in Keystatic (no code)

| Area                 | What you can change                                                                                                                                                                                                                                                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Fixed pages** (16) | **Every word and image** on the page: headings, paragraphs, buttons and links, images and alt text, SEO title and description. You can also choose which programs, case studies, FAQs and testimonial each page features.                                                                                                                        |
| **Collections**      | Add, edit and delete **Programs, Case studies, Resources, Testimonials, FAQs and Offerings**. Programs and case studies get their own pages automatically, and lists update automatically.                                                                                                                                                       |
| **Free-form pages**  | Create new pages at `/<slug>/` by stacking approved blocks in any order: hero, proof strip, audience router, implementation steps, program grid, case study grid, testimonial, FAQ accordion, CTA band, rich text.                                                                                                                               |
| **Site settings**    | Site name; header logo; main nav (up to 8 links); optional header button; footer tagline, location, link columns and copyright (`{year}` fills in automatically); contact email, phone and address; social links; and **interface labels** such as the skip link, menu button, carousel buttons, offering and resource labels, and the 404 text. |
| **Contact page**     | Every form label, the required marker, the submit button, and the thank-you page text.                                                                                                                                                                                                                                                           |
| **Uploads**          | Images (with alt text) and PDFs, through the image and file fields.                                                                                                                                                                                                                                                                              |

What the editor deliberately **can't** do:

- Reorder, add or remove sections on a fixed page. The section order is an
  approved business decision and lives in code.
- Write raw HTML, scripts, or arbitrary layouts.
- Change colours, fonts or spacing.

### Needs a developer (hard-coded)

| Thing                                                                                                                                                                                                     | Where it lives                                                                                            |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Which sections a fixed page has, and their order**                                                                                                                                                      | `src/pages/*.astro` and `src/layouts/SolutionPage.astro` / `FamilyPage.astro`, **plus both schema files** |
| **Which pages exist, and their URLs**                                                                                                                                                                     | File names in `src/pages/`                                                                                |
| **Colours, font, type scale, spacing, radius, shadows**                                                                                                                                                   | `src/styles/tokens.css`                                                                                   |
| **How every component looks**                                                                                                                                                                             | `src/components/*.astro`, `src/styles/global.css`                                                         |
| **Dropdown option lists** (audiences, program formats, resource types, offering statuses, social platforms) and their display labels                                                                      | `src/lib/content-options.ts`                                                                              |
| **Planning form fields and dropdown options.** Persona reuses the audience list; the timeline and funding options are `[PLACEHOLDER]` text.                                                               | `src/components/Form.astro`, `src/lib/content-options.ts`                                                 |
| **Form name (`planning`) and redirect** (`/contact/thanks/`)                                                                                                                                              | `src/components/Form.astro`                                                                               |
| **Reserved slugs** that free-form pages can't use                                                                                                                                                         | `src/lib/content-options.ts`                                                                              |
| **Production domain** (`https://example.com` placeholder)                                                                                                                                                 | `astro.config.mjs` (`site:`) and `public/robots.txt`                                                      |
| **Favicon** (currently a grey square)                                                                                                                                                                     | `public/favicon.svg`                                                                                      |
| **Page language** (`lang="en"`)                                                                                                                                                                           | `src/layouts/BaseLayout.astro`                                                                            |
| **List sort order.** Programs and case studies sort by title; resources sort by newest first.                                                                                                             | The page files that list them                                                                             |
| **Validation rules**, such as 3–6 audience-router cards, no "Learn more" labels, 70/160/300-character limits (SEO title, SEO description, program summary), and testimonials needing "Permission on file" | Both schema files + `content-options.ts`                                                                  |
| **Social share image** (`og:image`)                                                                                                                                                                       | Not implemented yet. `src/components/SEO.astro`.                                                          |
| **Analytics**                                                                                                                                                                                             | None yet. CTAs already carry `data-cta-source` attributes for later.                                      |

### Where the placeholder content is

```bash
grep -rli "placeholder" src/content src/lib/content-options.ts
```

Other filler from the design mock to replace: the stat figures (`X,XXX+`,
`XX`), "Template Header", "Body text…", "Template button" and "Template Link".

The **example entries** exist only to prove the templates work. Replace or
delete them during the content pass:

| Entry                                                     | File                                                       |
| --------------------------------------------------------- | ---------------------------------------------------------- |
| Program "Drone Flight & Autonomy"                         | `src/content/programs/drone-flight-autonomy.yaml`          |
| Case study "Example ISD Summer Program"                   | `src/content/case-studies/example-isd-summer-program.yaml` |
| Resource, testimonial, 2 FAQs, offering                   | the matching folders in `src/content/`                     |
| Free-form page `/example-page/` (uses all 10 block types) | `src/content/pages/example-page.yaml`                      |

---

## 5. Editing guide (for content editors)

### Make a change

1. `npm run dev`, then open http://127.0.0.1:4321/keystatic.
2. Pick a page or entry from the sidebar, edit it, and click **Save**.
   Keystatic writes the files immediately, and the site tab updates.
3. Run `npm run build` to double-check. It names the exact file and field if
   something's wrong.
4. Commit and push:

   ```bash
   git add -A
   git commit -m "Update homepage copy"
   git push
   ```

### Common tasks

- **Add a program or case study:** Content → Programs (or Case studies) → **Add**.
  Its page appears at `/programs/<slug>/` (or `/impact/<slug>/`) and in the
  overview list. To feature it on a solution page, open that page and select
  it under _Programs_ or _Case studies_.
- **Add a page:** Free-form pages → **Add**, set a title and slug, and add
  blocks. If the first block is a Hero, its heading becomes the page's main
  heading; otherwise the page title is used.
- **Change the menu or footer:** Settings → Site settings.
- **Swap an image:** open the image field, upload, and fill in **alt text**
  describing what it shows. Leave alt text empty only if the image is purely
  decorative.
- **Testimonials:** they appear only when **Permission on file** is ticked.
- **Rich text** (bold, italic, links, lists, quotes, small headings) is
  available in body fields. Images, tables and code aren't available there, on
  purpose.

### ⚠ Deleting something that's referenced

Pages can feature specific programs, case studies, FAQs and testimonials. If
you delete an entry that a page still points to, **the build fails** with
`Broken reference: …`. Remove it from the pages that feature it first, then
delete it.

The example entries are featured on the solution pages, Solutions overview,
the family pages, the Impact hub and `/example-page/`. They also reference
each other: the example program features the example case study and both FAQs.

### If the editor looks wrong

- **Blank page or "Missing content" error after a schema change:** stop the
  dev server (Ctrl+C) and run `npm run dev` again. Its content cache was stale.
- **"Another astro dev server is already running":** Astro allows one dev
  server per project. Run `npx astro dev stop`, then `npm run dev`.
- **Image paths change when you save:** that's normal. Keystatic renames
  uploads by field, e.g. `hero/image/src.svg`.

---

## 6. Developer guide

### ⚠ Rule #1: the schema is defined twice

| File                    | Defines                    |
| ----------------------- | -------------------------- |
| `keystatic.config.tsx`  | What editors **can enter** |
| `src/content.config.ts` | What the **build accepts** |

Neither file can read the other. **Every field you add, remove, rename or
re-type must change in both files in the same commit.** Three guardrails make
mistakes loud:

- The section helpers have the same names in both files (`heroSection`,
  `textSection`, `ctaSection`, …) and appear in the same order, so you can
  read them side by side.
- Option lists and patterns live once, in `src/lib/content-options.ts`, and
  both files import them.
- Astro objects are **strict**. A field Keystatic writes that Astro doesn't
  know fails the build with `Unrecognized key`. A field Astro requires that
  Keystatic doesn't provide fails as missing.

**After any schema change:** restart `npm run dev`, open the affected entry in
`/keystatic`, save it, then run `npm run build`. When both pass, both sides
agree.

Two gotchas:

- Keystatic **omits empty text fields** from the YAML. Optional text on the
  Astro side must be `optText()` (`.default('')`), not `z.string()`.
- Image fields take a folder: pass the **page-level** folder (e.g.
  `'singletons/home'`). Keystatic appends the field path itself.

### Components

| Component                                                                                    | Used for                                                             |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `BaseLayout`, `SiteHeader`, `SiteFooter`, `SEO`                                              | Page shell. Header has a no-JS `<details>` menu on narrow screens.   |
| `BrandHero`                                                                                  | Homepage hero: photo, logo as `<h1>`, tagline words                  |
| `Hero`                                                                                       | Standard page hero (heading, intro, two buttons, optional image)     |
| `TextSection`                                                                                | Eyebrow + heading + rich body, optional buttons                      |
| `Carousel`                                                                                   | Homepage card carousel (no autoplay; works without JS)               |
| `ProofStrip`                                                                                 | Purple stats band                                                    |
| `AudienceRouter`                                                                             | 3–6 link cards ("Learn more" is rejected)                            |
| `ImplementationSteps`                                                                        | Numbered steps                                                       |
| `ProgramGrid`/`ProgramCard`, `CaseStudyGrid`/`CaseStudyCard`, `ResourceCard`, `OfferingCard` | Lists of collection entries                                          |
| `Testimonial`                                                                                | Quote; name, role and organisation are required                      |
| `FaqAccordion`                                                                               | Native `<details>`, no JS                                            |
| `MediaGallery`                                                                               | Lazy-loaded images; alt text required                                |
| `ContextualCta`                                                                              | Purple CTA band: heading, one line, one action (two on the homepage) |
| `Form`                                                                                       | Netlify planning form with UTM/referrer hidden fields                |
| `Section`, `RichText`, `Paragraphs`                                                          | Building blocks the others use                                       |
| `BlockRenderer`                                                                              | Turns a free-form page's `blocks` into components                    |

### Recipes

**Change the look of the whole site.** Edit `src/styles/tokens.css`. Tailwind
utilities like `bg-primary`, `text-ink-muted` and `p-lg` read these values.
Buttons come in two styles, `btn-primary` (filled) and `btn-secondary`
(outline). Inside `.on-brand` (purple) or `.on-dark` sections they turn white
automatically.

**Design one of the structural pages.** Restyle its components, or build new
ones for it. Keep the existing content fields where you can: if the fields
don't change, no schema work is needed.

**Add a field to an existing section** (e.g. a subtitle on program pages):

1. `keystatic.config.tsx`: add the field (e.g. `subtitle: text('Subtitle')`).
2. `src/content.config.ts`: add the matching field (`subtitle: optText()`).
3. Render it in the component or page.
4. Restart dev, save the entry in `/keystatic`, run `npm run build`.

**Add or reorder sections on a fixed page:**

1. Add the section field to that singleton in **both** schema files. Reuse a
   helper such as `textSection()`, `ctaSection()` or `proofStripSection()`.
2. Add content for it to `src/content/singletons/<page>.yaml`, or save the
   page in `/keystatic`. Required fields must be filled before the build passes.
3. Render it in `src/pages/<page>.astro`, in the order you want.

**Add a new fixed page** (e.g. `/careers/`):

1. `keystatic.config.tsx`: add a `singleton({ path: 'src/content/singletons/careers', … })`
   and list it in `ui.navigation`.
2. `src/content.config.ts`: add `careers: singleton('careers', obj({ … }))` to
   `collections`.
3. Create `src/content/singletons/careers.yaml` (or save it once in the editor).
4. Create `src/pages/careers.astro` using `getSingleton('careers')`.
5. Add `'careers'` to `RESERVED_PAGE_SLUGS` in `content-options.ts`.
6. Add it to the nav in Site settings if it should be linked.

**Add a free-form block type** (e.g. `logoWall`):

1. `keystatic.config.tsx` → `pages` → `fields.blocks({ … })`: add
   `logoWall: { label: 'Logo wall', schema: fields.object({ … }) }`.
2. `src/content.config.ts` → `pages` → `z.discriminatedUnion(…)`: add
   `block('logoWall', obj({ … }))`.
3. Create `src/components/LogoWall.astro`. Use plain `.astro` with **no
   `client:*` directive**; section headings are `<h2>`; images need alt text.
4. `src/components/BlockRenderer.astro`: add `case 'logoWall': …`.
5. Add it to `/example-page/`, save once in the editor, and build.

**Add a collection** (e.g. Team members): add a `collection({ … })` in
Keystatic and a `defineCollection({ loader: yamlDir('team'), schema: obj({ … }) })`
in Astro under the same name. Then list it with `getCollection('team')` on a
page.

**Never** add `client:load` or any other `client:*` directive to a public page.
That would ship React to visitors.

---

## 7. Roadmap: from someone else's repo to a site ready to host

Work through these phases in order. Each item is a checkbox for the person
doing it.

### Phase 0 — Get in and get it running (30 min)

- [ ] Get access: ask the repo owner to add you as a collaborator on
      `maish17/nerdvana`, or fork it.
- [ ] Install Node 22.12+ (`node -v`).
- [ ] Clone, `git checkout skeleton` if it isn't merged yet, then `npm install`
      and `npm run dev` ([§0](#0-quick-start)).
- [ ] Open the site and `/keystatic`. Click through every page in the sidebar.
- [ ] Run `npm run build` once. It should end with `Complete!`.

### Phase 1 — Understand it (1 hour)

- [ ] Read [§1 How it works](#1-how-it-works) and [§4](#4-what-you-can-edit-vs-what-needs-code).
- [ ] Open `/example-page/` and its entry in the editor to see every block type.
- [ ] Open one program and one case study in the editor next to their pages.
- [ ] Skim `keystatic.config.tsx` and `src/content.config.ts` side by side.

### Phase 2 — Decisions to get from the client (before design or content)

- [ ] **Domain** for the live site.
- [ ] **Brand colour.** The design uses `#91399c`, an earlier brief said
      `#A40084`. Confirm which one.
- [ ] **Section list for each fixed page.** The current sections are
      provisional. This is the biggest structural decision.
- [ ] **Planning form:** which fields are required, plus the timeline, funding
      and persona options.
- [ ] **Where form submissions go:** Netlify email notifications for now; a CRM later?
- [ ] **Usage rights** for the hero photo and anything in `legacy/` (it looks
      like stock).
- [ ] **Who edits after launch, and how.** This decides whether Keystatic moves
      to GitHub mode.
- [ ] **Languages.** English only today. Spanish would be a structural change.
- [ ] **Analytics**, if any, and the privacy policy wording that goes with it.

### Phase 3 — Structure changes (developer)

- [ ] Apply the approved section lists: [§6](#6-developer-guide) → "Add or
      reorder sections".
- [ ] Add any missing pages: [§6](#6-developer-guide) → "Add a new fixed page".
- [ ] Update the form fields and options (`Form.astro`, `content-options.ts`).
- [ ] Remove anything the client doesn't want, e.g. an unused collection, from
      **both** schema files.

### Phase 4 — Visual design for the remaining pages (designer + developer)

- [ ] Get approved designs for the inner pages. The homepage is done.
- [ ] Adjust `tokens.css` first, then restyle or add components.
- [ ] Keep the built-in rules ([§9](#9-built-in-rules)), especially focus
      states, contrast and heading order.
- [ ] Check each page at 320px, at 200% text zoom, and with the keyboard only.

### Phase 5 — Content pass (client or editor, in Keystatic)

- [ ] Replace every `[PLACEHOLDER]`; search with
      `grep -rli "placeholder" src/content`. Also replace the design mock's
      filler (`X,XXX+`, "Template Header", "Body text").
- [ ] Enter real programs, case studies, resources, FAQs, testimonials (with
      permission) and offerings.
- [ ] Replace placeholder images with real photos. Fill in alt text and keep
      file sizes reasonable (under ~300 KB per photo).
- [ ] Fill in the Site settings: nav, footer, contact details, social links,
      and the interface labels still marked `[PLACEHOLDER]`.
- [ ] Write the Policies page: privacy, accessibility statement, other.
- [ ] Delete the example entries, removing references first
      ([§5](#-deleting-something-thats-referenced)).
- [ ] `npm run build` passes, then commit.

### Phase 6 — Pre-launch checklist (developer)

- [ ] Set the real domain in `astro.config.mjs` (`site:`) and `public/robots.txt`.
- [ ] Replace `public/favicon.svg` with the real icon.
- [ ] Optional: add a social share image (`og:image` in `src/components/SEO.astro`).
- [ ] Every page has a real SEO title and description, checked in the editor.
- [ ] Test the planning form end to end on a Netlify deploy preview.
- [ ] Run an accessibility check (Lighthouse or axe) on every template.
- [ ] Click every link in the header, footer and CTAs.
- [ ] Decide what to do with `legacy/`: keep it, archive it, or delete it.
- [ ] `npm run build` is green on a clean clone.

### Phase 7 — Host it (Netlify)

- [ ] Netlify → **Add new site → Import an existing project**, then pick the
      repo. `netlify.toml` already sets `npm run build`, `dist` and Node 22.
- [ ] **Forms → Enable form detection**, then redeploy. Without it, form
      submissions aren't captured.
- [ ] **Forms → Form notifications:** email the right inbox.
- [ ] **Domain management:** add the domain and let Netlify issue HTTPS.
- [ ] Merge `skeleton` into `main` if you haven't already. Every push to
      `main` now deploys.
- [ ] Optional: protect `main` on GitHub so changes go through pull requests.
      Netlify builds a preview URL for each one.

### Phase 8 — Hand-off

- [ ] If the client edits without a developer, [move Keystatic to GitHub mode](#moving-keystatic-to-github-mode).
- [ ] Walk the editor through [§5](#5-editing-guide-for-content-editors).
- [ ] Note who owns the GitHub repo, the Netlify site, and the domain registrar.

---

## 8. Deploying and hosting

`netlify.toml` contains everything Netlify needs. No environment variables or
secrets are required. **Never put a secret in a `PUBLIC_*` variable**: those
are inlined into the browser bundle.

The planning form posts to Netlify Forms and redirects to `/contact/thanks/`.
Hidden fields record `utm_source`, `utm_medium` and `utm_campaign` (captured
on the visitor's landing page for that browser session), plus `referrer` and
`source_page`.

### Moving Keystatic to GitHub mode

Use this when the client should edit from a browser, with no local setup:

1. In `keystatic.config.tsx`, change `storage: { kind: 'local' }` to
   `storage: { kind: 'github', repo: 'maish17/nerdvana' }` (or the repo's
   final home).
2. In `astro.config.mjs`, replace `devOnly(react())` and `devOnly(keystatic())`
   with `react()` and `keystatic()`. The editor then deploys to
   `https://<domain>/keystatic` behind GitHub login, as a Netlify function.
3. Follow Keystatic's GitHub-mode setup to create the GitHub App, then add its
   `KEYSTATIC_*` values as **Netlify environment variables**, never in the repo.
4. Each save becomes a commit to GitHub, and Netlify rebuilds automatically.

---

## 9. Built-in rules

These are enforced in code and schemas. Keep them as the site grows.

- **Accessibility:**
  - One `<h1>` per page and no skipped heading levels.
  - Landmarks and a skip link on every page.
  - Visible focus everywhere, full keyboard use, no traps.
  - Works at 320px wide and at 200% text size.
  - Alt text on every meaningful image (`alt=""` only for decorative ones).
  - Respects reduced motion.
  - Nothing is conveyed by colour alone.
  - All text colour pairs pass WCAG AA; ratios are noted in `tokens.css`.
- **Hero:** one static composition, never a carousel.
- **Carousel** (homepage): never autoplays, works without JavaScript, real
  buttons for arrows and dots, and tabbing to a card centres it.
- **Buttons:** two styles only, filled and outline. They invert to white on
  purple or dark bands.
- **CTAs:** one action each, except the homepage CTA, which may add a second.
- **Audience router:** 3–6 cards with descriptive labels. "Learn more" is
  rejected.
- **FAQs:** native `<details>`/`<summary>`.
- **Testimonials:** name, role and organisation are required, and they appear
  only with permission on file.
- **Free-form slugs:** can't reuse a fixed route.
- **No React** (or any framework) on public pages.

---

## 10. Troubleshooting

| Symptom                                        | Fix                                                                                                     |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `Unrecognized key: "x"` on build               | The schemas have drifted: a field exists in Keystatic but not Astro. Add it to `src/content.config.ts`. |
| `… data does not match collection schema`      | A required field is empty or invalid. The message names the file and field. Fix it in the editor.       |
| `Broken reference: …`                          | A page features an entry that was deleted. See [§5](#-deleting-something-thats-referenced).             |
| Blank page or `Missing content for "…"` in dev | Stale content cache. Restart `npm run dev`.                                                             |
| `Another astro dev server is already running`  | Run `npx astro dev stop`.                                                                               |
| `/keystatic` returns 404                       | It only exists under `npm run dev`. That's intentional in local mode.                                   |
| `npm audit` warnings                           | They come from the Netlify adapter's build tooling, not the site. Don't run `npm audit fix --force`.    |
| Planning form submissions missing              | Netlify → Forms → enable form detection, then redeploy.                                                 |

---

## 11. Legacy

`legacy/design-prototype/` holds the original homepage prototype and its
assets, kept for reference. It is excluded from the build, type checks,
formatting and Tailwind. The real logo, white wordmark and hero photo were
copied from there into `public/images/`. See `legacy/README.md` for what each
file is.
