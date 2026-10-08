# Legacy

Files here are **not part of the build**. They are kept so nothing is lost.
They are excluded from TypeScript checking (`tsconfig.json`), formatting
(`.prettierignore`), and Tailwind class scanning (`src/styles/global.css`).

## `design-prototype/`

A homepage design prototype by Benjamin Lu, moved here intact when the
structural skeleton replaced the starter site. Original paths are mirrored
under this folder. Full history is in git:

- `bf5a2ca` Add files via upload (2026-09-24)
- `edf1292` Nav and Search icon fix (2026-09-25)
- `f477783` Carousel + Purple Section (2026-10-01)
- `1dc9db1` "Scrollytelly" Effects (2026-10-01)

Why it was moved rather than kept live: visual design is a separate approved
stage, and the skeleton spec rules out carousels, unhandled scroll motion, and
search. This work is reference material for that design stage.

### Client assets in this folder

| File | What it appears to be |
|---|---|
| `src/assets/hero.png` | **Real Nerdvana logo** (purple mark + wordmark, 423×107) |
| `public/hero-detail.png` | Nerdvana wordmark, white on transparent (1979×499) |
| `public/border-tour.png`, `public/disco.png`, `src/assets/park.png`, `public/hero-overlay.png` | Photos, captioned in the prototype as project sites. Confirm provenance and usage rights before reuse. |
| `public/logo.svg` | Red rectangle — layout stand-in, not a logo |
| `public/arrow-*.svg`, `public/search.svg` | UI icons |
