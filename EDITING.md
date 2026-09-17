# Editing site content

<!-- TODO: expand into full click-by-click instructions with screenshots
     before handoff. This is a stub. -->

## Adding or changing a solution page

1. Go to `src/content/solutions/` in this repository on GitHub.
2. Click the file you want to change, then the pencil icon.
3. Edit the text. Fields between the `---` lines at the top control how the page
   is listed; text below them is the page body.
4. Click "Commit changes". The site redeploys automatically in ~1 minute.

## Field reference

| Field | Required | Notes |
|---|---|---|
| `title` | yes | Page heading and catalog title |
| `tagline` | yes | One line, max 120 characters |
| `order` | yes | Lower numbers appear first in the catalog |
| `draft` | yes | `true` hides the page entirely |
| `audience` | yes | One of: `k-8`, `high-school`, `educators`, `districts` |
| `format` | yes | One of: `in-person`, `online`, `hybrid` |
| `priceFrom` | no | Number only, no currency symbol |

If you enter an invalid value, the deploy fails and the live site is unchanged.
