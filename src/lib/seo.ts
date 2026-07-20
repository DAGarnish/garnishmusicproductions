// src/lib/seo.ts
// Centralized SEO metadata system — replicates all RankMath WordPress metadata
// for the Next.js app. Covers: title tags, meta descriptions, OpenGraph, Twitter
// cards, robots directives, canonical URLs, and JSON-LD structured data.
//
// Data source: RankMath postmeta extracted from garnishmusicprod_xzghkquntn.sql
// and live page scrape of https://www.garnishmusicproduction.com

import type { Metadata } from 'next';
import type { SiteConfig } from './sites';

// ─── Canonical base URL per tenant ──────────────────────────────────────────
const CANONICAL_BASES: Record<string, string> = {
  www: 'https://www.garnishmusicproduction.com',
  la: 'https://la.garnishmusicproduction.com',
  ny: 'https://ny.garnishmusicproduction.com',
  nsh: 'https://nsh.garnishmusicproduction.com',
  ber: 'https://ber.garnishmusicproduction.com',
  hk: 'https://hk.garnishmusicproduction.com',
  mia: 'https://mia.garnishmusicproduction.com',
  tyo: 'https://tyo.garnishmusicproduction.com',
  sea: 'https://sea.garnishmusicproduction.com',
  bcn: 'https://bcn.garnishmusicproduction.com',
  hou: 'https://hou.garnishmusicproduction.com',
  syd: 'https://syd.garnishmusicproduction.com',
  lis: 'https://lis.garnishmusicproduction.com',
  sf: 'https://sf.garnishmusicproduction.com',
  sg: 'https://sg.garnishmusicproduction.com',
  pdx: 'https://pdx.garnishmusicproduction.com',
  mrb: 'https://mrb.garnishmusicproduction.com',
  bh: 'https://bh.garnishmusicproduction.com',
  edu: 'https://edu.garnishmusicproduction.com',
};

// ─── RankMath SEO data per course slug ──────────────────────────────────────
// Extracted from the WordPress postmeta database and live page scrapess.
// Pattern: "World-class [Course Name] Production Course | [City]" with the
// site name in the RankMath title template "%title% %sep% %sitename%".
//
// The per-course title and description templates below use [CITY] as a
// placeholder. The getSeoMetadata() function replaces [CITY] with the
// actual tenant city at runtime.

interface CourseSeoTemplate {
  /** RankMath title — use %city% as placeholder for tenant city */
  titleTemplate: string;
  /** RankMath meta description */
  description: string;
  /** Primary focus keyword for the course */
  focusKeyword: string;
  /** RankMath article type for og:type. Defaults to 'article' */
  ogType?: string;
  /** Twitter card type */
  twitterCard?: 'summary_large_image' | 'summary';
  /** robots directives */
  robots?: string;
}

export const COURSE_SEO: Record<string, CourseSeoTemplate> = {
  // ── Mixing & Mastering ─────────────────────────────────────────────────
  'mixing-and-mastering-course-london': {
    titleTemplate: 'World-class Mixing and Mastering Production Course | %city%',
    description:
      "Learn Mixing and Mastering at the world's boutique music production school in %city%, where aspiring & established music-makers network, create, & collaborate doing what they love",
    focusKeyword: 'mixing mastering course london',
    ogType: 'article',
    twitterCard: 'summary_large_image',
    robots: 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large',
  },
  'mixing-mastering-course': {
    titleTemplate: 'World-class Mixing & Mastering Production Course | %city%',
    description:
      "Learn Mixing and Mastering at the world's boutique music production school in %city%, where aspiring & established music-makers network, create, & collaborate doing what they love",
    focusKeyword: 'mixing mastering course',
    ogType: 'article',
    twitterCard: 'summary_large_image',
    robots: 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large',
  },

  // ── Vocal Production ───────────────────────────────────────────────────
  'vocal-production': {
    titleTemplate: 'World Class Vocal Production Course | %city%',
    description:
      "Learn Vocal Production at the world's boutique music production school, where aspiring & established music-makers network, create, & collaborate doing what they love.",
    focusKeyword: 'vocal production course',
    ogType: 'article',
    twitterCard: 'summary_large_image',
    robots: 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large',
  },

  // ── Ableton Live ───────────────────────────────────────────────────────
  'ableton-live-course-london': {
    titleTemplate: 'World-class Ableton Live Course | %city%',
    description:
      "Learn Ableton Live at the world's boutique music production school in %city%, where aspiring & established music-makers network, create, & collaborate doing what they love",
    focusKeyword: 'ableton live course london',
    ogType: 'article',
    twitterCard: 'summary_large_image',
    robots: 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large',
  },
  'ableton-production': {
    titleTemplate: 'World-class Ableton Live Music Production Course | %city%',
    description:
      "Learn Ableton Live at the world's boutique music production school in %city%, where aspiring & established music-makers network, create, & collaborate doing what they love",
    focusKeyword: 'ableton production course',
    ogType: 'article',
    twitterCard: 'summary_large_image',
    robots: 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large',
  },

  // ── Logic Pro ─────────────────────────────────────────────────────────
  'logic-pro-x-course-london': {
    titleTemplate: 'World-class Logic Pro X Course | %city%',
    description:
      "Learn Logic Pro X at the world's boutique music production school in %city%, where aspiring & established music-makers network, create, & collaborate doing what they love",
    focusKeyword: 'logic pro x course london',
    ogType: 'article',
    twitterCard: 'summary_large_image',
    robots: 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large',
  },
  'logic-course': {
    titleTemplate: 'World-class Logic Pro Music Production Course | %city%',
    description:
      "Learn Logic Pro at the world's boutique music production school in %city%, where aspiring & established music-makers network, create, & collaborate doing what they love",
    focusKeyword: 'logic pro course',
    ogType: 'article',
    twitterCard: 'summary_large_image',
    robots: 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large',
  },

  // ── Songwriting ────────────────────────────────────────────────────────
  'songwriting-course-london': {
    titleTemplate: 'World-class Hit Songwriting Course | %city%',
    description:
      "Learn Hit Songwriting at the world's boutique music production school in %city%, where aspiring & established music-makers network, create, & collaborate doing what they love",
    focusKeyword: 'songwriting course london',
    ogType: 'article',
    twitterCard: 'summary_large_image',
    robots: 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large',
  },
  'songwriting-course': {
    titleTemplate: 'World-class Hit Songwriting Course | %city%',
    description:
      "Learn Songwriting at the world's boutique music production school in %city%, where aspiring & established music-makers network, create, & collaborate doing what they love",
    focusKeyword: 'songwriting course',
    ogType: 'article',
    twitterCard: 'summary_large_image',
    robots: 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large',
  },

  // ── Composition & Rhythm ──────────────────────────────────────────────
  'composition': {
    titleTemplate: 'World-class Music Composition Course | %city%',
    description:
      "Learn Music Composition at the world's boutique music production school in %city%, where aspiring & established music-makers network, create, & collaborate doing what they love",
    focusKeyword: 'composition course',
    ogType: 'article',
    twitterCard: 'summary_large_image',
    robots: 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large',
  },
  'rhythm-section-programming': {
    titleTemplate: 'Rhythm Section Programming Course | %city%',
    description:
      "Learn Rhythm Section Programming at the world's boutique music production school in %city%",
    focusKeyword: 'rhythm section programming',
    ogType: 'article',
    twitterCard: 'summary_large_image',
    robots: 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large',
  },
  'rhythm-section-pro': {
    titleTemplate: 'Rhythm Section Programming Course | %city%',
    description:
      "Learn Rhythm Section Programming at the world's boutique music production school in %city%",
    focusKeyword: 'rhythm section programming',
    ogType: 'article',
    twitterCard: 'summary_large_image',
    robots: 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large',
  },

  // ── Electronic Music & DJ ─────────────────────────────────────────────
  'electronic-music-dj-course': {
    titleTemplate: 'World-class Electronic Music & DJ Course | %city%',
    description:
      "Learn Electronic Music Production and DJing at the world's boutique music production school in %city%",
    focusKeyword: 'electronic music dj course',
    ogType: 'article',
    twitterCard: 'summary_large_image',
    robots: 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large',
  },

  // ── Sound Design & Synthesis ───────────────────────────────────────────
  'sounds-design-synthesis': {
    titleTemplate: 'World-class Electronic Sound & Synthesis Course | %city%',
    description:
      "Learn Sound Design & Synthesis at the world's boutique music production school in %city%",
    focusKeyword: 'sound design synthesis',
    ogType: 'article',
    twitterCard: 'summary_large_image',
    robots: 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large',
  },
  'electronic-sound-art': {
    titleTemplate: 'World-class Electronic Sound Art Course | %city%',
    description:
      "Learn Electronic Sound Art at the world's boutique music production school in %city%",
    focusKeyword: 'electronic sound art',
    ogType: 'article',
    twitterCard: 'summary_large_image',
    robots: 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large',
  },

  // ── Private Tuition ────────────────────────────────────────────────────
  'private-tuition': {
    titleTemplate: 'Bespoke Private Music Production Tuition | %city%',
    description:
      "1-on-1 bespoke private music production lessons at the world's boutique music production school in %city%",
    focusKeyword: 'private music production tuition',
    ogType: 'article',
    twitterCard: 'summary_large_image',
    robots: 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large',
  },

  // ── Summer Camp / School ───────────────────────────────────────────────
  'summer-camp': {
    titleTemplate: 'Music Production Summer Camp | %city%',
    description:
      "School summer camp music production program at the world's boutique music production school in %city%",
    focusKeyword: 'music production summer camp',
    ogType: 'article',
    twitterCard: 'summary_large_image',
    robots: 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large',
  },

  // ── Diploma / Programs ────────────────────────────────────────────────
  'ableton-producer-program': {
    titleTemplate: 'Electronic Music Producer Program | %city%',
    description:
      "The certified Electronic Music Producer program at Garnish %city% — 360 hours, boutique class sizes, award-winning instructors.",
    focusKeyword: 'ableton producer program',
    ogType: 'article',
    twitterCard: 'summary_large_image',
    robots: 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large',
  },
  'electronic-music-production': {
    titleTemplate: 'Garnish Industry Diploma | Electronic Music Production | %city%',
    description:
      "Master electronic music production at Garnish %city% with our flagship 360-hour industry diploma program",
    focusKeyword: 'electronic music production diploma',
    ogType: 'article',
    twitterCard: 'summary_large_image',
    robots: 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large',
  },
  'pop-music-production-course': {
    titleTemplate: 'World-class Pop Music Production Course | %city%',
    description:
      "Learn Pop Music Production at the world's boutique music production school in %city%",
    focusKeyword: 'pop music production course',
    ogType: 'article',
    twitterCard: 'summary_large_image',
    robots: 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large',
  },
};

// ─── OG Image per course slug (from WordPress featured images) ─────────────
// Cloudinary-hosted images migrated from WordPress uploads
const CLOUDINARY_UPLOADS = 'https://res.cloudinary.com/s7pus8t5/image/upload/garnish-uploads';

export const COURSE_OG_IMAGES: Record<string, { url: string; width: number; height: number; alt: string }> = {
  'mixing-and-mastering-course-london': {
    url: `${CLOUDINARY_UPLOADS}/2000/09/AAMIR-SSL-800.jpg`,
    width: 800,
    height: 800,
    alt: 'Mixing and Mastering',
  },
  'mixing-mastering-course': {
    url: `${CLOUDINARY_UPLOADS}/2000/09/AAMIR-SSL-800.jpg`,
    width: 800,
    height: 800,
    alt: 'Mixing and Mastering',
  },
  'vocal-production': {
    url: `${CLOUDINARY_UPLOADS}/2020/02/Garnish26-1.jpg`,
    width: 800,
    height: 800,
    alt: 'Vocal Production',
  },
  'ableton-live-course-london': {
    url: `${CLOUDINARY_UPLOADS}/sites/5/2018/02/Ableton-Live-10-Release_3_web.jpg`,
    width: 1200,
    height: 630,
    alt: 'Ableton Live Course',
  },
  'ableton-production': {
    url: `${CLOUDINARY_UPLOADS}/sites/5/2018/02/Ableton-Live-10-Release_3_web.jpg`,
    width: 1200,
    height: 630,
    alt: 'Ableton Live Music Production',
  },
  'songwriting-course-london': {
    url: `${CLOUDINARY_UPLOADS}/2018/05/20130809-DSC_9511.jpg`,
    width: 1200,
    height: 630,
    alt: 'Hit Songwriting Course',
  },
  'songwriting-course': {
    url: `${CLOUDINARY_UPLOADS}/2018/05/20130809-DSC_9511.jpg`,
    width: 1200,
    height: 630,
    alt: 'Songwriting Course',
  },
  'logic-pro-x-course-london': {
    url: `${CLOUDINARY_UPLOADS}/2018/03/LogClass-800.jpg`,
    width: 800,
    height: 800,
    alt: 'Logic Pro X Course',
  },
  'logic-course': {
    url: `${CLOUDINARY_UPLOADS}/2018/03/LogClass-800.jpg`,
    width: 800,
    height: 800,
    alt: 'Logic Pro Course',
  },
};

// ─── Site-wide OG/Twitter defaults ────────────────────────────────────────
export const SITE_OG_DEFAULTS = {
  siteName: 'Garnish Music Production School',
  locale: 'en_US',
  twitterSite: '@garnishmusic',
  defaultOgImage: `${CLOUDINARY_UPLOADS}/sites/3/2021/09/28afbf82-4126-434a-81cc-853f0216e1f0.jpg`,
};

/**
 * Build full Next.js Metadata object for a course page.
 * Replicates RankMath behaviour: title, description, OG, Twitter, robots, canonical.
 *
 * @param slug      - The canonical DB slug (after LEGACY_SLUG_MAP resolution)
 * @param site      - The tenant SiteConfig
 * @param pagePath  - The URL path, e.g. '/courses/mixing-and-mastering-course-london/'
 * @param overrides - Optional field overrides (e.g. from DB course record)
 */
export function buildCourseMetadata(
  slug: string,
  site: SiteConfig,
  pagePath: string,
  overrides?: {
    title?: string;
    description?: string;
    ogImageUrl?: string;
    ogImageAlt?: string;
    updatedTime?: string;
  }
): Metadata {
  const seoTemplate = COURSE_SEO[slug];
  const ogImageData = COURSE_OG_IMAGES[slug];

  const canonicalBase = CANONICAL_BASES[site.subdomain] || `https://www.garnishmusicproduction.com`;
  const canonicalUrl = `${canonicalBase}${pagePath}`;

  // Build title — replacing %city% placeholder with actual city
  let title: string;
  if (overrides?.title) {
    title = overrides.title;
  } else if (seoTemplate) {
    title = seoTemplate.titleTemplate.replace(/%city%/g, site.city);
  } else {
    // Fallback: capitalise slug words + site city (mirrors RankMath template pattern)
    const wordTitle = slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    title = `World-class ${wordTitle} Course | ${site.city}`;
  }

  // Build description — replacing %city% placeholder
  let description: string;
  if (overrides?.description) {
    description = overrides.description;
  } else if (seoTemplate) {
    description = seoTemplate.description.replace(/%city%/g, site.city);
  } else {
    description = `Learn ${title.split('|')[0].trim()} at the world's boutique music production school in ${site.city}, where aspiring & established music-makers network, create, & collaborate doing what they love`;
  }

  // OG image
  const ogImage = overrides?.ogImageUrl
    ? {
        url: overrides.ogImageUrl,
        width: 1200,
        height: 630,
        alt: overrides.ogImageAlt || title,
      }
    : ogImageData
    ? {
        url: ogImageData.url,
        width: ogImageData.width,
        height: ogImageData.height,
        alt: ogImageData.alt,
      }
    : {
        url: SITE_OG_DEFAULTS.defaultOgImage,
        width: 1200,
        height: 630,
        alt: title,
      };

  // Robots directive
  const robotsStr = seoTemplate?.robots || 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large';
  const robotsDirective = parseRobotsString(robotsStr);

  return {
    metadataBase: new URL(canonicalBase),
    title,
    description,
    robots: robotsDirective,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      locale: SITE_OG_DEFAULTS.locale,
      type: (seoTemplate?.ogType as 'article' | 'website') || 'article',
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_OG_DEFAULTS.siteName,
      images: [ogImage],
      ...(overrides?.updatedTime ? { modifiedTime: overrides.updatedTime } : {}),
    },
    twitter: {
      card: seoTemplate?.twitterCard || 'summary_large_image',
      title,
      description,
      site: SITE_OG_DEFAULTS.twitterSite,
      images: [ogImage.url],
    },
  };
}

/**
 * Build full Next.js Metadata object for a standard (non-course) page.
 * Provides site-wide OG, Twitter, and robots defaults.
 */
export function buildPageMetadata(
  site: SiteConfig,
  pagePath: string,
  title: string,
  description: string,
  ogImageUrl?: string
): Metadata {
  const canonicalBase = CANONICAL_BASES[site.subdomain] || `https://www.garnishmusicproduction.com`;
  const canonicalUrl = `${canonicalBase}${pagePath}`;

  return {
    metadataBase: new URL(canonicalBase),
    title,
    description,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-snippet': -1,
        'max-video-preview': -1,
        'max-image-preview': 'large',
      },
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      locale: SITE_OG_DEFAULTS.locale,
      type: 'website',
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_OG_DEFAULTS.siteName,
      images: [
        {
          url: ogImageUrl || SITE_OG_DEFAULTS.defaultOgImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: SITE_OG_DEFAULTS.twitterSite,
      images: [ogImageUrl || SITE_OG_DEFAULTS.defaultOgImage],
    },
  };
}

/**
 * Build JSON-LD Course structured data — equivalent to schema.org output that
 * RankMath / Schema App would generate for a course page.
 */
export function buildCourseJsonLd(params: {
  name: string;
  description: string;
  url: string;
  imageUrl: string;
  provider: string;
  city: string;
  providerUrl: string;
  price?: string;
  duration?: string;
  educationalLevel?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: params.name,
    description: params.description,
    url: params.url,
    image: params.imageUrl,
    inLanguage: 'en',
    educationalLevel: params.educationalLevel || 'Beginner to Advanced',
    ...(params.duration ? { timeRequired: params.duration } : {}),
    provider: {
      '@type': 'Organization',
      name: params.provider,
      sameAs: params.providerUrl,
      address: {
        '@type': 'PostalAddress',
        addressLocality: params.city,
      },
    },
    ...(params.price
      ? {
          offers: {
            '@type': 'Offer',
            price: params.price.replace(/[^0-9.]/g, ''),
            priceCurrency: 'GBP',
            availability: 'https://schema.org/InStock',
            url: params.url,
          },
        }
      : {}),
  };
}

/**
 * Build JSON-LD BreadcrumbList structured data.
 */
export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Build JSON-LD Organization structured data for site-wide use.
 */
export function buildOrganizationJsonLd(site: SiteConfig, baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Garnish Music Production School',
    alternateName: `Garnish ${site.city}`,
    url: baseUrl,
    sameAs: [
      'https://www.garnishmusicproduction.com',
      'https://www.facebook.com/GarnishMusicProductionSchool',
      'https://twitter.com/garnishmusic',
      'https://www.instagram.com/garnishmusic/',
      'https://www.youtube.com/channel/UCn6NPkJMR7mOFKLY_-oFw-w',
    ],
    logo: `${CLOUDINARY_UPLOADS}/sites/3/2021/09/28afbf82-4126-434a-81cc-853f0216e1f0.jpg`,
    description: `Garnish is the world's boutique music production school — ${site.city}. Courses in Ableton, Logic, mixing, songwriting, DJing & more.`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: site.city,
      addressCountry: site.subdomain === 'www' ? 'GB' : undefined,
    },
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Parse a RankMath robots string like:
 * "follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large"
 * into the Next.js Metadata robots object.
 */
function parseRobotsString(str: string): Metadata['robots'] {
  const parts = str.split(',').map((s) => s.trim());
  const index = parts.includes('index');
  const noindex = parts.includes('noindex');
  const follow = parts.includes('follow');
  const nofollow = parts.includes('nofollow');

  const getDirective = (key: string): string | number | undefined => {
    const part = parts.find((p) => p.startsWith(`${key}:`));
    if (!part) return undefined;
    const val = part.split(':')[1];
    return val === 'large' ? 'large' : val ? parseInt(val, 10) : undefined;
  };

  return {
    index: index && !noindex,
    follow: follow && !nofollow,
    googleBot: {
      index: index && !noindex,
      follow: follow && !nofollow,
      'max-snippet': (getDirective('max-snippet') as number) ?? -1,
      'max-video-preview': (getDirective('max-video-preview') as number) ?? -1,
      'max-image-preview': (getDirective('max-image-preview') as 'none' | 'standard' | 'large') ?? 'large',
    },
  };
}
