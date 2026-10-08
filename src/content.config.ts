/**
 * ASTRO CONTENT SCHEMA — defines what the build accepts.
 *
 * ⚠ THIS SCHEMA IS DEFINED TWICE. Its twin is `keystatic.config.tsx` (repo
 * root), which defines what editors can enter at /keystatic. Every field
 * added, removed, renamed, or re-typed here MUST be mirrored there in the
 * same commit. Section helpers below have the same names in both files so
 * they can be compared side by side.
 *
 * Objects are strict: if Keystatic writes a field this file does not know
 * about, the build fails with "Unrecognized key" instead of silently dropping
 * it. That error almost always means the two schemas have drifted.
 *
 * Empty values: Keystatic omits empty text fields from the YAML, so optional
 * text is `.default('')` here.
 *
 * Shared option lists and patterns: `src/lib/content-options.ts`.
 */
import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import {
  AUDIENCES,
  HREF_PATTERN,
  OFFERING_STATUSES,
  PROGRAM_FORMATS,
  RESOURCE_TYPES,
  SOCIAL_PLATFORMS,
  SOURCE_TAG_PATTERN,
  VAGUE_LABEL_PATTERN,
} from './lib/content-options';

/* ------------------------------------------------------------------------ */
/* Field helpers                                                             */
/* ------------------------------------------------------------------------ */

const obj = z.strictObject;
const reqText = () => z.string().min(1);
const optText = () => z.string().default('');
const href = () =>
  z.string().regex(HREF_PATTERN, 'Must be an internal path like /contact/ or a full URL');
const optHref = () => href().optional();
const richText = () => z.string().default('');
const stringList = () => z.array(reqText()).default([]);
const audience = () => z.array(z.enum(AUDIENCES)).default([]);

const imageWithAlt = () => obj({ src: z.string().optional(), alt: optText() }).prefault({});

const action = () =>
  obj({ label: optText(), href: optHref() })
    .refine((a) => !a.label || a.href, {
      message: 'Button link is required when button text is set',
      path: ['href'],
    })
    .prefault({});

const requiredAction = () => obj({ label: reqText(), href: href() });

/** Text that must be descriptive: "Learn more" is rejected. */
const descriptiveText = () =>
  reqText().refine((s) => !VAGUE_LABEL_PATTERN.test(s), '"Learn more" is not allowed here');
const optDescriptiveText = () =>
  optText().refine((s) => !VAGUE_LABEL_PATTERN.test(s), '"Learn more" is not allowed here');

/* ------------------------------------------------------------------------ */
/* Section helpers — same names as in keystatic.config.tsx                   */
/* ------------------------------------------------------------------------ */

const seoSection = () => obj({ title: reqText().max(70), description: reqText().max(160) });

const heroSection = () =>
  obj({
    eyebrow: optText(),
    heading: reqText(),
    lede: optText(),
    primaryAction: action(),
    secondaryAction: action(),
    image: imageWithAlt(),
  });

const proofStripSection = () =>
  obj({
    heading: optText(),
    items: z
      .array(obj({ value: reqText(), label: reqText() }))
      .min(1)
      .max(6),
  });

const audienceRouterSection = () =>
  obj({
    eyebrow: optText(),
    heading: reqText(),
    intro: optText(),
    cards: z
      .array(
        obj({
          label: descriptiveText(),
          description: optText(),
          linkLabel: optDescriptiveText(),
          href: href(),
        }),
      )
      .min(3)
      .max(6),
  });

const implementationStepsSection = () =>
  obj({
    heading: reqText(),
    intro: optText(),
    steps: z
      .array(obj({ title: reqText(), description: optText() }))
      .min(1)
      .max(8),
  });

const programsSection = () =>
  obj({
    heading: reqText(),
    intro: optText(),
    programs: z.array(reference('programs')).default([]),
  });

const caseStudiesSection = () =>
  obj({
    heading: reqText(),
    intro: optText(),
    caseStudies: z.array(reference('caseStudies')).default([]),
  });

const testimonialSection = () => obj({ testimonial: reference('testimonials').optional() });

const faqSection = () => obj({ heading: reqText(), faqs: z.array(reference('faqs')).default([]) });

/** `secondary: true` allows an optional second (outline) button — homepage only. */
const ctaSection = ({ secondary = false } = {}) =>
  obj({
    heading: reqText(),
    expectation: reqText(),
    action: requiredAction(),
    secondaryAction: secondary ? action() : z.undefined().optional(),
    sourceTag: z.string().regex(SOURCE_TAG_PATTERN),
  });

const richSection = () => obj({ heading: reqText(), body: richText() });

/** Homepage hero: background photo, logo as the page heading, tagline words. */
const brandHeroSection = () =>
  obj({
    heading: reqText(),
    logo: z.string(),
    taglineWords: z.array(reqText()).min(1).max(6),
    background: imageWithAlt(),
  });

/** Eyebrow + heading + rich body, optionally with up to two buttons. */
const textSection = ({ actions = false } = {}) =>
  obj({
    eyebrow: optText(),
    heading: reqText(),
    body: richText(),
    primaryAction: actions ? action() : z.undefined().optional(),
    secondaryAction: actions ? action() : z.undefined().optional(),
  });

/** Card carousel on a brand band. */
const carouselSection = () =>
  obj({
    heading: reqText(),
    cards: z
      .array(
        obj({
          image: obj({ src: z.string(), alt: reqText() }),
          label: descriptiveText(),
          href: href(),
        }),
      )
      .min(3)
      .max(10),
  });

const listingSection = () => obj({ heading: reqText(), intro: optText(), emptyMessage: reqText() });

const gallerySection = () =>
  obj({
    heading: reqText(),
    images: z.array(obj({ image: z.string(), alt: reqText(), caption: optText() })).min(1),
  });

const labels = <K extends string>(keys: readonly K[]) =>
  obj(Object.fromEntries(keys.map((k) => [k, reqText()])) as Record<K, ReturnType<typeof reqText>>);

/* ------------------------------------------------------------------------ */
/* Page shapes reused by several singletons                                  */
/* ------------------------------------------------------------------------ */

const solutionPage = () =>
  obj({
    seo: seoSection(),
    hero: heroSection(),
    challenge: richSection(),
    proof: proofStripSection(),
    approach: implementationStepsSection(),
    programs: programsSection(),
    caseStudies: caseStudiesSection(),
    testimonial: testimonialSection(),
    faq: faqSection(),
    cta: ctaSection(),
  });

const familyPage = () =>
  obj({
    seo: seoSection(),
    hero: heroSection(),
    intro: richSection(),
    offerings: listingSection(),
    faq: faqSection(),
    testimonial: testimonialSection(),
    cta: ctaSection(),
  });

/* ------------------------------------------------------------------------ */
/* Loaders                                                                   */
/* ------------------------------------------------------------------------ */

const yamlDir = (dir: string) => glob({ pattern: '*.yaml', base: `./src/content/${dir}` });

/** One YAML file per singleton, in src/content/singletons/<file>.yaml. */
const singleton = <S extends z.ZodType>(file: string, schema: S) =>
  defineCollection({
    loader: glob({ pattern: `${file}.yaml`, base: './src/content/singletons' }),
    schema,
  });

/* ------------------------------------------------------------------------ */
/* Collections                                                               */
/* ------------------------------------------------------------------------ */

const programs = defineCollection({
  loader: yamlDir('programs'),
  schema: obj({
    title: reqText(),
    summary: reqText().max(300),
    audience: audience(),
    gradeRange: reqText(),
    format: z.array(z.enum(PROGRAM_FORMATS)).default([]),
    duration: reqText(),
    whatStudentsDo: richText(),
    outcomes: stringList(),
    includes: stringList(),
    partnerRequirements: stringList(),
    relatedCaseStudies: z.array(reference('caseStudies')).default([]),
    relatedFaqs: z.array(reference('faqs')).default([]),
    heroImage: imageWithAlt(),
    ctaLabel: reqText(),
    ctaHref: href(),
  }),
});

const caseStudies = defineCollection({
  loader: yamlDir('case-studies'),
  schema: obj({
    title: reqText(),
    partnerName: reqText(),
    partnerContext: optText(),
    challenge: optText(),
    objectives: optText(),
    deliveryModel: optText(),
    timeline: optText(),
    reachStudents: z.number().int().nonnegative().optional(),
    reachCampuses: z.number().int().nonnegative().optional(),
    outcomes: stringList(),
    studentQuote: optText(),
    leaderQuote: obj({ text: optText(), name: optText(), role: optText(), organization: optText() })
      .refine((q) => !q.text || (q.name && q.role && q.organization), {
        message: 'A leader quote needs a name, role and organization (no anonymous quotes)',
      })
      .prefault({}),
    lessons: optText(),
    nextPhase: optText(),
    reportFile: z.string().optional(),
    heroImage: imageWithAlt(),
  }),
});

const resources = defineCollection({
  loader: yamlDir('resources'),
  schema: obj({
    title: reqText(),
    resourceType: z.enum(RESOURCE_TYPES),
    audience: audience(),
    description: reqText(),
    file: z.string(),
    lastUpdated: z.coerce.date(),
    relatedPages: z.array(href()).default([]),
  }),
});

const testimonials = defineCollection({
  loader: yamlDir('testimonials'),
  schema: obj({
    name: reqText(),
    quote: reqText(),
    role: reqText(),
    organization: reqText(),
    audience: audience(),
    permissionOnFile: z.boolean().default(false),
  }),
});

const faqs = defineCollection({
  loader: yamlDir('faqs'),
  schema: obj({ question: reqText(), answer: richText(), audience: audience() }),
});

const offerings = defineCollection({
  loader: yamlDir('offerings'),
  schema: obj({
    title: reqText(),
    ageRange: reqText(),
    schedule: reqText(),
    price: reqText(),
    status: z.enum(OFFERING_STATUSES),
    externalRegistrationUrl: z.url(),
    description: reqText(),
  }),
});

const block = <D extends string, S extends z.ZodType>(discriminant: D, value: S) =>
  obj({ discriminant: z.literal(discriminant), value });

const pages = defineCollection({
  loader: yamlDir('pages'),
  schema: obj({
    title: reqText(),
    seoTitle: reqText().max(70),
    seoDescription: reqText().max(160),
    blocks: z
      .array(
        z.discriminatedUnion('discriminant', [
          block('hero', heroSection()),
          block('proofStrip', proofStripSection()),
          block('audienceRouter', audienceRouterSection()),
          block('implementationSteps', implementationStepsSection()),
          block('programGrid', programsSection()),
          block('caseStudyGrid', caseStudiesSection()),
          block('testimonial', testimonialSection()),
          block('faqAccordion', faqSection()),
          block('ctaBand', ctaSection()),
          block('richText', obj({ heading: optText(), body: richText() })),
        ]),
      )
      .min(1),
  }),
});

/* ------------------------------------------------------------------------ */
/* Singletons                                                                */
/* ------------------------------------------------------------------------ */

const navLink = () => obj({ label: reqText(), href: href() });

const siteSettings = singleton(
  'site-settings',
  obj({
    siteName: reqText(),
    logo: obj({ src: z.string(), alt: reqText() }),
    primaryNav: z.array(navLink()).max(8).default([]),
    headerAction: action(),
    footerTagline: optText(),
    footerLocation: optText(),
    footerColumns: z
      .array(obj({ heading: reqText(), links: z.array(navLink()).default([]) }))
      .max(4)
      .default([]),
    contact: obj({
      email: reqText(),
      phone: reqText(),
      street: optText(),
      city: optText(),
      region: optText(),
      postalCode: optText(),
    }),
    social: z.array(obj({ platform: z.enum(SOCIAL_PLATFORMS), url: z.url() })).default([]),
    copyright: reqText(),
    labels: labels([
      'skipToContent',
      'primaryNavLabel',
      'menuButton',
      'footerNavLabel',
      'socialNavLabel',
      'carouselPrevious',
      'carouselNext',
      'carouselShow',
      'offeringAgeRange',
      'offeringSchedule',
      'offeringPrice',
      'offeringStatus',
      'offeringStatusOpen',
      'offeringStatusWaitlist',
      'offeringStatusClosed',
      'offeringRegister',
      'offeringJoinWaitlist',
      'resourceDownload',
      'resourceUpdated',
      'opensInNewTab',
      'notFoundTitle',
      'notFoundBody',
      'notFoundLink',
    ]),
  }),
);

const home = singleton(
  'home',
  obj({
    seo: seoSection(),
    hero: brandHeroSection(),
    intro: textSection({ actions: true }),
    spotlight: carouselSection(),
    story: textSection(),
    proof: proofStripSection(),
    audienceRouter: audienceRouterSection(),
    cta: ctaSection({ secondary: true }),
  }),
);

const solutionsOverview = singleton(
  'solutions-overview',
  obj({
    seo: seoSection(),
    hero: heroSection(),
    audienceRouter: audienceRouterSection(),
    steps: implementationStepsSection(),
    caseStudies: caseStudiesSection(),
    faq: faqSection(),
    cta: ctaSection(),
  }),
);

const programsOverview = singleton(
  'programs-overview',
  obj({
    seo: seoSection(),
    hero: heroSection(),
    intro: richSection(),
    list: listingSection(),
    cta: ctaSection(),
    detailLabels: labels([
      'audience',
      'gradeRange',
      'format',
      'duration',
      'whatStudentsDo',
      'outcomes',
      'includes',
      'partnerRequirements',
      'relatedCaseStudies',
      'relatedFaqs',
    ]),
  }),
);

const impactHub = singleton(
  'impact-hub',
  obj({
    seo: seoSection(),
    hero: heroSection(),
    proof: proofStripSection(),
    list: listingSection(),
    testimonial: testimonialSection(),
    cta: ctaSection(),
    detailLabels: labels([
      'partner',
      'reach',
      'reachStudents',
      'reachCampuses',
      'challenge',
      'objectives',
      'deliveryModel',
      'timeline',
      'outcomes',
      'studentQuoteAttribution',
      'lessons',
      'nextPhase',
      'report',
    ]),
  }),
);

const resourcesIndex = singleton(
  'resources-index',
  obj({ seo: seoSection(), hero: heroSection(), list: listingSection(), cta: ctaSection() }),
);

const about = singleton(
  'about',
  obj({
    seo: seoSection(),
    hero: heroSection(),
    story: richSection(),
    proof: proofStripSection(),
    gallery: gallerySection(),
    cta: ctaSection(),
  }),
);

const contact = singleton(
  'contact',
  obj({
    seo: seoSection(),
    hero: heroSection(),
    form: obj({
      heading: reqText(),
      intro: optText(),
      requiredNote: reqText(),
      requiredMarker: reqText(),
      nameLabel: reqText(),
      emailLabel: reqText(),
      organizationLabel: reqText(),
      roleLabel: reqText(),
      personaLabel: reqText(),
      campusesLabel: reqText(),
      timelineLabel: reqText(),
      fundingLabel: reqText(),
      goalsLabel: reqText(),
      consentLabel: reqText(),
      selectPrompt: reqText(),
      submitLabel: reqText(),
    }),
    direct: obj({ heading: reqText(), intro: optText() }),
    thanks: obj({
      seo: seoSection(),
      heading: reqText(),
      body: optText(),
      linkLabel: reqText(),
      linkHref: href(),
    }),
  }),
);

const policies = singleton(
  'policies',
  obj({
    seo: seoSection(),
    hero: heroSection(),
    lastUpdated: z.coerce.date(),
    lastUpdatedLabel: reqText(),
    privacy: richSection(),
    accessibility: richSection(),
    other: richSection(),
  }),
);

export const collections = {
  // Collections
  programs,
  caseStudies,
  resources,
  testimonials,
  faqs,
  offerings,
  pages,
  // Singletons
  siteSettings,
  home,
  solutionsOverview,
  districtPartnerships: singleton('district-partnerships', solutionPage()),
  aceExpandedLearning: singleton('ace-expanded-learning', solutionPage()),
  cteStemInnovation: singleton('cte-stem-innovation', solutionPage()),
  charterNetworks: singleton('charter-networks', solutionPage()),
  independentSchools: singleton('independent-schools', solutionPage()),
  preEts: singleton('pre-ets', solutionPage()),
  programsOverview,
  impactHub,
  resourcesIndex,
  parents: singleton('parents', familyPage()),
  homeschool: singleton('homeschool', familyPage()),
  about,
  contact,
  policies,
};
