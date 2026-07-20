import { getProductBySlug, getPageBySlug, getFeaturedImage, resolveImageUrl } from '@/lib/wordpress';
import { SITES } from '@/lib/sites';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { CourseImage } from '@/components/CourseImage';
import { parseWPBakery } from '@/lib/wpbakery';
import { buildCourseMetadata, buildCourseJsonLd, buildBreadcrumbJsonLd } from '@/lib/seo';

const LEGACY_SLUG_MAP: Record<string, string> = {
  // London-specific suffixed slugs → canonical DB slugs
  'school-summer-camp': 'summer-camp',
  'logic-pro-x-course-london': 'logic-course',
  'songwriting-course-london': 'songwriting-course',
  'mixing-and-mastering-course-london': 'mixing-mastering-course',
  // Short express course slugs from Header nav → DB slugs
  'fl-studio': 'electronic-music-dj-course',           // closest match in DB
  'mastering': 'mixing-mastering-course',               // mixing-mastering-course is in DB
  'mixing': 'mixing-mastering-course',
  'ableton-live-for-djs': 'electronic-music-dj-course',
  'sound-design': 'sounds-design-synthesis',
  'rekordbox': 'electronic-music-dj-course',
  'arturia': 'electronic-sound-art',
  'rhythm-section-programming': 'rhythm-section-pro',
  'radio-podcast': 'composition',
  'dj-course': 'electronic-music-dj-course',
  'post-production': 'electronic-music-production',
  'k-pop': 'songwriting-course',
  'bespoke-private-tuition': 'private-tuition',
  'private-lessons': 'private-tuition',
  // Academy / Program slugs
  'electronic-music-production': 'ableton-producer-program',
  'pop-producer-program': 'pop-music-production-course',
  // Alternate spellings across tenants
  'ableton-live': 'ableton-production',
  'logic-pro': 'logic-course',
  'logic-pro-x': 'logic-course',
  'mixing-mastering': 'mixing-mastering-course',
  'songwriting': 'songwriting-course',
  'vocal': 'vocal-production',
};

interface Props {
  params: Promise<{
    subdomain: string;
    slug: string;
  }>;
}

const CLOUDINARY_BASE = 'https://res.cloudinary.com/s7pus8t5/image/upload/garnish-uploads';

const getTopicFallbackImage = (slugStr: string, titleStr?: string): string => {
  const s = (slugStr + ' ' + (titleStr || '')).toLowerCase();
  // Named artist / instructor
  if (s.includes('dave') || (s.includes('garnish') && !s.includes('music'))) return `${CLOUDINARY_BASE}/sites/8/2016/09/DG-800.jpg`;
  // Songwriting
  if (s.includes('songwrit') || s.includes('k-pop') || s.includes('kpop')) return `${CLOUDINARY_BASE}/2018/05/20130809-DSC_9511.jpg`;
  // Ableton
  if (s.includes('ableton')) return `${CLOUDINARY_BASE}/sites/5/2018/02/Ableton-Live-10-Release_3_web.jpg`;
  // Logic Pro
  if (s.includes('logic')) return `${CLOUDINARY_BASE}/2018/03/LogClass-800.jpg`;
  // FL Studio
  if (s.includes('fl-studio') || s.includes('fl studio') || s.includes('fruity')) return `${CLOUDINARY_BASE}/sites/7/2020/03/Online-Music-Production-Courses.jpg`;
  // Pro Tools
  if (s.includes('pro-tools') || s.includes('pro tools')) return `${CLOUDINARY_BASE}/sites/7/2025/01/Girl-in-Headphones-Blur.png`;
  // DJ / Turntablist / Rekordbox
  if (s.includes('dj') || s.includes('turntab') || s.includes('rekordbox')) return `${CLOUDINARY_BASE}/sites/7/2025/01/PUSH-3-Blur-Dark.png`;
  // Mixing / Mastering / Post Production
  if (s.includes('mix') || s.includes('master') || s.includes('post-prod') || s.includes('post prod')) return `${CLOUDINARY_BASE}/sites/7/2025/01/Girl-in-Headphones-Blur.png`;
  // Vocal Production
  if (s.includes('vocal')) return `${CLOUDINARY_BASE}/2020/02/Garnish26-1.jpg`;
  // Composition / Rhythm / Radio / Podcast / Arturia
  if (s.includes('compos') || s.includes('rhythm') || s.includes('radio') || s.includes('podcast') || s.includes('arturia')) return `${CLOUDINARY_BASE}/2020/02/Garnish21-1.jpg`;
  // Sound Design / Synthesis
  if (s.includes('sound') && (s.includes('design') || s.includes('synth'))) return `${CLOUDINARY_BASE}/sites/7/2020/03/Online-Music-Production-Courses.jpg`;
  // Summer Camp / School Programs
  if (s.includes('camp') || s.includes('summer') || s.includes('school')) return `${CLOUDINARY_BASE}/2020/02/Garnish21.jpg`;
  // Generic production / producer
  if (s.includes('producer') || s.includes('production') || s.includes('electronic') || s.includes('program')) return `${CLOUDINARY_BASE}/sites/7/2020/03/Online-Music-Production-Courses.jpg`;
  // Default Garnish studio shot
  return `${CLOUDINARY_BASE}/sites/3/2021/09/28afbf82-4126-434a-81cc-853f0216e1f0.jpg`;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subdomain, slug } = await params;
  const cleanSlug = typeof slug === 'string' ? slug.replace(/\/$/, '') : slug;
  const targetSlug = LEGACY_SLUG_MAP[cleanSlug] || cleanSlug;
  const site = SITES[subdomain] || SITES.www;

  const overrides: { title?: string; description?: string; ogImageUrl?: string; ogImageAlt?: string; updatedTime?: string } = {};

  if (subdomain !== 'www') {
    const wpPage = await getPageBySlug(subdomain, targetSlug);
    const wpProduct = !wpPage ? await getProductBySlug(subdomain, targetSlug) : null;
    const wpItem = wpPage || wpProduct;
    if (wpItem && site) {
      const titleMatch = wpItem.content?.rendered?.match(/<h2[^>]*>(?:<strong>)?([^<]+)(?:<\/strong>)?<\/h2>/i);
      const pageTitle = titleMatch ? titleMatch[1].trim() : (wpItem.title?.rendered || 'Course');
      overrides.title = `${pageTitle} | Courses | ${site.name}`;
      overrides.description = wpItem.excerpt?.rendered?.replace(/<[^>]*>/g, '').substring(0, 160) || `${pageTitle} course at Garnish ${site.city}`;
      const featuredImage = getFeaturedImage(wpItem);
      if (featuredImage) {
        overrides.ogImageUrl = featuredImage.url;
        overrides.ogImageAlt = featuredImage.alt;
      }
      return buildCourseMetadata(targetSlug, site, `/courses/${cleanSlug}`, overrides);
    }
  }

  try {
    const payload = await getPayload({ config: configPromise });
    let result = await payload.find({
      collection: 'courses',
      where: {
        and: [
          { slug: { equals: targetSlug } },
          { tenant: { equals: subdomain } },
        ],
      },
    });
    if (result.docs.length === 0 && subdomain !== 'www') {
      result = await payload.find({
        collection: 'courses',
        where: {
          and: [
            { slug: { equals: targetSlug } },
            { tenant: { equals: 'www' } },
          ],
        },
      });
    }
    if (result.docs[0] && (!result.docs[0].description || result.docs[0].description.length < 200)) {
      const allMatches = await payload.find({
        collection: 'courses',
        where: { slug: { equals: targetSlug } },
        limit: 20,
      });
      const bestMatch = allMatches.docs.find(d => d.description && d.description.length >= 200);
      if (bestMatch && bestMatch.description) {
        result.docs[0].description = bestMatch.description;
        if (!result.docs[0].shortDescription && bestMatch.shortDescription) {
          result.docs[0].shortDescription = bestMatch.shortDescription;
        }
      }
    }
    if (result.docs[0]) {
      const c = result.docs[0];
      overrides.title = `${c.title} | Courses | ${site.name}`;
      overrides.description = c.shortDescription || `${c.title} course at Garnish ${site.city}`;
      
      const imgObj = typeof c.featuredImage === 'object' && c.featuredImage !== null ? c.featuredImage : null;
      let imgUrl = imgObj?.url?.startsWith('http') ? imgObj.url : null;
      if (!imgUrl) {
        const rawUrl = imgObj?.wpUploadPath
          ? `/uploads/${imgObj.wpUploadPath}`
          : (imgObj?.url || (imgObj?.filename ? `/media/${imgObj.filename}` : null));
        imgUrl = resolveImageUrl(rawUrl);
      }
      if (imgUrl) {
        overrides.ogImageUrl = imgUrl;
        overrides.ogImageAlt = imgObj?.alt || c.title;
      }
      
      return buildCourseMetadata(targetSlug, site, `/courses/${cleanSlug}`, overrides);
    }
  } catch (err) {
    console.error('Payload error in generateMetadata:', err);
  }

  const wpPage = await getPageBySlug(subdomain, targetSlug);
  const product = !wpPage ? await getProductBySlug(subdomain, targetSlug) : null;
  const item = wpPage || product;
  if (item && site) {
    const titleMatch = item.content?.rendered?.match(/<h2[^>]*>(?:<strong>)?([^<]+)(?:<\/strong>)?<\/h2>/i);
    const pageTitle = titleMatch ? titleMatch[1].trim() : (item.title?.rendered || 'Course');
    overrides.title = `${pageTitle} | Courses | ${site.name}`;
    overrides.description = item.excerpt?.rendered?.replace(/<[^>]*>/g, '').substring(0, 160) || 'Learn music production.';
    const featuredImage = getFeaturedImage(item);
    if (featuredImage) {
      overrides.ogImageUrl = featuredImage.url;
      overrides.ogImageAlt = featuredImage.alt;
    }
    return buildCourseMetadata(targetSlug, site, `/courses/${cleanSlug}`, overrides);
  }

  if (targetSlug === 'test-product') {
    return {
      title: `Test Product (Demo) | Courses | ${site.name}`,
    };
  }

  return buildCourseMetadata(targetSlug, site, `/courses/${cleanSlug}`);
}

export default async function ProductDetailPage({ params }: Props) {
  const { subdomain, slug } = await params;
  const cleanSlug = typeof slug === 'string' ? slug.replace(/\/$/, '') : slug;
  const targetSlug = LEGACY_SLUG_MAP[cleanSlug] || cleanSlug;
  const site = SITES[subdomain] || SITES.www;

  if (subdomain !== 'www') {
    const wpPage = await getPageBySlug(subdomain, targetSlug);
    const wpProduct = !wpPage ? await getProductBySlug(subdomain, targetSlug) : null;
    const wpItem = wpPage || wpProduct;
    if (wpItem && site) {
      const titleMatch = wpItem.content?.rendered?.match(/<h2[^>]*>(?:<strong>)?([^<]+)(?:<\/strong>)?<\/h2>/i);
      const pageTitle = titleMatch ? titleMatch[1].trim() : (wpItem.title?.rendered || 'Course');
      const featuredImage = getFeaturedImage(wpItem);
      let finalImgUrl = featuredImage?.url;
      if (!finalImgUrl || finalImgUrl.toLowerCase().includes('logo')) {
        finalImgUrl = getTopicFallbackImage(targetSlug, pageTitle);
      }
      const courseDuration = wpItem.acf?.duration || '120–360 Hours (Certificate)';
      const courseSchedule = wpItem.acf?.schedule || 'Flexible & Small Classes';
      const courseLevel = wpItem.acf?.level || 'Beginner to Intermediate';
      const startDates = ['July 20, 2026', 'August 17, 2026', 'September 14, 2026'];
      const coursePrice = wpItem.price || wpItem.acf?.price || '$1,495';

      let cleanContent = wpItem.content?.rendered || '';
      if (titleMatch && cleanContent.includes(titleMatch[0])) {
        cleanContent = cleanContent.replace(titleMatch[0], '');
      }

      return (
        <main className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <Link href="/" className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors">
                ← Back to Home
              </Link>
            </div>

            <div className="grid gap-12 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-100/80">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6" style={{ color: site.accentColor, backgroundColor: `${site.accentColor}10` }}>
                    Garnish {site.city}
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight font-display mb-6">
                    {pageTitle}
                  </h1>

                  <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-100 my-8 shadow-sm border border-slate-100">
                    <CourseImage src={finalImgUrl} alt={featuredImage?.alt || pageTitle} />
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 mb-4 font-display">Course Overview & Modules</h2>
                  <div className="wp-content prose prose-slate max-w-none text-slate-700 leading-relaxed" style={{ '--accent': site.accentColor } as React.CSSProperties} dangerouslySetInnerHTML={{ __html: parseWPBakery(cleanContent, site.accentColor) }} />
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100/80 sticky top-28">
                  <div className="mb-6">
                    <span className="text-xs text-slate-400 font-medium block">Tuition Price</span>
                    <span className="text-3xl font-black text-slate-900 tracking-tight block mt-1">{coursePrice}</span>
                  </div>

                  <Link href={`/checkout?product=${targetSlug}`} className="block w-full text-center py-4 rounded-xl text-sm font-bold text-white transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 mb-3" style={{ backgroundColor: site.accentColor }}>
                    Enroll Online & Checkout
                  </Link>
                  <Link href="/contact" className="block w-full text-center py-3.5 rounded-xl text-sm font-bold border-2 transition-all hover:bg-slate-50 text-slate-700 border-slate-200 mb-6">
                    Request Schedule & Info
                  </Link>

                  <div className="space-y-4 pt-6 border-t border-slate-100 text-xs">
                    <div className="flex justify-between py-1"><span className="text-slate-400">Duration:</span><span className="font-bold text-slate-800">{courseDuration}</span></div>
                    <div className="flex justify-between py-1"><span className="text-slate-400">Schedule:</span><span className="font-bold text-slate-800">{courseSchedule}</span></div>
                    <div className="flex justify-between py-1"><span className="text-slate-400">Level:</span><span className="font-bold text-slate-800">{courseLevel}</span></div>
                    <div className="flex justify-between py-1"><span className="text-slate-400">Tutors:</span><span className="font-bold text-slate-800">Award-winning Pros</span></div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Upcoming Intake Dates</h3>
                    <div className="space-y-2">
                      {startDates.map((date, index) => (
                        <div key={index} className="flex items-center gap-3 text-xs text-slate-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      );
    }
  }

  // 1. First: Check if this course/product exists in Payload CMS v3 ('courses' collection)
  try {
    const payload = await getPayload({ config: configPromise });
    let result = await payload.find({
      collection: 'courses',
      where: {
        and: [
          { slug: { equals: targetSlug } },
          { tenant: { equals: subdomain } },
        ],
      },
    });

    if (result.docs.length === 0 && subdomain !== 'www') {
      const wpPage = await getPageBySlug(subdomain, targetSlug);
      const wpProduct = !wpPage ? await getProductBySlug(subdomain, targetSlug) : null;
      const wpItem = wpPage || wpProduct;
      if (wpItem && site) {
        const titleMatch = wpItem.content?.rendered?.match(/<h2[^>]*>(?:<strong>)?([^<]+)(?:<\/strong>)?<\/h2>/i);
        const pageTitle = titleMatch ? titleMatch[1].trim() : (wpItem.title?.rendered || 'Course');
        const featuredImage = getFeaturedImage(wpItem);
        let finalImgUrl = featuredImage?.url;
        if (!finalImgUrl || finalImgUrl.toLowerCase().includes('logo')) {
          finalImgUrl = getTopicFallbackImage(targetSlug, pageTitle);
        }
        const courseDuration = wpItem.acf?.duration || '120–360 Hours (Certificate)';
        const courseSchedule = wpItem.acf?.schedule || 'Flexible & Small Classes';
        const courseLevel = wpItem.acf?.level || 'Beginner to Intermediate';
        const startDates = ['July 20, 2026', 'August 17, 2026', 'September 14, 2026'];
        const coursePrice = wpItem.price || wpItem.acf?.price || '$1,495';

        let cleanContent = wpItem.content?.rendered || '';
        if (titleMatch && cleanContent.includes(titleMatch[0])) {
          cleanContent = cleanContent.replace(titleMatch[0], '');
        }

        return (
          <main className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <Link href="/" className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors">
                  ← Back to Home
                </Link>
              </div>

              <div className="grid gap-12 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-100/80">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6" style={{ color: site.accentColor, backgroundColor: `${site.accentColor}10` }}>
                      Garnish {site.city}
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight font-display mb-6">
                      {pageTitle}
                    </h1>

                    <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-100 my-8 shadow-sm border border-slate-100">
                      <CourseImage src={finalImgUrl} alt={featuredImage?.alt || pageTitle} />
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 mb-4 font-display">Course Overview & Modules</h2>
                    <div className="wp-content prose prose-slate max-w-none text-slate-700 leading-relaxed" style={{ '--accent': site.accentColor } as React.CSSProperties} dangerouslySetInnerHTML={{ __html: parseWPBakery(cleanContent, site.accentColor) }} />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100/80 sticky top-28">
                    <div className="mb-6">
                      <span className="text-xs text-slate-400 font-medium block">Tuition Price</span>
                      <span className="text-3xl font-black text-slate-900 tracking-tight block mt-1">{coursePrice}</span>
                    </div>

                    <Link href={`/checkout?product=${targetSlug}`} className="block w-full text-center py-4 rounded-xl text-sm font-bold text-white transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 mb-3" style={{ backgroundColor: site.accentColor }}>
                      Enroll Online & Checkout
                    </Link>
                    <Link href="/contact" className="block w-full text-center py-3.5 rounded-xl text-sm font-bold border-2 transition-all hover:bg-slate-50 text-slate-700 border-slate-200 mb-6">
                      Request Schedule & Info
                    </Link>

                    <div className="space-y-4 pt-6 border-t border-slate-100 text-xs">
                      <div className="flex justify-between py-1"><span className="text-slate-400">Duration:</span><span className="font-bold text-slate-800">{courseDuration}</span></div>
                      <div className="flex justify-between py-1"><span className="text-slate-400">Schedule:</span><span className="font-bold text-slate-800">{courseSchedule}</span></div>
                      <div className="flex justify-between py-1"><span className="text-slate-400">Level:</span><span className="font-bold text-slate-800">{courseLevel}</span></div>
                      <div className="flex justify-between py-1"><span className="text-slate-400">Tutors:</span><span className="font-bold text-slate-800">Award-winning Pros</span></div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Upcoming Intake Dates</h3>
                      <div className="space-y-2">
                        {startDates.map((date, index) => (
                          <div key={index} className="flex items-center gap-3 text-xs text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        );
      }

      result = await payload.find({
        collection: 'courses',
        where: {
          and: [
            { slug: { equals: targetSlug } },
            { tenant: { equals: 'www' } },
          ],
        },
      });
    }

    if (result.docs.length === 0) {
      result = await payload.find({
        collection: 'courses',
        where: { slug: { equals: targetSlug } },
        limit: 1,
      });
    }

    if (result.docs[0] && (!result.docs[0].description || result.docs[0].description.length < 200)) {
      const allMatches = await payload.find({
        collection: 'courses',
        where: { slug: { equals: targetSlug } },
        limit: 20,
      });
      const bestMatch = allMatches.docs.find(d => d.description && d.description.length >= 200);
      if (bestMatch && bestMatch.description) {
        result.docs[0].description = bestMatch.description;
        if (!result.docs[0].shortDescription && bestMatch.shortDescription) {
          result.docs[0].shortDescription = bestMatch.shortDescription;
        }
      }
    }

    if (result.docs[0]) {
      const course = result.docs[0];
      const courseDuration = course.duration || '360 Hours (Certificate)';
      const coursePrice = course.price || '$1,495';
      // On the live garnishmusicproduction.com (www/London), ALL short express
      // courses are currently offered via private tuition only — no pricing sidebar.
      // Any course that previously ended in '-london' or is a short express course
      // for the www tenant should use the single-column private tuition layout.
      const SHORT_COURSE_SLUGS_NO_SIDEBAR = new Set([
        'ableton-live-course-london', 'logic-pro-x-course-london', 'logic-course',
        'songwriting-course-london', 'songwriting-course',
        'mixing-and-mastering-course-london', 'mixing-mastering-course',
        'ableton-live-for-djs', 'sound-design', 'sounds-design-synthesis',
        'rekordbox', 'arturia', 'electronic-sound-art',
        'rhythm-section-programming', 'rhythm-section-pro',
        'radio-podcast', 'composition', 'vocal-production',
        'fl-studio', 'mastering', 'mixing', 'dj-course', 'electronic-music-dj-course',
        'post-production', 'k-pop', 'private-tuition',
        'school-summer-camp', 'summer-camp',
      ]);
      const isPrivateTuitionCourse =
        subdomain === 'www' ||
        SHORT_COURSE_SLUGS_NO_SIDEBAR.has(course.slug || '') ||
        SHORT_COURSE_SLUGS_NO_SIDEBAR.has(targetSlug) ||
        course.slug?.endsWith('-london') ||
        targetSlug.endsWith('-london');

      return (
        <main className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <Link href="/" className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors">
                ← Back to Home
              </Link>
            </div>

            {isPrivateTuitionCourse ? (
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-100/80">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6" style={{ color: site.accentColor, backgroundColor: `${site.accentColor}10` }}>
                    Garnish {site.city}
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight font-display mb-6">
                    {course.title}
                  </h1>

                  {(() => {
                    const imgObj = typeof course.featuredImage === 'object' && course.featuredImage !== null ? course.featuredImage : null;
                    let imgUrl = imgObj?.url?.startsWith('http') ? imgObj.url : null;
                    if (!imgUrl) {
                      const rawUrl = imgObj?.wpUploadPath
                        ? `/uploads/${imgObj.wpUploadPath}`
                        : (imgObj?.url || (imgObj?.filename ? `/media/${imgObj.filename}` : null));
                      imgUrl = resolveImageUrl(rawUrl);
                    }
                    if (!imgUrl || imgUrl.toLowerCase().includes('logo') || (imgObj?.filename && imgObj.filename.toLowerCase().includes('logo'))) {
                      imgUrl = getTopicFallbackImage(course.slug || targetSlug, course.title);
                    }
                    return (
                      <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-100 mb-8 shadow-sm border border-slate-100">
                        <CourseImage
                          src={imgUrl}
                          alt={imgObj?.alt || course.title}
                        />
                      </div>
                    );
                  })()}

                  {course.shortDescription && (
                    <div 
                      className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6 wp-short-description"
                      dangerouslySetInnerHTML={{ __html: parseWPBakery(course.shortDescription, site.accentColor) }}
                    />
                  )}

                  <h2 className="text-xl font-bold text-slate-900 mb-4 font-display">Course Overview</h2>
                  <div 
                    className="wp-content prose prose-slate max-w-none text-slate-700 leading-relaxed"
                    style={{ '--accent': site.accentColor } as React.CSSProperties}
                    dangerouslySetInnerHTML={{ __html: parseWPBakery(course.description || 'Full academy syllabus, mixing assignments, hands-on workstation setup, and 1-on-1 mentorship.', site.accentColor) }}
                  />

                  <div className="mt-12 bg-slate-50 rounded-2xl p-8 border border-slate-200/80">
                    <h3 className="text-xl font-bold text-slate-900 font-display mb-3">
                      Private Tuition &amp; Booking Inquiries
                    </h3>
                    <p className="text-slate-600 leading-relaxed mb-6">
                      We’re currently offering our short courses via 1-on-1 private tuition — available in London, Cardiff, Manchester, Margate, Brighton, other select locations, and online. Study at your own pace with our award-winning industry instructors.
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                      <Link
                        href="/bespoke-private-tuition"
                        className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-sm font-bold text-white transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        style={{ backgroundColor: site.accentColor }}
                      >
                        Inquire About Private Tuition →
                      </Link>
                      <Link
                        href="/contact-map"
                        className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-sm font-bold text-slate-700 bg-slate-200/60 hover:bg-slate-200 transition-colors"
                      >
                        Contact Our Admissions Team
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-12 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-100/80">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6" style={{ color: site.accentColor, backgroundColor: `${site.accentColor}10` }}>
                      Garnish {site.city}
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight font-display mb-6">
                      {course.title}
                    </h1>

                    {(() => {
                      const imgObj = typeof course.featuredImage === 'object' && course.featuredImage !== null ? course.featuredImage : null;
                      let imgUrl = imgObj?.url?.startsWith('http') ? imgObj.url : null;
                      if (!imgUrl) {
                        const rawUrl = imgObj?.wpUploadPath
                          ? `/uploads/${imgObj.wpUploadPath}`
                          : (imgObj?.url || (imgObj?.filename ? `/media/${imgObj.filename}` : null));
                        imgUrl = resolveImageUrl(rawUrl);
                      }
                      if (!imgUrl || imgUrl.toLowerCase().includes('logo') || (imgObj?.filename && imgObj.filename.toLowerCase().includes('logo'))) {
                        imgUrl = getTopicFallbackImage(course.slug || targetSlug, course.title);
                      }
                      return (
                        <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-100 mb-8 shadow-sm border border-slate-100">
                          <CourseImage
                            src={imgUrl}
                            alt={imgObj?.alt || course.title}
                          />
                        </div>
                      );
                    })()}

                    {course.shortDescription && (
                      <div 
                        className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6 wp-short-description"
                        dangerouslySetInnerHTML={{ __html: parseWPBakery(course.shortDescription, site.accentColor) }}
                      />
                    )}

                    <h2 className="text-xl font-bold text-slate-900 mb-4 font-display">Course Overview</h2>
                    <div 
                      className="wp-content prose prose-slate max-w-none text-slate-700 leading-relaxed"
                      style={{ '--accent': site.accentColor } as React.CSSProperties}
                      dangerouslySetInnerHTML={{ __html: parseWPBakery(course.description || 'Full academy syllabus, mixing assignments, hands-on workstation setup, and 1-on-1 mentorship.', site.accentColor) }}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100/80 sticky top-28">
                    <div className="mb-6">
                      <span className="text-xs text-slate-400 font-medium block">Tuition Price</span>
                      <span className="text-3xl font-black text-slate-900 tracking-tight block mt-1">
                        {coursePrice}
                      </span>
                    </div>

                    <Link
                      href={`/checkout?product=${course.slug}`}
                      className="block w-full text-center py-4 rounded-xl text-sm font-bold text-white transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 mb-6"
                      style={{ backgroundColor: site.accentColor }}
                    >
                      Enroll Now &amp; Checkout
                    </Link>

                    <div className="space-y-4 pt-6 border-t border-slate-100 text-xs">
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400">Duration:</span>
                        <span className="font-bold text-slate-800">{courseDuration}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400">Class Size:</span>
                        <span className="font-bold text-slate-800">Max 6-8 Students</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      );
    }
  } catch (err) {
    console.error('Payload error in ProductDetailPage:', err);
  }

  // 2. Second: Check legacy WordPress Page / Product API
  const wpPage = await getPageBySlug(subdomain, targetSlug);
  const product = !wpPage ? await getProductBySlug(subdomain, targetSlug) : null;
  const item = wpPage || product;

  if (item) {
    const featuredImage = getFeaturedImage(item);
    const titleMatch = item.content?.rendered?.match(/<h2[^>]*>(?:<strong>)?([^<]+)(?:<\/strong>)?<\/h2>/i);
    const pageTitle = titleMatch ? titleMatch[1].trim() : (item.title?.rendered || 'Course');
    const courseDuration = item.acf?.duration || '120–360 Hours (Certificate)';
    const courseSchedule = item.acf?.schedule || 'Flexible & Small Classes';
    const courseLevel = item.acf?.level || 'Beginner to Intermediate';
    const startDates = ['July 20, 2026', 'August 17, 2026', 'September 14, 2026'];
    const coursePrice = item.price || item.acf?.price || '$1,495';

    let cleanContent = item.content?.rendered || '';
    if (titleMatch && cleanContent.includes(titleMatch[0])) {
      cleanContent = cleanContent.replace(titleMatch[0], '');
    }

    return (
      <main className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Link href="/" className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors">
              ← Back to Home
            </Link>
          </div>

          <div className="grid gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-100/80">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6" style={{ color: site.accentColor, backgroundColor: `${site.accentColor}10` }}>
                  Garnish {site.city}
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight font-display mb-6">
                  {pageTitle}
                </h1>

                {(() => {
                  const featuredImage = getFeaturedImage(item);
                  let finalImgUrl = featuredImage?.url;
                  if (!finalImgUrl || finalImgUrl.toLowerCase().includes('logo')) {
                    finalImgUrl = getTopicFallbackImage(targetSlug, pageTitle);
                  }
                  return (
                    <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-100 my-8 shadow-sm border border-slate-100">
                      <CourseImage src={finalImgUrl} alt={featuredImage?.alt || pageTitle} />
                    </div>
                  );
                })()}

                <h2 className="text-xl font-bold text-slate-900 mb-4 font-display">Course Overview & Modules</h2>
                <div className="wp-content prose prose-slate max-w-none text-slate-700 leading-relaxed" style={{ '--accent': site.accentColor } as React.CSSProperties} dangerouslySetInnerHTML={{ __html: parseWPBakery(cleanContent, site.accentColor) }} />
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100/80 sticky top-28">
                <div className="mb-6">
                  <span className="text-xs text-slate-400 font-medium block">Total Price</span>
                  <span className="text-3xl font-black text-slate-900 tracking-tight block mt-1">{item.price || item.acf?.price || '$995'}</span>
                </div>

                <Link href={`/checkout?product=${item.slug || targetSlug}`} className="block w-full text-center py-4 rounded-xl text-sm font-bold text-white transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 mb-6" style={{ backgroundColor: site.accentColor }}>
                  Book Now &amp; Checkout
                </Link>

                <div className="space-y-4 pt-6 border-t border-slate-100 text-xs">
                  <div className="flex justify-between py-1"><span className="text-slate-400">Duration:</span><span className="font-bold text-slate-800">{courseDuration}</span></div>
                  <div className="flex justify-between py-1"><span className="text-slate-400">Schedule:</span><span className="font-bold text-slate-800">{courseSchedule}</span></div>
                  <div className="flex justify-between py-1"><span className="text-slate-400">Level:</span><span className="font-bold text-slate-800">{courseLevel}</span></div>
                  <div className="flex justify-between py-1"><span className="text-slate-400">Tutors:</span><span className="font-bold text-slate-800">Award-winning Pros</span></div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Upcoming Intake Dates</h3>
                  <div className="space-y-2">
                    {startDates.map((date, index) => (
                      <div key={index} className="flex items-center gap-3 text-xs text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>{date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 3. Universal preview fallback — renders for ANY slug not yet in Payload or WordPress.
  //    This prevents 404s during the pre-migration period. Once npm run migrate:wp
  //    completes, Payload CMS will serve real data instead of this preview.
  const courseTitle = targetSlug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const courseDescriptions: Record<string, string> = {
    'ableton-production': 'Master Ableton Live from the ground up — session view, clip launching, Rack design, Max for Live, and professional export workflows. Delivered by chart-topping producers in boutique class sizes of 6-8 students.',
    'logic-pro-x': 'Comprehensive Logic Pro X program covering MIDI production, Flex Time, Drummer tracks, Dolby Atmos spatial audio mixing, and professional mastering chains.',
    'dj-performance': 'From basic beatmatching to advanced harmonic mixing and club sound system operation. Includes CDJ-3000, DJM-900NXS2, and Serato/Traktor integration.',
    'mixing-mastering': 'Advanced stereo and stem mixing, parallel processing, master bus compression, loudness metering (LUFS), and digital-to-analogue mastering for commercial release.',
    'music-production': 'Our flagship 360-hour diploma covering all major DAWs, synthesis, arrangement, sound design, mixing, mastering, and music business fundamentals.',
  };

  const courseDesc = courseDescriptions[targetSlug] ||
    `An intensive hands-on ${courseTitle} program at Garnish ${site.city}. Led by award-winning music producers and engineers in a boutique studio environment.`;

  return (
    <main className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors">
            ← Back to Home
          </Link>
        </div>

        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-100/80">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6" style={{ color: site.accentColor, backgroundColor: `${site.accentColor}10` }}>
                Garnish {site.city}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight font-display mb-6">
                {courseTitle}
              </h1>
              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-100 mb-8 shadow-sm border border-slate-100">
                <CourseImage
                  src={getTopicFallbackImage(targetSlug, courseTitle)}
                  alt={courseTitle}
                />
              </div>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8">
                {courseDesc}
              </p>

              <h2 className="text-xl font-bold text-slate-900 mb-4 font-display">What You Will Learn</h2>
              <div className="space-y-4 mb-8">
                {[
                  { title: 'Module 1: DAW Setup & Workflow', desc: 'Understanding your audio interface, MIDI, signal flow, and custom templates.' },
                  { title: 'Module 2: Synthesis & Sound Design', desc: 'Working with Subtractive, FM, and Wavetable synthesis to design your own sounds.' },
                  { title: 'Module 3: Arrangement & Structure', desc: 'Creating musical tension, drops, and build-ups using professional arrangement templates.' },
                  { title: 'Module 4: Mix Engineering & Mastering', desc: 'EQ, compression, spatial effects, loudness metering, and final mastering for streaming.' },
                ].map((mod, i) => (
                  <div key={i} className="border-b border-slate-100 pb-4">
                    <h3 className="font-bold text-slate-800 text-sm mb-1">{mod.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{mod.desc}</p>
                  </div>
                ))}
              </div>

              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-100 text-sm text-amber-900">
                <strong>⚡ Pending CMS Import:</strong> This course exists in your WordPress database and will display full content once you run <code className="bg-amber-100 px-1 rounded">npm run migrate:wp</code>. Or add it manually via{' '}
                <Link href="/admin" className="underline font-bold">Payload Admin → Courses</Link>{' '}with slug <code className="bg-amber-100 px-1 rounded">{targetSlug}</code>.
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100/80 sticky top-28">
              <div className="mb-6">
                <span className="text-xs text-slate-400 font-medium block">Tuition Price</span>
                <span className="text-3xl font-black text-slate-900 tracking-tight block mt-1">From $1,295</span>
              </div>
              <Link
                href={`/checkout?product=${targetSlug}`}
                className="block w-full text-center py-4 rounded-xl text-sm font-bold text-white transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 mb-6"
                style={{ backgroundColor: site.accentColor }}
              >
                Book Now &amp; Checkout
              </Link>
              <div className="space-y-4 pt-6 border-t border-slate-100 text-xs">
                <div className="flex justify-between py-1"><span className="text-slate-400">Duration:</span><span className="font-bold text-slate-800">120–360 Hours</span></div>
                <div className="flex justify-between py-1"><span className="text-slate-400">Class Size:</span><span className="font-bold text-slate-800">Max 6-8 Students</span></div>
                <div className="flex justify-between py-1"><span className="text-slate-400">Level:</span><span className="font-bold text-slate-800">Beginner to Pro</span></div>
                <div className="flex justify-between py-1"><span className="text-slate-400">Tutors:</span><span className="font-bold text-slate-800">Award-winning Pros</span></div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Upcoming Intake Dates</h3>
                <div className="space-y-2">
                  {['August 4, 2026', 'September 1, 2026', 'October 6, 2026'].map((date, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

