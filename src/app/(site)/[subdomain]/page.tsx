import { getPosts, getProducts, getFeaturedImage, resolveImageUrl } from '@/lib/wordpress';
import { SITES } from '@/lib/sites';
import { RANK_MATH_SUBDOMAIN_SETTINGS } from '@/lib/redirects';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface SubdomainPageProps {
  params: Promise<{ subdomain: string }>;
}

export async function generateMetadata({ params }: SubdomainPageProps): Promise<Metadata> {
  const { subdomain } = await params;
  const site = SITES[subdomain];
  const rmSettings = RANK_MATH_SUBDOMAIN_SETTINGS[subdomain];

  const title = rmSettings?.websiteName || site?.name || 'Garnish Music Production School';
  const description = 'World-class Music Production Courses — Approved by 3 DAWs. Many locations from LA to Hong Kong, and LIVE online.';

  return {
    title: `${title} | World-class Music Production Courses`,
    description,
    openGraph: {
      title,
      description,
      url: `https://${subdomain === 'www' ? 'www' : subdomain}.garnishmusicproduction.com`,
      siteName: 'Garnish Music Production School',
    },
  };
}

// Testimonials from the live site
const TESTIMONIALS = [
  {
    quote: "I learned a lot thanks to a very qualified and professional instructor, who enriched the theory with useful practical tips and tricks that really helped improve my work",
    author: "Dafni Piffer",
  },
  {
    quote: "My time at Garnish London's year long Electronic Music Production course has been invaluable. Being able to learn from industry professionals who are at the top of their game just goes to show what is possible.",
    author: "Lorin Pearce",
  },
  {
    quote: "Songwriting and performing has always been my thing but I've always been interested in the more technical side. A friend told me about Garnish School and their instructors so I booked their course. It was just brilliant.",
    author: "Robert Owens",
  },
  {
    quote: "I love learning in an intimate focused environment from dedicated teachers and Garnish had everything I needed to take me to the next phase.",
    author: "Aluna Francis (AlunaGeorge)",
  },
  {
    quote: "Fantastic facilities and expert tuition from world-class songwriters, engineers, and producers!",
    author: "Mark Tomlinson",
  },
  {
    quote: "Being a professional self-taught producer, it was valuable to revise some things I already knew, but most importantly, I learnt so many things I did not know about before.",
    author: "Rui Da Silva",
  },
];

// Partner brand logos — served from Cloudinary garnish-uploads
const _CLOUDINARY = 'https://res.cloudinary.com/s7pus8t5/image/upload/garnish-uploads';
const PARTNERS = [
  { name: 'Ableton', src: `${_CLOUDINARY}/2025/02/1.png` },
  { name: 'iZotope', src: `${_CLOUDINARY}/2025/02/2-copy-1.png` },
  { name: 'Beatport', src: `${_CLOUDINARY}/2025/02/3.png` },
  { name: 'Arturia', src: `${_CLOUDINARY}/2025/02/4-1.png` },
  { name: 'Pioneer DJ', src: `${_CLOUDINARY}/2025/02/svgexport-1-1.png` },
  { name: 'AlphaTheta', src: `${_CLOUDINARY}/2025/02/AlphaTheta-1.png` },
  { name: 'Soundtoys', src: `${_CLOUDINARY}/2025/02/logo-1.png` },
  { name: 'Auto-Tune', src: `${_CLOUDINARY}/2025/02/Auto-Tune_white_logo_with_green_A_wave-1.png` },
  { name: 'FL Studio', src: `${_CLOUDINARY}/2025/02/Image-Line.png` },
  { name: 'Pitch Innovations', src: `${_CLOUDINARY}/2025/02/logo-2.png` },
  { name: 'Native Instruments', src: `${_CLOUDINARY}/2025/02/Native_Instruments_logo_2023.svg_-1.png` },
  { name: 'Apple', src: `${_CLOUDINARY}/2025/02/apple.png` },
];

// Topic-based fallback images for products missing featured images — all served from Cloudinary
const CLOUDINARY_BASE = 'https://res.cloudinary.com/s7pus8t5/image/upload/garnish-uploads';

const getTopicFallbackImage = (slugStr: string, titleStr?: string): string => {
  const s = (slugStr + ' ' + (titleStr || '')).toLowerCase();
  // Named artist / instructor
  if (s.includes('dave') || (s.includes('garnish') && !s.includes('music'))) return `${CLOUDINARY_BASE}/sites/8/2016/09/DG-800.jpg`;
  // Songwriting / K-pop
  if (s.includes('songwrit') || s.includes('k-pop') || s.includes('kpop')) return `${CLOUDINARY_BASE}/2018/05/20130809-DSC_9511.jpg`;
  // Ableton Live
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
  // Composition / Rhythm Section / Radio / Podcast / Arturia
  if (s.includes('compos') || s.includes('rhythm') || s.includes('radio') || s.includes('podcast') || s.includes('arturia')) return `${CLOUDINARY_BASE}/2020/02/Garnish21-1.jpg`;
  // Sound Design / Synthesis
  if (s.includes('sound') && (s.includes('design') || s.includes('synth'))) return `${CLOUDINARY_BASE}/sites/7/2020/03/Online-Music-Production-Courses.jpg`;
  // Summer Camp / School
  if (s.includes('camp') || s.includes('summer') || s.includes('school')) return `${CLOUDINARY_BASE}/2020/02/Garnish21.jpg`;
  // Generic production / electronic / program
  if (s.includes('producer') || s.includes('production') || s.includes('electronic') || s.includes('program')) return `${CLOUDINARY_BASE}/sites/7/2020/03/Online-Music-Production-Courses.jpg`;
  // Default Garnish studio
  return `${CLOUDINARY_BASE}/sites/3/2021/09/28afbf82-4126-434a-81cc-853f0216e1f0.jpg`;
};

// Shorter courses matching live site
const SHORTER_COURSES = [
  {
    title: 'Ableton Live Music Production & Performance',
    href: '/courses/ableton-live-course-london/',
    category: 'Production Courses',
  },
  {
    title: 'Logic Pro',
    href: '/courses/logic-pro-x-course-london/',
    category: 'Production Courses',
  },
  {
    title: 'Mixing & Mastering',
    href: '/courses/mixing-and-mastering-course-london/',
    category: 'Production Courses',
  },
  {
    title: 'Hit Songwriting | London, Online, Blended',
    href: '/courses/songwriting-course-london/',
    category: 'Production Courses',
  },
];

export default async function SubdomainPage({ params }: SubdomainPageProps) {
  const { subdomain } = await params;
  const site = SITES[subdomain];

  if (!site) {
    notFound();
  }

  // Fetch data concurrently for fast page loads
  const [, products] = await Promise.all([
    getPosts(subdomain, 3),
    getProducts(subdomain, 6)
  ]);

  const hasProducts = products && products.length > 0;
  // heroImage is already a full Cloudinary URL from sites.ts — use it directly
  const resolvedHeroImage = site.heroImage?.startsWith('http')
    ? site.heroImage
    : (resolveImageUrl(site.heroImage || '') || 'https://res.cloudinary.com/s7pus8t5/image/upload/v1783689930/garnish-media/studio-hero-www.webp');

  return (
    <div className="font-sans bg-white">
      {/* ===== HERO SLIDER SECTION ===== */}
      <section className="relative bg-slate-950 text-white overflow-hidden">
        {/* Hero background */}
        <div className="relative min-h-[500px] lg:min-h-[600px] flex items-center justify-center">
          <Image
            src={resolvedHeroImage}
            alt={`${site.name} - ${site.city}`}
            fill
            priority
            unoptimized={resolvedHeroImage.startsWith('http')}
            sizes="100vw"
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-transparent to-slate-950/80" />

          {/* Hero Content — Red banner overlay (matching live site) */}
          <div className="relative z-10 w-full max-w-4xl mx-auto px-6 text-center">
            <div className="bg-[#c0392b] inline-block px-10 py-8 sm:px-16 sm:py-12">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-wide leading-tight">
                {site.tagline}
              </h1>
            </div>
            <p className="mt-4 text-sm text-slate-400 tracking-wide uppercase">
              Certified &amp; Critically Acclaimed Music Production Courses Since 2009
            </p>
          </div>
        </div>
      </section>

      {/* ===== BA PATHWAYS SECTION ===== */}
      <section className="py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">
            BA (Hons) Pathways | Music Production
          </h2>
          <p className="text-base text-slate-600 leading-relaxed max-w-3xl mx-auto mb-8">
            Launch your music journey with us — with our Level 4 and Level 5 BA (Hons) pathway courses.
            Choose from Music Production &amp; Sound Engineering, Songwriting &amp; Production, or
            Electronic Music Production — all awarded in London, one of the world&apos;s most iconic music
            and cultural hubs. You&apos;ll dive deep into recording, songwriting, vocal production, mixing,
            mastering, sound design, and advanced DAW workflows, while sharpening your branding and
            career strategies. Through real-world projects and peer collaboration, you&apos;ll graduate
            with a professional portfolio — and the skills to back it up.
          </p>
          <a
            href="https://bcn.garnishmusicproduction.com/ba-pathway-courses/"
            className="inline-block px-8 py-3.5 bg-[#c0392b] text-white text-sm font-bold uppercase tracking-wider hover:bg-[#a93226] transition-colors"
          >
            See More
          </a>
        </div>
      </section>

      {/* ===== SHORTER COURSES SECTION ===== */}
      <section className="py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-12">
            Shorter Music Production Courses
          </h2>

          {/* If WP products available, show them; otherwise show static course list */}
          {hasProducts ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.slice(0, 4).map((product) => {
                const featuredImg = getFeaturedImage(product, 'medium');
                let imgUrl = featuredImg?.url;
                // Use topic fallback when no featured image or it's just a logo
                if (!imgUrl || imgUrl.toLowerCase().includes('logo')) {
                  imgUrl = getTopicFallbackImage(product.slug, product.title.rendered);
                }
                imgUrl = resolveImageUrl(imgUrl) || imgUrl;
                return (
                  <Link
                    key={product.id}
                    href={`/shop/${product.slug}`}
                    className="group block bg-white border border-slate-200 hover:border-[#c0392b] transition-all overflow-hidden"
                  >
                    <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                      {imgUrl.toLowerCase().endsWith('.gif') ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imgUrl}
                          alt={featuredImg?.alt || product.title.rendered}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <Image
                          src={imgUrl}
                          alt={featuredImg?.alt || product.title.rendered}
                          fill
                          unoptimized={imgUrl.startsWith('http')}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
                    </div>
                    <div className="p-5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#c0392b]">
                        Production Courses
                      </span>
                      <h3
                        className="text-base font-bold text-slate-900 mt-2 group-hover:text-[#c0392b] transition-colors leading-snug"
                        dangerouslySetInnerHTML={{ __html: product.title.rendered }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {SHORTER_COURSES.map((course) => (
                <Link
                  key={course.href}
                  href={course.href}
                  className="group block bg-white border border-slate-200 hover:border-[#c0392b] transition-all overflow-hidden"
                >
                  <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                    <Image
                      src={resolveImageUrl(getTopicFallbackImage(course.href, course.title)) || getTopicFallbackImage(course.href, course.title)}
                      alt={course.title}
                      fill
                      unoptimized={true}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#c0392b]">
                      {course.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-2 group-hover:text-[#c0392b] transition-colors leading-snug">
                      {course.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== TESTIMONIALS SECTION ===== */}
      <section className="py-16 lg:py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-[#c0392b] mb-10">
            Hear what our previous students have to say about us!
          </p>

          <div className="space-y-10">
            {TESTIMONIALS.map((t, i) => (
              <blockquote key={i} className="text-center">
                <p className="text-lg sm:text-xl text-slate-800 leading-relaxed italic max-w-3xl mx-auto">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <cite className="block mt-4 text-sm font-bold text-slate-600 not-italic">
                  — {t.author}
                </cite>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PARTNERS SECTION ===== */}
      <section className="bg-[#c0392b] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
            {PARTNERS.map((partner) => (
              <div key={partner.name} className="relative h-8 w-24 sm:h-10 sm:w-32 flex-shrink-0 opacity-80 hover:opacity-100 transition-opacity">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={partner.src}
                  alt={partner.name}
                  className="h-full w-full object-contain brightness-0 invert"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA CONSULTATION BANNER ===== */}
      <section className="bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 uppercase tracking-wide">
          Free 15-Minute Consultation
        </h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto mb-6">
          Book a free 15-minute one-to-one phone consultation, with one of our friendly admissions
          specialists. Let&apos;s get your music moving!
        </p>
        <a
          href="https://edu.garnishmusicproduction.com/connect"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-8 py-3.5 bg-[#c0392b] text-white text-sm font-bold uppercase tracking-wider hover:bg-[#a93226] transition-colors"
        >
          Click here
        </a>
      </section>
    </div>
  );
}
