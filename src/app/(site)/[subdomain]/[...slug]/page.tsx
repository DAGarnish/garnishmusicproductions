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

const parseWPBakery = (html: string): string => {
  if (!html) return '';

  let content = html;

  // Replace HTML quote entities and curly quotes with straight quotes for easier matching
  content = content
    .replace(/&#8221;/g, '"')
    .replace(/&#8220;/g, '"')
    .replace(/&#8216;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8243;/g, '"')
    .replace(/”/g, '"')
    .replace(/“/g, '"')
    .replace(/‘/g, "'")
    .replace(/’/g, "'");

  // Clean up paragraph and line break tags that wrap or touch shortcodes
  content = content
    .replace(/<p>\s*(\[\/?vc_[^\]]+\])\s*<\/p>/gi, '$1')
    .replace(/<p>\s*(\[\/?vc_[^\]]+\])/gi, '$1')
    .replace(/(\[\/?vc_[^\]]+\])\s*<\/p>/gi, '$1')
    .replace(/<br\s*\/?>\s*(\[\/?vc_[^\]]+\])/gi, '$1')
    .replace(/(\[\/?vc_[^\]]+\])\s*<br\s*\/?>/gi, '$1');

  // 1. Process vc_video link="..." shortcodes into responsive YouTube/Vimeo iframes
  content = content.replace(/\[vc_video\s+[^\]]*link=["']([^"']+)["'][^\]]*\]/gi, (match, url) => {
    let embedUrl = url;
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const matchId = url.match(regExp);
      if (matchId && matchId[2].length === 11) {
        embedUrl = `https://www.youtube.com/embed/${matchId[2]}`;
      }
    } else if (url.includes('vimeo.com')) {
      const matchId = url.match(/vimeo\.com\/(\d+)/);
      if (matchId && matchId[1]) {
        embedUrl = `https://player.vimeo.com/video/${matchId[1]}`;
      }
    }
    return `
      <div class="relative aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-sm border border-slate-100/80 my-6 bg-slate-50">
        <iframe src="${embedUrl}" class="absolute inset-0 w-full h-full" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
    `;
  });

  // 2. Process vc_single_image shortcodes
  content = content.replace(/\[vc_single_image\s+[^\]]*\]/gi, (match) => {
    const urlMatch = match.match(/url\(([^)]+)\)/i);
    let imageUrl = '/studio-hero.png';
    if (urlMatch && urlMatch[1]) {
      imageUrl = urlMatch[1].replace(/\\/g, '').replace(/['"]/g, '');
      const resolved = resolveImageUrl(imageUrl);
      if (resolved) imageUrl = resolved;
    }
    return `
      <div class="relative aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-sm border border-slate-100 my-6 bg-slate-50">
        <img src="${imageUrl}" alt="Course Image" class="object-cover w-full h-full" />
      </div>
    `;
  });

  // 3. Process structural shortcodes (vc_row, vc_column)
  content = content.replace(/\[vc_row\s*([^\]]*)\]/gi, (match, attrs) => {
    const urlMatch = attrs.match(/url\(([^)]+)\)/i);
    let styleAttr = '';
    let extraClass = '';
    if (urlMatch && urlMatch[1]) {
      const bgUrl = urlMatch[1].replace(/\\/g, '').replace(/['"]/g, '').split('?')[0];
      styleAttr = `style="background-image: url('${bgUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat;"`;
      extraClass = ' p-8 rounded-3xl border border-slate-100 my-8 text-white';
    }
    return `<div class="flex flex-wrap gap-8 my-8 w-full${extraClass}" ${styleAttr}>`;
  });
  content = content.replace(/\[\/vc_row\]/gi, '</div>');

  content = content.replace(/\[vc_row_inner\s*([^\]]*)\]/gi, '<div class="flex flex-wrap gap-6 my-4 w-full">');
  content = content.replace(/\[\/vc_row_inner\]/gi, '</div>');

  content = content.replace(/\[vc_column\s*([^\]]*)\]/gi, (match, attrs) => {
    const widthMatch = attrs.match(/width=["']([^"']+)["']/i);
    const widthVal = widthMatch ? widthMatch[1] : '1/1';
    
    let widthClass = 'w-full';
    if (widthVal === '1/2') widthClass = 'w-full md:w-[calc(50%-1rem)]';
    else if (widthVal === '1/3') widthClass = 'w-full md:w-[calc(33.333%-1rem)]';
    else if (widthVal === '2/3') widthClass = 'w-full md:w-[calc(66.666%-1rem)]';
    else if (widthVal === '1/4') widthClass = 'w-full md:w-[calc(25%-1rem)]';
    else if (widthVal === '3/4') widthClass = 'w-full md:w-[calc(75%-1rem)]';

    const urlMatch = attrs.match(/url\(([^)]+)\)/i);
    let styleAttr = '';
    let extraClass = '';
    if (urlMatch && urlMatch[1]) {
      const bgUrl = urlMatch[1].replace(/\\/g, '').replace(/['"]/g, '').split('?')[0];
      styleAttr = `style="background-image: url('${bgUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat;"`;
      extraClass = ' p-8 rounded-2xl border border-slate-100 text-white';
    }
    return `<div class="${widthClass} flex flex-col justify-center${extraClass}" ${styleAttr}>`;
  });
  content = content.replace(/\[\/vc_column\]/gi, '</div>');

  content = content.replace(/\[vc_column_inner\s*([^\]]*)\]/gi, (match, attrs) => {
    const widthMatch = attrs.match(/width=["']([^"']+)["']/i);
    const widthVal = widthMatch ? widthMatch[1] : '1/1';
    
    let widthClass = 'w-full';
    if (widthVal === '1/2') widthClass = 'w-full md:w-[calc(50%-0.75rem)]';
    else if (widthVal === '1/3') widthClass = 'w-full md:w-[calc(33.333%-0.75rem)]';
    else if (widthVal === '2/3') widthClass = 'w-full md:w-[calc(66.666%-0.75rem)]';
    else if (widthVal === '1/4') widthClass = 'w-full md:w-[calc(25%-0.75rem)]';
    else if (widthVal === '3/4') widthClass = 'w-full md:w-[calc(75%-0.75rem)]';

    return `<div class="${widthClass} flex flex-col justify-center my-2">`;
  });
  content = content.replace(/\[\/vc_column_inner\]/gi, '</div>');

  // 4. vc_empty_space
  content = content.replace(/\[vc_empty_space\s*([^\]]*)\]/gi, (match, attrs) => {
    const heightMatch = attrs.match(/height="([^"]+)"/i) || attrs.match(/height=([^\s\]]+)/i);
    const height = heightMatch ? heightMatch[1] : '24px';
    return `<div style="height: ${height};" class="w-full"></div>`;
  });

  // Strip all other remaining vc_ shortcodes (like [vc_column_text], [/vc_column_text], etc.)
  content = content.replace(/\[\/?vc_[^\]]*\]/gi, '');

  // Strip empty paragraphs that may have been created or left over
  content = content.replace(/<p>\s*<\/p>/gi, '');

  // Convert any remaining /wp-content/uploads/ references directly to local /uploads/
  content = content
    .replace(/https?:\/\/[^\/]+\/wp-content\/uploads\//gi, '/uploads/')
    .replace(/\/wp-content\/uploads\//gi, '/uploads/');

  // 5. Force any WPBakery column wrapping mkd-testimonials to occupy 100% full width instead of 25%/33%
  if (content.includes('mkd-testimonials') || content.includes('mkd-testimonial')) {
    content = content.replace(
      /<div class="[^"]*md:w-\[calc\([^)]+\)\][^"]*">([\s\S]*?mkd-testimonials[\s\S]*?)<\/div>/gi,
      '<div class="w-full flex flex-col justify-center my-6">$1</div>'
    );
  }

  return content;
};

interface Props {
  params: Promise<{
    subdomain: string;
    slug: string[];
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subdomain, slug } = await params;
  const targetSlug = Array.isArray(slug) ? slug[slug.length - 1] : slug;
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
  const targetSlug = Array.isArray(slug) ? slug[slug.length - 1] : slug;
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
              const rawUrl = imgObj?.wpUploadPath
                ? `/uploads/${imgObj.wpUploadPath}`
                : (imgObj?.url || (imgObj?.filename ? `/media/${imgObj.filename}` : null));
              const imgUrl = resolveImageUrl(rawUrl);
              if (!imgUrl || !imgObj) return null;
              return (
                <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-100 mb-8 shadow-sm border border-slate-100">
                  <Image
                    src={imgUrl}
                    alt={imgObj.alt || payloadPage.title}
                    fill
                    priority
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
  if (['about', 'why-us', 'instructors', 'testimonials', 'faqs', 'partners', 'terms', 'tc', 'terms-and-conditions', 'privacy-policy', 'privacy'].includes(targetSlug)) {
    const titleMap: Record<string, string> = {
      about: `About Garnish ${site.city}`,
      'why-us': `Why Choose Garnish ${site.city}`,
      instructors: `Our World-Class Instructors`,
      testimonials: `Student Success Stories & Reviews`,
      faqs: `Frequently Asked Questions`,
      partners: `Industry Hardware & Software Partners`,
      terms: `Terms & Conditions (${site.name})`,
      tc: `Terms & Conditions (${site.name})`,
      'terms-and-conditions': `Terms & Conditions (${site.name})`,
      'privacy-policy': `Privacy Policy (${site.name})`,
      privacy: `Privacy Policy (${site.name})`,
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

  // 4. If neither WP page nor known navigation slug, 404
  notFound();
}

