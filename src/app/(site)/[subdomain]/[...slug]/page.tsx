import { getPageBySlug, getFeaturedImage, resolveImageUrl } from '@/lib/wordpress';
import { SITES } from '@/lib/sites';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { RenderBlocks } from '@/components/RenderBlocks';
import ContactPage from '../contact/page';

const getSlugCandidates = (slug: string): string[] => {
  const contactGroup = [
    'contact-map',
    'contact',
    'contact-us',
    'contact-dave',
    'music-production-school-contact',
    'songwriting-school-contact',
  ];
  if (contactGroup.includes(slug) || slug.includes('contact')) {
    return [slug, ...contactGroup.filter((s) => s !== slug)];
  }
  const termsGroup = [
    'terms',
    'tc',
    'terms-and-conditions',
    'terms-conditions',
    'terms-compliancy',
    'compliancy',
    'terms-of-service',
    'garnish-los-angeles-terms',
    'songwriting-terms-conditions',
  ];
  if (termsGroup.includes(slug)) {
    return [slug, ...termsGroup.filter((s) => s !== slug)];
  }

  const privacyGroup = ['privacy-policy', 'privacy'];
  if (privacyGroup.includes(slug)) {
    return [slug, ...privacyGroup.filter((s) => s !== slug)];
  }

  const tuitionGroup = [
    'private-instruction',
    'bespoke-private-tuition',
    'private-tuition',
    'music-production-private-tuition',
  ];
  if (tuitionGroup.includes(slug)) {
    return [slug, ...tuitionGroup.filter((s) => s !== slug)];
  }

  const aboutGroup = ['about', 'about-us'];
  if (aboutGroup.includes(slug)) {
    return [slug, ...aboutGroup.filter((s) => s !== slug)];
  }

  return [slug];
};

import { parseWPBakery } from '@/lib/wpbakery';

interface Props {
  params: Promise<{
    subdomain: string;
    slug: string[];
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subdomain, slug } = await params;
  const cleanSlugArray = Array.isArray(slug) ? slug.filter(Boolean) : [slug].filter(Boolean);
  const targetSlug = cleanSlugArray[cleanSlugArray.length - 1] || '';
  const site = SITES[subdomain];
  const candidates = getSlugCandidates(targetSlug);
  
  try {
    const payload = await getPayload({ config: configPromise });
    const result = await payload.find({
      collection: 'pages',
      where: {
        and: [
          { slug: { in: candidates } },
          { tenant: { equals: subdomain } },
        ],
      },
    });
    if (result.docs.length > 0) {
      const sortedDocs = [...result.docs].sort((a, b) => {
        const indexA = candidates.indexOf(a.slug);
        const indexB = candidates.indexOf(b.slug);
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
      });
      const p = sortedDocs[0];
      return {
        title: `${p.title} | ${site?.name || 'Garnish Music Production'}`,
        description: p.seo?.metaDescription || `${p.title} at Garnish ${site?.city || ''}`,
      };
    }
  } catch {
    // Fallback if Payload DB not yet migrated
  }

  let page = null;
  for (const cand of candidates) {
    page = await getPageBySlug(subdomain, cand);
    if (page) break;
  }

  if (page && site) {
    return {
      title: `${page.title.rendered} | ${site.name}`,
      description: page.excerpt?.rendered.replace(/<[^>]*>/g, '').substring(0, 160) || `${page.title.rendered} at Garnish ${site.city}`,
    };
  }

  const formattedSlug = targetSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return {
    title: `${formattedSlug} | ${site?.name || 'Garnish Music Production'}`,
  };
}

export default async function DynamicSubdomainPage({ params }: Props) {
  const { subdomain, slug } = await params;
  const cleanSlugArray = Array.isArray(slug) ? slug.filter(Boolean) : [slug].filter(Boolean);
  const targetSlug = cleanSlugArray[cleanSlugArray.length - 1] || '';
  const site = SITES[subdomain] || SITES.www;
  const candidates = getSlugCandidates(targetSlug);

  // 1. First: Check if this page has been migrated to Payload CMS v3
  try {
    const payload = await getPayload({ config: configPromise });
    const result = await payload.find({
      collection: 'pages',
      where: {
        and: [
          { slug: { in: candidates } },
          { tenant: { equals: subdomain } },
        ],
      },
    });

    if (result.docs.length > 0) {
      const sortedDocs = [...result.docs].sort((a, b) => {
        const indexA = candidates.indexOf(a.slug);
        const indexB = candidates.indexOf(b.slug);
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
      });
      const payloadPage = sortedDocs[0];
      return (
        <main className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
          <article className="max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-14 shadow-sm border border-slate-100/80">
            <span 
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
              style={{ color: site.accentColor, backgroundColor: `${site.accentColor}10` }}
            >
              Garnish {site.city}
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight font-display mb-8">
              {payloadPage.title}
            </h1>

            {(() => {
              const imgObj = typeof payloadPage.featuredImage === 'object' && payloadPage.featuredImage !== null ? payloadPage.featuredImage : null;
              let imgUrl = imgObj?.url?.startsWith('http') ? imgObj.url : null;
              if (!imgUrl) {
                const rawUrl = imgObj?.wpUploadPath
                  ? `/uploads/${imgObj.wpUploadPath}`
                  : (imgObj?.url || (imgObj?.filename ? `/media/${imgObj.filename}` : null));
                imgUrl = resolveImageUrl(rawUrl);
              }
              if (!imgUrl || !imgObj) return null;
              return (
                <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-100 mb-8 shadow-sm border border-slate-100">
                  <Image
                    src={imgUrl}
                    alt={imgObj.alt || payloadPage.title}
                    fill
                    priority
                    unoptimized={imgUrl.startsWith('http')}
                    sizes="(max-w-768px) 100vw, 900px"
                    className="object-cover"
                  />
                </div>
              );
            })()}

            {/* Render migrated WPBakery / layout blocks */}
            <RenderBlocks layout={payloadPage.layout || []} site={site} />
          </article>
        </main>
      );
    }
  } catch {
    // Payload DB not yet migrated or offline, proceed to WordPress API check
  }

  let page = null;
  for (const cand of candidates) {
    page = await getPageBySlug(subdomain, cand);
    if (page) break;
  }

  // 2. If found in legacy WordPress DB, render dynamic WP Page content
  if (page) {
    const featuredImage = getFeaturedImage(page);
    const hasWPBakery = page.content.rendered.includes('[vc_');
    return (
      <main className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <article className={hasWPBakery ? "max-w-6xl mx-auto bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100/80" : "max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-14 shadow-sm border border-slate-100/80"}>
          <span 
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
            style={{ color: site.accentColor, backgroundColor: `${site.accentColor}10` }}
          >
            Garnish {site.city}
          </span>
          <h1 
            className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight font-display mb-8"
            dangerouslySetInnerHTML={{ __html: page.title.rendered }}
          />

          {featuredImage && typeof featuredImage.url === 'string' && featuredImage.url.trim() !== '' && (
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-100 my-8 shadow-sm border border-slate-100">
              <Image
                src={featuredImage.url}
                alt={featuredImage.alt}
                fill
                priority
                unoptimized={featuredImage.url.startsWith('http')}
                sizes="(max-w-768px) 100vw, 900px"
                className="object-cover"
              />
            </div>
          )}

          <div 
            className="wp-content prose prose-slate max-w-none"
            style={{ '--accent': site.accentColor } as React.CSSProperties}
            dangerouslySetInnerHTML={{ __html: parseWPBakery(page.content.rendered) }}
          />
        </article>
      </main>
    );
  }

  // 2. Custom Brand Fallbacks for known navigation links if not yet created in WP DB
  const brandFallbackSlugs = [
    'about', 'about-us', 'why-us', 'instructors', 'testimonials', 'faqs', 'partners',
    'terms', 'tc', 'terms-and-conditions', 'terms-conditions', 'compliancy', 'terms-compliancy',
    'privacy-policy', 'privacy',
    'bespoke-private-tuition', 'private-tuition', 'private-instruction',
    'music-production-private-tuition', 'private-lessons',
    'open-house', 'open-day', 'live-online', 'online-courses',
    'international-academy', 'gift', 'summer-camp',
  ];
  if (brandFallbackSlugs.includes(targetSlug)) {
    const titleMap: Record<string, string> = {
      about: `About Garnish ${site.city}`,
      'about-us': `About Garnish ${site.city}`,
      'why-us': `Why Choose Garnish ${site.city}`,
      instructors: `Our World-Class Instructors`,
      testimonials: `Student Success Stories & Reviews`,
      faqs: `Frequently Asked Questions`,
      partners: `Industry Hardware & Software Partners`,
      terms: `Terms & Conditions (${site.name})`,
      tc: `Terms & Conditions (${site.name})`,
      'terms-and-conditions': `Terms & Conditions (${site.name})`,
      'terms-conditions': `Terms & Conditions (${site.name})`,
      compliancy: `Compliancy (${site.name})`,
      'terms-compliancy': `Compliancy & Terms (${site.name})`,
      'privacy-policy': `Privacy Policy (${site.name})`,
      privacy: `Privacy Policy (${site.name})`,
      'bespoke-private-tuition': `Private Tuition & Bespoke Instruction`,
      'private-tuition': `Private Tuition & Bespoke Instruction`,
      'private-instruction': `Private Tuition & Bespoke Instruction`,
      'music-production-private-tuition': `Private Tuition & Bespoke Instruction`,
      'private-lessons': `Private Lessons at Garnish ${site.city}`,
      'open-house': `Open House — Garnish ${site.city}`,
      'open-day': `Open Day — Garnish ${site.city}`,
      'live-online': `Live Online Courses — Garnish`,
      'online-courses': `Online Music Production Courses`,
      'international-academy': `International Academy`,
      gift: `Gift Certificates — Garnish`,
      'summer-camp': `Summer Camp — Garnish ${site.city}`,
    };

    return (
      <main className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-14 shadow-sm border border-slate-100/80 text-center">
          <span 
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
            style={{ color: site.accentColor, backgroundColor: `${site.accentColor}10` }}
          >
            Garnish Academy
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display mb-6">
            {titleMap[targetSlug] || targetSlug.replace(/-/g, ' ').toUpperCase()}
          </h1>
          <p className="text-base text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10">
            Garnish Music Production is a boutique academy where class sizes never exceed 6-8 students. Each workstation is outfitted with industry-standard hardware, acoustic treatment, and professional DAWs.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 text-left mb-10">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-2">Boutique Class Sizes</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Guaranteed 1-on-1 mentor interaction and hands-on mixing time every single session.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-2">Active Pros as Tutors</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Learn directly from chart-topping producers, Grammy nominees, and touring sound engineers.</p>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Link
              href="/programs"
              className="px-6 py-3 rounded-xl text-sm font-bold text-white shadow-md transition-all"
              style={{ backgroundColor: site.accentColor }}
            >
              Browse Programs
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
            >
              Contact Admissions
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // 3. If contact-related slug not found in DB, directly render Contact Page component
  if (targetSlug.includes('contact') || ['contact-map', 'contact-us', 'get-in-touch', 'location', 'map'].includes(targetSlug)) {
    return <ContactPage params={params} />;
  }

  // 4. Generic branded fallback for any unrecognised slug — avoids a raw 404
  return (
    <main className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-8 sm:p-14 shadow-sm border border-slate-100/80 text-center">
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
          style={{ color: site.accentColor, backgroundColor: `${site.accentColor}10` }}
        >
          Garnish {site.city}
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display mb-6">
          {targetSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </h1>
        <p className="text-base text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10">
          This page is coming soon for Garnish {site.city}. In the meantime, explore our full range of courses or contact our admissions team.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl text-sm font-bold text-white shadow-md transition-all"
            style={{ backgroundColor: site.accentColor }}
          >
            Back to Home
          </Link>
          <Link
            href="/contact"
            className="px-6 py-3 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
          >
            Contact Admissions
          </Link>
        </div>
      </div>
    </main>
  );
}

