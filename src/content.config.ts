import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const solutions = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/solutions' }),
  schema: z.object({
    // Display
    title: z.string(),
    tagline: z.string().max(120),

    // Catalog behaviour
    order: z.number(),
    draft: z.boolean().default(false),

    // Facets — TODO: confirm these enum values against the real programme list.
    audience: z.enum(['k-8', 'high-school', 'educators', 'districts']),
    format: z.enum(['in-person', 'online', 'hybrid']),

    // Commercial
    priceFrom: z.number().optional(),

    // Media — TODO: make heroImage required and switch to `image()` once real
    // assets exist. Left optional so the skeleton builds with no binary assets.
    // heroAlt is required whenever heroImage is present (enforced below).
    heroImage: z.string().optional(),
    heroAlt: z.string().optional(),
  }).refine(
    (d) => !d.heroImage || (d.heroAlt && d.heroAlt.length > 0),
    { message: 'heroAlt is required when heroImage is set', path: ['heroAlt'] }
  ),
});

export const collections = { solutions };
