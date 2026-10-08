/**
 * Option lists and validation rules shared by BOTH schema files:
 *   - keystatic.config.tsx   (what the editor can enter)
 *   - src/content.config.ts  (what the build accepts)
 *
 * Change an option here and both schemas pick it up. Changing a `value`
 * breaks existing content that uses the old value — rename labels freely,
 * rename values only alongside a content search-and-replace.
 */

type Option<V extends string> = { readonly value: V; readonly label: string };

const opts = <const V extends string>(entries: Record<V, string>) =>
  Object.entries(entries).map(([value, label]) => ({ value, label })) as Option<V>[];

const values = <V extends string>(options: Option<V>[]) =>
  options.map((o) => o.value) as [V, ...V[]];

export const AUDIENCE_OPTIONS = opts({
  district: 'District',
  charter: 'Charter',
  private: 'Private',
  parent: 'Parent',
  homeschool: 'Homeschool',
  community: 'Community',
});
export const AUDIENCES = values(AUDIENCE_OPTIONS);

export const PROGRAM_FORMAT_OPTIONS = opts({
  weekly: 'Weekly',
  summer: 'Summer',
  workshop: 'Workshop',
  camp: 'Camp',
  residency: 'Residency',
});
export const PROGRAM_FORMATS = values(PROGRAM_FORMAT_OPTIONS);

export const RESOURCE_TYPE_OPTIONS = opts({
  guide: 'Guide',
  report: 'Report',
  brief: 'Brief',
  'one-pager': 'One-pager',
});
export const RESOURCE_TYPES = values(RESOURCE_TYPE_OPTIONS);

export const OFFERING_STATUS_OPTIONS = opts({
  open: 'Open',
  waitlist: 'Waitlist',
  closed: 'Closed',
});
export const OFFERING_STATUSES = values(OFFERING_STATUS_OPTIONS);

export const SOCIAL_PLATFORM_OPTIONS = opts({
  facebook: 'Facebook',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  x: 'X',
  tiktok: 'TikTok',
});
export const SOCIAL_PLATFORMS = values(SOCIAL_PLATFORM_OPTIONS);

/**
 * Planning form select options. These live in code, not the CMS, because the
 * `value`s are the data contract for Netlify form submissions (and any future
 * CRM mapping). TODO: confirm option wording with the client.
 */
export const FORM_PERSONA_OPTIONS = AUDIENCE_OPTIONS;
export const FORM_TIMELINE_OPTIONS = opts({
  'within-3-months': '[PLACEHOLDER] Within 3 months',
  'within-6-months': '[PLACEHOLDER] Within 6 months',
  'next-school-year': '[PLACEHOLDER] Next school year',
  exploring: '[PLACEHOLDER] Just exploring',
});
export const FORM_FUNDING_OPTIONS = opts({
  secured: '[PLACEHOLDER] Funding secured',
  pending: '[PLACEHOLDER] Funding pending',
  'not-started': '[PLACEHOLDER] Not started',
  unsure: '[PLACEHOLDER] Not sure',
});

/** URL-safe slug: lowercase, hyphenated. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * First path segments owned by fixed routes. A free-form page may not use
 * these slugs, or it would collide with (and be shadowed by) a fixed page.
 */
export const RESERVED_PAGE_SLUGS = [
  'solutions',
  'workforce',
  'programs',
  'impact',
  'resources',
  'families',
  'about',
  'contact',
  'policies',
  'keystatic',
  'api',
  'images',
  'files',
  '404',
] as const;

export const PAGE_SLUG_PATTERN = new RegExp(
  `^(?!(?:${RESERVED_PAGE_SLUGS.join('|')})$)[a-z0-9]+(?:-[a-z0-9]+)*$`,
);

/** Internal path (/about/), in-page anchor (#x), or absolute http(s)/mailto/tel URL. */
export const HREF_PATTERN = /^(\/|#|https?:\/\/|mailto:|tel:)\S*$/;

/** Audience-router card labels must be descriptive. */
export const VAGUE_LABEL_PATTERN = /learn more/i;

/** Analytics source tag on CTAs: lowercase-hyphenated. */
export const SOURCE_TAG_PATTERN = SLUG_PATTERN;
