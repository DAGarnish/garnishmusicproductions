import { getProductBySlug, getFeaturedImage, resolveImageUrl } from '@/lib/wordpress';
import { SITES } from '@/lib/sites';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { CourseImage } from '@/components/CourseImage';

const LEGACY_SLUG_MAP: Record<string, string> = {
  'school-summer-camp': 'summer-camp',
  'ableton-live-course-london': 'ableton-production',
  'logic-pro-x-course-london': 'logic-course',
  'songwriting-course-london': 'songwriting-course',
  'mixing-and-mastering-course-london': 'mixing-mastering',
};

interface Props {
  params: Promise<{
    subdomain: string;
    slug: string;
  }>;
}

const getTopicFallbackImage = (slugStr: string, titleStr?: string): string => {
  const s = (slugStr + ' ' + (titleStr || '')).toLowerCase();
  if (s.includes('songwrit')) return '/uploads/2018/05/20130809-DSC_9511.jpg';
  if (s.includes('ableton')) return '/uploads/sites/5/2018/02/Ableton-Live-10-Release_3_web.jpg';
  if (s.includes('logic')) return '/uploads/2018/03/LogClass-800.jpg';
  if (s.includes('dj') || s.includes('turntab')) return '/uploads/sites/7/2025/01/PUSH-3-Blur-Dark.png';
  if (s.includes('mix') || s.includes('master')) return '/uploads/sites/7/2025/01/Girl-in-Headphones-Blur.png';
  if (s.includes('camp') || s.includes('summer')) return '/uploads/2020/02/Garnish21.jpg';
  if (s.includes('producer') || s.includes('production')) return '/uploads/sites/7/2020/03/Online-Music-Production-Courses.jpg';
  return '/uploads/sites/3/2021/09/28afbf82-4126-434a-81cc-853f0216e1f0.jpg';
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subdomain, slug } = await params;
  const targetSlug = LEGACY_SLUG_MAP[slug] || slug;
  const site = SITES[subdomain] || SITES.www;

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
    if (result.docs[0]) {
      const c = result.docs[0];
      return {
        title: `${c.title} | Courses | ${site.name}`,
        description: c.shortDescription || `${c.title} course at Garnish ${site.city}`,
      };
    }
  } catch {
    // Fallback if Payload DB not ready
  }

  const product = await getProductBySlug(subdomain, targetSlug);
  if (product && site) {
    return {
      title: `${product.title.rendered} | Courses | ${site.name}`,
      description: product.excerpt?.rendered.replace(/<[^>]*>/g, '').substring(0, 160) || 'Learn music production.',
    };
  }

  if (targetSlug === 'test-product') {
    return {
      title: `Test Product (Demo) | Courses | ${site.name}`,
    };
  }

  return {
    title: 'Course Not Found',
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { subdomain, slug } = await params;
  const targetSlug = LEGACY_SLUG_MAP[slug] || slug;
  const site = SITES[subdomain] || SITES.www;

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

    if (result.docs[0]) {
      const course = result.docs[0];
      const courseDuration = course.duration || '360 Hours (Certificate)';
      const coursePrice = course.price || '$1,495';

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
                    {course.title}
                  </h1>

                  {(() => {
                    const imgObj = typeof course.featuredImage === 'object' && course.featuredImage !== null ? course.featuredImage : null;
                    const rawUrl = imgObj?.wpUploadPath
                      ? `/uploads/${imgObj.wpUploadPath}`
                      : (imgObj?.url || (imgObj?.filename ? `/media/${imgObj.filename}` : null));
                    let imgUrl = resolveImageUrl(rawUrl);
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
                      dangerouslySetInnerHTML={{ __html: course.shortDescription }}
                    />
                  )}

                  <h2 className="text-xl font-bold text-slate-900 mb-4 font-display">Course Overview</h2>
                  <div 
                    className="wp-content prose prose-slate max-w-none text-slate-700 leading-relaxed"
                    style={{ '--accent': site.accentColor } as React.CSSProperties}
                    dangerouslySetInnerHTML={{ __html: (course.description || 'Full academy syllabus, mixing assignments, hands-on workstation setup, and 1-on-1 mentorship.').replace(/https?:\/\/[^\/]+\/wp-content\/uploads\//gi, '/uploads/').replace(/\/wp-content\/uploads\//gi, '/uploads/') }}
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
          </div>
        </main>
      );
    }
  } catch {
    // Payload DB offline or not yet migrated, fallback below
  }

  // 2. Second: Check legacy WordPress product API
  const product = await getProductBySlug(subdomain, targetSlug);

  if (product) {
    const featuredImage = getFeaturedImage(product);
    const courseDuration = product.acf?.duration || '120 Hours (Intensive)';
    const courseSchedule = product.acf?.schedule || 'Mon - Fri (10 AM - 5 PM)';
    const courseLevel = product.acf?.level || 'Beginner to Intermediate';
    const startDates = ['July 20, 2026', 'August 17, 2026', 'September 14, 2026'];

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
                  Music Course
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight font-display mb-6" dangerouslySetInnerHTML={{ __html: product.title.rendered }} />

                {(() => {
                  const featuredImage = getFeaturedImage(product);
                  let finalImgUrl = featuredImage?.url;
                  if (!finalImgUrl || finalImgUrl.toLowerCase().includes('logo')) {
                    finalImgUrl = getTopicFallbackImage(targetSlug, product.title.rendered);
                  }
                  return (
                    <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-100 my-8 shadow-sm border border-slate-100">
                      <CourseImage src={finalImgUrl} alt={featuredImage?.alt || product.title.rendered} />
                    </div>
                  );
                })()}

                <h2 className="text-xl font-bold text-slate-900 mb-4 font-display">Course Overview</h2>
                <div className="wp-content prose prose-slate max-w-none" style={{ '--accent': site.accentColor } as React.CSSProperties} dangerouslySetInnerHTML={{ __html: product.content.rendered.replace(/https?:\/\/[^\/]+\/wp-content\/uploads\//gi, '/uploads/').replace(/\/wp-content\/uploads\//gi, '/uploads/') }} />
              </div>

              <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-100/80">
                <h2 className="text-xl font-bold text-slate-900 mb-6 font-display">What You Will Learn</h2>
                <div className="space-y-4">
                  {[
                    { title: 'Module 1: DAW Setup & Workflow', desc: 'Understanding your audio interface, MIDI, signal flow, and custom templates.' },
                    { title: 'Module 2: Synthesis & Sound Design', desc: 'Working with Subtractive, FM, and Wavetable synthesis to design your own sounds.' },
                    { title: 'Module 3: Arrangement & Structure', desc: 'Creating musical tension, drops, and build-ups using arrangement templates.' },
                    { title: 'Module 4: Audio Engineering & Mixing', desc: 'EQ, compression, spatial effects, and final mastering.' }
                  ].map((mod, i) => (
                    <div key={i} className="border-b border-slate-100 pb-4">
                      <h3 className="font-bold text-slate-800 text-sm mb-1">{mod.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">{mod.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100/80 sticky top-28">
                <div className="mb-6">
                  <span className="text-xs text-slate-400 font-medium block">Total Price</span>
                  <span className="text-3xl font-black text-slate-900 tracking-tight block mt-1">{product.price || '$995'}</span>
                </div>

                <Link href={`/checkout?product=${product.slug}`} className="block w-full text-center py-4 rounded-xl text-sm font-bold text-white transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 mb-6" style={{ backgroundColor: site.accentColor }}>
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

