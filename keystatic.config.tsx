/**
 * KEYSTATIC SCHEMA — defines what editors can enter at /keystatic.
 *
 * ⚠ THIS SCHEMA IS DEFINED TWICE. Its twin is `src/content.config.ts`, which
 * defines what the build accepts. Every field added, removed, renamed, or
 * re-typed here MUST be mirrored there in the same commit, or the site build
 * will fail (or silently drop the field). Section helpers below have the same
 * names in both files so they can be compared side by side.
 *
 * Shared option lists and validation patterns live in
 * `src/lib/content-options.ts` and are imported by both files.
 *
 * Storage is `local`: the admin edits files in this repo and only runs under
 * `npm run dev` (see astro.config.mjs). TODO: switch to `github` storage when
 * the client edits without a developer machine.
 */
import { collection, config, fields, singleton } from '@keystatic/core';
import {
  AUDIENCE_OPTIONS,
  HREF_PATTERN,
  OFFERING_STATUS_OPTIONS,
  PAGE_SLUG_PATTERN,
  PROGRAM_FORMAT_OPTIONS,
  RESERVED_PAGE_SLUGS,
  RESOURCE_TYPE_OPTIONS,
  SLUG_PATTERN,
  SOCIAL_PLATFORM_OPTIONS,
  SOURCE_TAG_PATTERN,
  VAGUE_LABEL_PATTERN,
} from './src/lib/content-options';

/* ------------------------------------------------------------------------ */
/* Field helpers                                                             */
/* ------------------------------------------------------------------------ */

type TextOpts = { required?: boolean; multiline?: boolean; max?: number; description?: string };

const text = (label: string, o: TextOpts = {}) =>
  fields.text({
    label,
    description: o.description,
    multiline: o.multiline,
    validation: { isRequired: o.required, length: o.max ? { max: o.max } : undefined },
  });

const HREF_HELP = 'An internal path like /contact/ or a full URL starting with https://';

const href = (label: string, required = false) =>
  fields.text({
    label,
    description: HREF_HELP,
    validation: {
      isRequired: required,
      pattern: {
        regex: required ? HREF_PATTERN : new RegExp(`^$|${HREF_PATTERN.source}`),
        message: HREF_HELP,
      },
    },
  });

const slugField = (label: string) =>
  fields.slug({
    name: { label, validation: { isRequired: true } },
    slug: {
      label: 'URL slug',
      description: 'Lowercase letters, numbers and hyphens. Changing it changes the page URL.',
      validation: {
        pattern: {
          regex: SLUG_PATTERN,
          message: 'Use lowercase letters, numbers and hyphens only.',
        },
      },
    },
  });

const richText = (label: string, headings: false | (3 | 4)[] = [3, 4]) =>
  fields.markdoc.inline({
    label,
    options: {
      heading: headings,
      image: false,
      table: false,
      codeBlock: false,
      code: false,
      divider: false,
      strikethrough: false,
    },
  });

const stringList = (label: string, itemLabel: string, min = 0) =>
  fields.array(text(itemLabel, { required: true }), {
    label,
    itemLabel: (p) => p.value || itemLabel,
    validation: { length: { min } },
  });

const audience = () => fields.multiselect({ label: 'Audience', options: AUDIENCE_OPTIONS });

/** Image + alt text. `dir` is a folder under public/images/. */
const imageWithAlt = (label: string, dir: string, required = false) =>
  fields.object(
    {
      src: fields.image({
        label: 'Image file',
        directory: `public/images/${dir}`,
        publicPath: `/images/${dir}/`,
        validation: { isRequired: required },
      }),
      alt: text('Alt text', {
        required,
        description: required
          ? 'Describe what the image shows, for people using screen readers.'
          : 'Describe what the image shows, for people using screen readers. Leave empty only if the image is purely decorative.',
      }),
    },
    { label },
  );

const action = (label: string, required = false) =>
  fields.object(
    { label: text('Button text', { required }), href: href('Button link', required) },
    { label },
  );

/* ------------------------------------------------------------------------ */
/* Section helpers — same names as in src/content.config.ts                  */
/* ------------------------------------------------------------------------ */

const seoSection = () =>
  fields.object(
    {
      title: text('Browser tab / search result title', { required: true, max: 70 }),
      description: text('Search result description', { required: true, multiline: true, max: 160 }),
    },
    { label: 'SEO' },
  );

const heroSection = (dir: string) =>
  fields.object(
    {
      eyebrow: text('Eyebrow (small line above heading)'),
      heading: text('Heading', { required: true }),
      lede: text('Intro paragraph', { multiline: true }),
      primaryAction: action('Primary button'),
      secondaryAction: action('Secondary button'),
      image: imageWithAlt('Image', dir),
    },
    { label: 'Hero' },
  );

const proofStripSection = () =>
  fields.object(
    {
      heading: text('Heading (optional)'),
      items: fields.array(
        fields.object({
          value: text('Figure', { required: true }),
          label: text('Label', { required: true }),
        }),
        {
          label: 'Figures',
          itemLabel: (p) => p.fields.value.value || 'Figure',
          validation: { length: { min: 1, max: 6 } },
        },
      ),
    },
    { label: 'Proof strip' },
  );

/** Text that must be descriptive: "Learn more" is rejected. Optional fields accept empty. */
const descriptiveText = (label: string, description: string, required: boolean) =>
  fields.text({
    label,
    description,
    validation: {
      isRequired: required,
      pattern: {
        regex: new RegExp(
          `^${required ? '' : '$|^'}(?![\\s\\S]*${VAGUE_LABEL_PATTERN.source})[\\s\\S]+$`,
          'i',
        ),
        message: 'Use descriptive text. "Learn more" is not allowed.',
      },
    },
  });

const audienceRouterSection = () =>
  fields.object(
    {
      eyebrow: text('Eyebrow (small line above heading)'),
      heading: text('Heading', { required: true }),
      intro: text('Intro', { multiline: true }),
      cards: fields.array(
        fields.object({
          label: descriptiveText(
            'Card heading',
            'Say where the card goes, e.g. the audience name. Never "Learn more".',
            true,
          ),
          description: text('Description', { multiline: true }),
          linkLabel: descriptiveText(
            'Link text (optional)',
            'Shown at the bottom of the card with an arrow. Leave empty to link the heading instead.',
            false,
          ),
          href: href('Link', true),
        }),
        {
          label: 'Cards (3 to 6)',
          itemLabel: (p) => p.fields.label.value || 'Card',
          validation: { length: { min: 3, max: 6 } },
        },
      ),
    },
    { label: 'Audience router' },
  );

const implementationStepsSection = () =>
  fields.object(
    {
      heading: text('Heading', { required: true }),
      intro: text('Intro', { multiline: true }),
      steps: fields.array(
        fields.object({
          title: text('Step title', { required: true }),
          description: text('Description', { multiline: true }),
        }),
        {
          label: 'Steps',
          itemLabel: (p) => p.fields.title.value || 'Step',
          validation: { length: { min: 1, max: 8 } },
        },
      ),
    },
    { label: 'Implementation steps' },
  );

const programsSection = (label = 'Featured programs') =>
  fields.object(
    {
      heading: text('Heading', { required: true }),
      intro: text('Intro', { multiline: true }),
      programs: fields.multiRelationship({ label: 'Programs', collection: 'programs' }),
    },
    { label },
  );

const caseStudiesSection = (label = 'Featured case studies') =>
  fields.object(
    {
      heading: text('Heading', { required: true }),
      intro: text('Intro', { multiline: true }),
      caseStudies: fields.multiRelationship({ label: 'Case studies', collection: 'caseStudies' }),
    },
    { label },
  );

const testimonialSection = () =>
  fields.object(
    {
      testimonial: fields.relationship({
        label: 'Testimonial',
        description: 'Only testimonials with "Permission on file" checked are shown.',
        collection: 'testimonials',
      }),
    },
    { label: 'Testimonial' },
  );

const faqSection = () =>
  fields.object(
    {
      heading: text('Heading', { required: true }),
      faqs: fields.multiRelationship({ label: 'Questions', collection: 'faqs' }),
    },
    { label: 'FAQs' },
  );

/** `secondary: true` adds an optional second (outline) button — homepage only. */
const ctaSection = (label = 'Call to action', { secondary = false } = {}) =>
  fields.object(
    {
      heading: text('Heading', { required: true }),
      expectation: text('What happens next (one line)', { required: true }),
      action: action('Button', true),
      ...(secondary ? { secondaryAction: action('Second button (outline, optional)') } : {}),
      sourceTag: fields.text({
        label: 'Analytics source tag',
        description: 'Lowercase-hyphenated identifier for this CTA, e.g. home-footer-cta.',
        validation: {
          isRequired: true,
          pattern: {
            regex: SOURCE_TAG_PATTERN,
            message: 'Lowercase letters, numbers and hyphens only.',
          },
        },
      }),
    },
    { label },
  );

const richSection = (label: string) =>
  fields.object(
    { heading: text('Heading', { required: true }), body: richText('Body') },
    { label },
  );

/** Homepage hero: background photo, logo as the page heading, tagline words. */
const brandHeroSection = (dir: string) =>
  fields.object(
    {
      heading: text('Page heading (read aloud in place of the logo)', { required: true }),
      logo: fields.image({
        label: 'Logo (white, on transparent)',
        directory: `public/images/${dir}`,
        publicPath: `/images/${dir}/`,
        validation: { isRequired: true },
      }),
      taglineWords: fields.array(text('Word', { required: true }), {
        label: 'Tagline words (shown with dots between them)',
        itemLabel: (p) => p.value || 'Word',
        validation: { length: { min: 1, max: 6 } },
      }),
      background: imageWithAlt('Background photo (darkened and tinted)', dir),
    },
    { label: 'Hero' },
  );

/** Eyebrow + heading + rich body, optionally with up to two buttons. */
const textSection = (label: string, { actions = false } = {}) =>
  fields.object(
    {
      eyebrow: text('Eyebrow (small line above heading)'),
      heading: text('Heading', { required: true }),
      body: richText('Body'),
      ...(actions
        ? { primaryAction: action('First button'), secondaryAction: action('Second button') }
        : {}),
    },
    { label },
  );

/** Card carousel on a brand band. No autoplay; scrolls by buttons, dots, swipe, or keyboard. */
const carouselSection = (dir: string) =>
  fields.object(
    {
      heading: text('Heading', { required: true }),
      cards: fields.array(
        fields.object({
          image: imageWithAlt('Image', dir, true),
          label: descriptiveText('Button text', 'Says where the card goes.', true),
          href: href('Link', true),
        }),
        {
          label: 'Cards (3 to 10)',
          itemLabel: (p) => p.fields.label.value || 'Card',
          validation: { length: { min: 3, max: 10 } },
        },
      ),
    },
    { label: 'Card carousel' },
  );

const listingSection = (label: string) =>
  fields.object(
    {
      heading: text('Heading', { required: true }),
      intro: text('Intro', { multiline: true }),
      emptyMessage: text('Message when the list is empty', { required: true }),
    },
    { label },
  );

const gallerySection = (dir: string) =>
  fields.object(
    {
      heading: text('Heading', { required: true }),
      images: fields.array(
        fields.object({
          image: fields.image({
            label: 'Image file',
            directory: `public/images/${dir}`,
            publicPath: `/images/${dir}/`,
            validation: { isRequired: true },
          }),
          alt: text('Alt text', { required: true, description: 'Describe what the image shows.' }),
          caption: text('Caption'),
        }),
        {
          label: 'Images',
          itemLabel: (p) => p.fields.alt.value || 'Image',
          validation: { length: { min: 1 } },
        },
      ),
    },
    { label: 'Media gallery' },
  );

/* ------------------------------------------------------------------------ */
/* Page shapes reused by several singletons                                  */
/* ------------------------------------------------------------------------ */

const singletonPath = (name: string) => `src/content/singletons/${name}`;

/** The six solution / workforce pages share one section order. */
const solutionPage = (label: string, name: string) =>
  singleton({
    label,
    path: singletonPath(name),
    format: { data: 'yaml' },
    schema: {
      seo: seoSection(),
      hero: heroSection(`singletons/${name}`),
      challenge: richSection('Challenge'),
      proof: proofStripSection(),
      approach: implementationStepsSection(),
      programs: programsSection('Programs'),
      caseStudies: caseStudiesSection('Case studies'),
      testimonial: testimonialSection(),
      faq: faqSection(),
      cta: ctaSection(),
    },
  });

/** Parents and homeschool pages share one section order. */
const familyPage = (label: string, name: string) =>
  singleton({
    label,
    path: singletonPath(name),
    format: { data: 'yaml' },
    schema: {
      seo: seoSection(),
      hero: heroSection(`singletons/${name}`),
      intro: richSection('Intro'),
      offerings: listingSection('Open-enrollment offerings (lists all offerings)'),
      faq: faqSection(),
      testimonial: testimonialSection(),
      cta: ctaSection(),
    },
  });

/* ------------------------------------------------------------------------ */
/* Config                                                                    */
/* ------------------------------------------------------------------------ */

export default config({
  storage: { kind: 'local' },
  ui: {
    brand: { name: 'Nerdvana' },
    navigation: {
      'Fixed pages': [
        'home',
        'solutionsOverview',
        'districtPartnerships',
        'aceExpandedLearning',
        'cteStemInnovation',
        'charterNetworks',
        'independentSchools',
        'preEts',
        'programsOverview',
        'impactHub',
        'resourcesIndex',
        'parents',
        'homeschool',
        'about',
        'contact',
        'policies',
      ],
      'Free-form pages': ['pages'],
      Content: ['programs', 'caseStudies', 'resources', 'testimonials', 'faqs', 'offerings'],
      Settings: ['siteSettings'],
    },
  },

  collections: {
    programs: collection({
      label: 'Programs',
      slugField: 'title',
      path: 'src/content/programs/*',
      format: { data: 'yaml' },
      schema: {
        title: slugField('Title'),
        summary: text('Summary', { required: true, multiline: true, max: 300 }),
        audience: audience(),
        gradeRange: text('Grade range', { required: true }),
        format: fields.multiselect({ label: 'Format', options: PROGRAM_FORMAT_OPTIONS }),
        duration: text('Duration', { required: true }),
        whatStudentsDo: richText('What students do'),
        outcomes: stringList('Outcomes', 'Outcome'),
        includes: stringList('What is included', 'Item'),
        partnerRequirements: stringList('Partner requirements', 'Requirement'),
        relatedCaseStudies: fields.multiRelationship({
          label: 'Related case studies',
          collection: 'caseStudies',
        }),
        relatedFaqs: fields.multiRelationship({ label: 'Related FAQs', collection: 'faqs' }),
        heroImage: imageWithAlt('Hero image', 'programs'),
        ctaLabel: text('Call-to-action button text', { required: true }),
        ctaHref: href('Call-to-action link', true),
      },
    }),

    caseStudies: collection({
      label: 'Case studies',
      slugField: 'title',
      path: 'src/content/case-studies/*',
      format: { data: 'yaml' },
      schema: {
        title: slugField('Title'),
        partnerName: text('Partner name', { required: true }),
        partnerContext: text('Partner context', { multiline: true }),
        challenge: text('Challenge', { multiline: true }),
        objectives: text('Objectives', { multiline: true }),
        deliveryModel: text('Delivery model', { multiline: true }),
        timeline: text('Timeline', { multiline: true }),
        reachStudents: fields.integer({ label: 'Students reached' }),
        reachCampuses: fields.integer({ label: 'Campuses reached' }),
        outcomes: stringList('Outcomes', 'Outcome'),
        studentQuote: text('Student quote', {
          multiline: true,
          description: 'Shown without a name, attributed to a student at the partner.',
        }),
        leaderQuote: fields.object(
          {
            text: text('Quote', { multiline: true }),
            name: text('Name'),
            role: text('Role'),
            organization: text('Organization'),
          },
          {
            label:
              'Leader quote (name, role and organization are required when a quote is entered)',
          },
        ),
        lessons: text('Lessons learned', { multiline: true }),
        nextPhase: text('Next phase', { multiline: true }),
        reportFile: fields.file({
          label: 'Full report (PDF)',
          directory: 'public/files/case-studies',
          publicPath: '/files/case-studies/',
        }),
        heroImage: imageWithAlt('Hero image', 'case-studies'),
      },
    }),

    resources: collection({
      label: 'Resources',
      slugField: 'title',
      path: 'src/content/resources/*',
      format: { data: 'yaml' },
      schema: {
        title: slugField('Title'),
        resourceType: fields.select({
          label: 'Type',
          options: RESOURCE_TYPE_OPTIONS,
          defaultValue: 'guide',
        }),
        audience: audience(),
        description: text('Description', { required: true, multiline: true }),
        file: fields.file({
          label: 'File',
          directory: 'public/files/resources',
          publicPath: '/files/resources/',
          validation: { isRequired: true },
        }),
        lastUpdated: fields.date({ label: 'Last updated', validation: { isRequired: true } }),
        relatedPages: fields.array(href('Page path', true), {
          label: 'Related pages',
          itemLabel: (p) => p.value || 'Page',
        }),
      },
    }),

    testimonials: collection({
      label: 'Testimonials',
      slugField: 'name',
      path: 'src/content/testimonials/*',
      format: { data: 'yaml' },
      schema: {
        name: slugField('Name'),
        quote: text('Quote', { required: true, multiline: true }),
        role: text('Role', { required: true }),
        organization: text('Organization', { required: true }),
        audience: audience(),
        permissionOnFile: fields.checkbox({
          label: 'Permission on file',
          description: 'Required. Unchecked testimonials never appear on the site.',
          defaultValue: false,
        }),
      },
    }),

    faqs: collection({
      label: 'FAQs',
      slugField: 'question',
      path: 'src/content/faqs/*',
      format: { data: 'yaml' },
      schema: {
        question: slugField('Question'),
        answer: richText('Answer', false),
        audience: audience(),
      },
    }),

    offerings: collection({
      label: 'Offerings (open enrollment)',
      slugField: 'title',
      path: 'src/content/offerings/*',
      format: { data: 'yaml' },
      schema: {
        title: slugField('Title'),
        ageRange: text('Age range', { required: true }),
        schedule: text('Schedule', { required: true }),
        price: text('Price', {
          required: true,
          description: 'As it should appear, e.g. a figure or "Free".',
        }),
        status: fields.select({
          label: 'Status',
          options: OFFERING_STATUS_OPTIONS,
          defaultValue: 'open',
        }),
        externalRegistrationUrl: fields.url({
          label: 'Registration link',
          validation: { isRequired: true },
        }),
        description: text('Description', { required: true, multiline: true }),
      },
    }),

    pages: collection({
      label: 'Free-form pages',
      slugField: 'title',
      path: 'src/content/pages/*',
      format: { data: 'yaml' },
      schema: {
        title: fields.slug({
          name: { label: 'Title', validation: { isRequired: true } },
          slug: {
            label: 'URL slug',
            description: `The page lives at /your-slug/. Reserved: ${RESERVED_PAGE_SLUGS.join(', ')}.`,
            validation: {
              pattern: {
                regex: PAGE_SLUG_PATTERN,
                message: 'Lowercase letters, numbers and hyphens only, and not a reserved word.',
              },
            },
          },
        }),
        seoTitle: text('Browser tab / search result title', { required: true, max: 70 }),
        seoDescription: text('Search result description', {
          required: true,
          multiline: true,
          max: 160,
        }),
        blocks: fields.blocks(
          {
            hero: { label: 'Hero', schema: heroSection('pages') },
            proofStrip: { label: 'Proof strip', schema: proofStripSection() },
            audienceRouter: { label: 'Audience router', schema: audienceRouterSection() },
            implementationSteps: {
              label: 'Implementation steps',
              schema: implementationStepsSection(),
            },
            programGrid: {
              label: 'Program grid (empty selection shows all)',
              schema: programsSection('Program grid'),
            },
            caseStudyGrid: {
              label: 'Case study grid (empty selection shows all)',
              schema: caseStudiesSection('Case study grid'),
            },
            testimonial: { label: 'Testimonial', schema: testimonialSection() },
            faqAccordion: { label: 'FAQ accordion', schema: faqSection() },
            ctaBand: { label: 'CTA band', schema: ctaSection('CTA band') },
            richText: {
              label: 'Rich text',
              schema: fields.object(
                { heading: text('Heading (optional)'), body: richText('Body') },
                { label: 'Rich text' },
              ),
            },
          },
          { label: 'Blocks', validation: { length: { min: 1 } } },
        ),
      },
    }),
  },

  singletons: {
    siteSettings: singleton({
      label: 'Site settings',
      path: singletonPath('site-settings'),
      format: { data: 'yaml' },
      schema: {
        siteName: text('Site name', { required: true }),
        logo: imageWithAlt('Header logo', 'site', true),
        primaryNav: fields.array(
          fields.object({ label: text('Label', { required: true }), href: href('Link', true) }),
          {
            label: 'Primary navigation',
            itemLabel: (p) => p.fields.label.value || 'Link',
            validation: { length: { max: 8 } },
          },
        ),
        headerAction: action('Header button (optional)'),
        footerTagline: text('Footer tagline'),
        footerLocation: text('Footer location line'),
        footerColumns: fields.array(
          fields.object({
            heading: text('Column heading', { required: true }),
            links: fields.array(
              fields.object({ label: text('Label', { required: true }), href: href('Link', true) }),
              { label: 'Links', itemLabel: (p) => p.fields.label.value || 'Link' },
            ),
          }),
          {
            label: 'Footer link columns',
            itemLabel: (p) => p.fields.heading.value || 'Column',
            validation: { length: { max: 4 } },
          },
        ),
        contact: fields.object(
          {
            email: text('Email', { required: true }),
            phone: text('Phone', { required: true }),
            street: text('Street address'),
            city: text('City'),
            region: text('State'),
            postalCode: text('ZIP code'),
          },
          { label: 'Contact details' },
        ),
        social: fields.array(
          fields.object({
            platform: fields.select({
              label: 'Platform',
              options: SOCIAL_PLATFORM_OPTIONS,
              defaultValue: 'linkedin',
            }),
            url: fields.url({ label: 'Profile URL', validation: { isRequired: true } }),
          }),
          { label: 'Social links', itemLabel: (p) => p.fields.platform.value },
        ),
        copyright: text('Copyright line', {
          required: true,
          description: 'Write {year} where the current year should appear.',
        }),
        labels: fields.object(
          {
            skipToContent: text('Skip link', { required: true }),
            primaryNavLabel: text('Primary navigation name (screen readers)', { required: true }),
            menuButton: text('Mobile menu button', { required: true }),
            footerNavLabel: text('Footer navigation name (screen readers)', { required: true }),
            socialNavLabel: text('Social links name (screen readers)', { required: true }),
            carouselPrevious: text('Carousel: previous button (screen readers)', {
              required: true,
            }),
            carouselNext: text('Carousel: next button (screen readers)', { required: true }),
            carouselShow: text('Carousel: dot button prefix, e.g. "Show"', { required: true }),
            offeringAgeRange: text('Offering: age range label', { required: true }),
            offeringSchedule: text('Offering: schedule label', { required: true }),
            offeringPrice: text('Offering: price label', { required: true }),
            offeringStatus: text('Offering: status label', { required: true }),
            offeringStatusOpen: text('Offering status: open', { required: true }),
            offeringStatusWaitlist: text('Offering status: waitlist', { required: true }),
            offeringStatusClosed: text('Offering status: closed', { required: true }),
            offeringRegister: text('Offering: register button', { required: true }),
            offeringJoinWaitlist: text('Offering: waitlist button', { required: true }),
            resourceDownload: text('Resource: download link', { required: true }),
            resourceUpdated: text('Resource: last updated label', { required: true }),
            opensInNewTab: text('"Opens in new tab" notice (screen readers)', { required: true }),
            notFoundTitle: text('404 page: heading', { required: true }),
            notFoundBody: text('404 page: text', { required: true }),
            notFoundLink: text('404 page: link text', { required: true }),
          },
          { label: 'Interface labels' },
        ),
      },
    }),

    home: singleton({
      label: 'Home',
      path: singletonPath('home'),
      format: { data: 'yaml' },
      schema: {
        seo: seoSection(),
        hero: brandHeroSection('singletons/home'),
        intro: textSection('Intro', { actions: true }),
        spotlight: carouselSection('singletons/home'),
        story: textSection('Text section'),
        proof: proofStripSection(),
        audienceRouter: audienceRouterSection(),
        cta: ctaSection('Call to action', { secondary: true }),
      },
    }),

    solutionsOverview: singleton({
      label: 'Solutions overview',
      path: singletonPath('solutions-overview'),
      format: { data: 'yaml' },
      schema: {
        seo: seoSection(),
        hero: heroSection('singletons/solutions-overview'),
        audienceRouter: audienceRouterSection(),
        steps: implementationStepsSection(),
        caseStudies: caseStudiesSection(),
        faq: faqSection(),
        cta: ctaSection(),
      },
    }),

    districtPartnerships: solutionPage('Solutions: District partnerships', 'district-partnerships'),
    aceExpandedLearning: solutionPage('Solutions: ACE expanded learning', 'ace-expanded-learning'),
    cteStemInnovation: solutionPage('Solutions: CTE & STEM innovation', 'cte-stem-innovation'),
    charterNetworks: solutionPage('Solutions: Charter networks', 'charter-networks'),
    independentSchools: solutionPage('Solutions: Independent schools', 'independent-schools'),
    preEts: solutionPage('Workforce: Pre-ETS', 'pre-ets'),

    programsOverview: singleton({
      label: 'Programs overview',
      path: singletonPath('programs-overview'),
      format: { data: 'yaml' },
      schema: {
        seo: seoSection(),
        hero: heroSection('singletons/programs-overview'),
        intro: richSection('Intro'),
        list: listingSection('Program list (lists all programs)'),
        cta: ctaSection(),
        detailLabels: fields.object(
          {
            audience: text('Audience', { required: true }),
            gradeRange: text('Grade range', { required: true }),
            format: text('Format', { required: true }),
            duration: text('Duration', { required: true }),
            whatStudentsDo: text('What students do', { required: true }),
            outcomes: text('Outcomes', { required: true }),
            includes: text('What is included', { required: true }),
            partnerRequirements: text('Partner requirements', { required: true }),
            relatedCaseStudies: text('Related case studies', { required: true }),
            relatedFaqs: text('Related FAQs', { required: true }),
          },
          { label: 'Program detail page headings' },
        ),
      },
    }),

    impactHub: singleton({
      label: 'Impact hub',
      path: singletonPath('impact-hub'),
      format: { data: 'yaml' },
      schema: {
        seo: seoSection(),
        hero: heroSection('singletons/impact-hub'),
        proof: proofStripSection(),
        list: listingSection('Case study list (lists all case studies)'),
        testimonial: testimonialSection(),
        cta: ctaSection(),
        detailLabels: fields.object(
          {
            partner: text('Partner', { required: true }),
            reach: text('Reach', { required: true }),
            reachStudents: text('Students reached', { required: true }),
            reachCampuses: text('Campuses reached', { required: true }),
            challenge: text('Challenge', { required: true }),
            objectives: text('Objectives', { required: true }),
            deliveryModel: text('Delivery model', { required: true }),
            timeline: text('Timeline', { required: true }),
            outcomes: text('Outcomes', { required: true }),
            studentQuoteAttribution: text('Student quote attribution', { required: true }),
            lessons: text('Lessons learned', { required: true }),
            nextPhase: text('Next phase', { required: true }),
            report: text('Report download link', { required: true }),
          },
          { label: 'Case study page headings' },
        ),
      },
    }),

    resourcesIndex: singleton({
      label: 'Resources index',
      path: singletonPath('resources-index'),
      format: { data: 'yaml' },
      schema: {
        seo: seoSection(),
        hero: heroSection('singletons/resources-index'),
        list: listingSection('Resource list (lists all resources)'),
        cta: ctaSection(),
      },
    }),

    parents: familyPage('Families: Parents', 'parents'),
    homeschool: familyPage('Families: Homeschool', 'homeschool'),

    about: singleton({
      label: 'About',
      path: singletonPath('about'),
      format: { data: 'yaml' },
      schema: {
        seo: seoSection(),
        hero: heroSection('singletons/about'),
        story: richSection('Story'),
        proof: proofStripSection(),
        gallery: gallerySection('singletons/about'),
        cta: ctaSection(),
      },
    }),

    contact: singleton({
      label: 'Planning & contact',
      path: singletonPath('contact'),
      format: { data: 'yaml' },
      schema: {
        seo: seoSection(),
        hero: heroSection('singletons/contact'),
        form: fields.object(
          {
            heading: text('Heading', { required: true }),
            intro: text('Intro', { multiline: true }),
            requiredNote: text('Required-field note', { required: true }),
            requiredMarker: text('Required marker (after each required label)', { required: true }),
            nameLabel: text('Name label', { required: true }),
            emailLabel: text('Email label', { required: true }),
            organizationLabel: text('Organization label', { required: true }),
            roleLabel: text('Role label', { required: true }),
            personaLabel: text('"I am a…" label', { required: true }),
            campusesLabel: text('Number of campuses label', { required: true }),
            timelineLabel: text('Timeline label', { required: true }),
            fundingLabel: text('Funding status label', { required: true }),
            goalsLabel: text('Goals label', { required: true }),
            consentLabel: text('Consent checkbox label', { required: true, multiline: true }),
            selectPrompt: text('Empty dropdown prompt', { required: true }),
            submitLabel: text('Submit button', { required: true }),
          },
          { label: 'Planning form' },
        ),
        direct: fields.object(
          {
            heading: text('Heading', { required: true }),
            intro: text('Intro', { multiline: true }),
          },
          { label: 'Direct contact (details come from Site settings)' },
        ),
        thanks: fields.object(
          {
            seo: seoSection(),
            heading: text('Heading', { required: true }),
            body: text('Text', { multiline: true }),
            linkLabel: text('Link text', { required: true }),
            linkHref: href('Link', true),
          },
          { label: 'Thank-you page (/contact/thanks/)' },
        ),
      },
    }),

    policies: singleton({
      label: 'Policies',
      path: singletonPath('policies'),
      format: { data: 'yaml' },
      schema: {
        seo: seoSection(),
        hero: heroSection('singletons/policies'),
        lastUpdated: fields.date({ label: 'Last updated', validation: { isRequired: true } }),
        lastUpdatedLabel: text('Last updated label', { required: true }),
        privacy: richSection('Privacy'),
        accessibility: richSection('Accessibility'),
        other: richSection('Other policies'),
      },
    }),
  },
});
