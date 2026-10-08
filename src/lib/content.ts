import {
  getCollection,
  getEntries,
  getEntry,
  type CollectionKey,
  type CollectionEntry,
} from 'astro:content';

/** Return the one entry of a singleton collection, or fail the build loudly. */
export async function getSingleton<C extends CollectionKey>(
  name: C,
): Promise<CollectionEntry<C>['data']> {
  const [entry] = await getCollection(name);
  if (!entry) {
    throw new Error(`Missing content for "${name}". Open /keystatic, edit that page, and save it.`);
  }
  return entry.data;
}

type Ref<C extends CollectionKey> = { collection: C; id: string };

/**
 * Resolve references in the order the editor chose. A reference to a deleted
 * entry fails the build with the broken id, rather than silently vanishing.
 */
export async function resolve<C extends 'programs' | 'caseStudies' | 'faqs'>(refs: Ref<C>[]) {
  if (refs.length === 0) return [];
  const entries = await getEntries(refs);
  entries.forEach((entry, i) => {
    if (!entry)
      throw new Error(`Broken reference: ${refs[i].collection} "${refs[i].id}" does not exist.`);
  });
  return entries as CollectionEntry<C>[];
}

/** A testimonial is publishable only with permission on file. */
export async function getPublishableTestimonial(ref: Ref<'testimonials'> | undefined) {
  if (!ref) return undefined;
  const entry = await getEntry(ref);
  if (!entry) throw new Error(`Broken reference: testimonial "${ref.id}" does not exist.`);
  return entry.data.permissionOnFile ? entry.data : undefined;
}

export const byTitle = <T extends { data: { title: string } }>(a: T, b: T) =>
  a.data.title.localeCompare(b.data.title);

/** Split multi-line plain text into paragraphs on blank lines. */
export const paragraphs = (text: string) =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

export const formatDate = (date: Date) =>
  date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

export const isExternal = (href: string) => /^https?:\/\//.test(href);
