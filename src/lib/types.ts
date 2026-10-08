import type { CollectionEntry } from 'astro:content';

export type SiteSettings = CollectionEntry<'siteSettings'>['data'];
export type SiteLabels = SiteSettings['labels'];
export type SolutionPageData = CollectionEntry<'districtPartnerships'>['data'];
export type FamilyPageData = CollectionEntry<'parents'>['data'];
export type PageBlock = CollectionEntry<'pages'>['data']['blocks'][number];
