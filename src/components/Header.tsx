'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { getLocalLink, type SiteConfig } from '@/lib/sites';

interface HeaderProps {
  site: SiteConfig;
}

// Exact navigation structure from live WordPress site
const ABOUT_ITEMS = {
  locations: [
    { label: 'World Home', href: 'https://edu.garnishmusicproduction.com/', code: 'edu' },
    { label: 'LDN', href: 'https://www.garnishmusicproduction.com/', code: 'www' },
    { label: 'LA', href: 'https://la.garnishmusicproduction.com/', code: 'la' },
    { label: 'NY', href: 'https://ny.garnishmusicproduction.com/', code: 'ny' },
    { label: 'NSH', href: 'https://nsh.garnishmusicproduction.com/', code: 'nsh' },
    { label: 'BER', href: 'https://ber.garnishmusicproduction.com/', code: 'ber' },
    { label: 'HK', href: 'https://hk.garnishmusicproduction.com', code: 'hk' },
    { label: 'MIA', href: 'https://mia.garnishmusicproduction.com/', code: 'mia' },
    { label: 'TYO', href: 'https://tyo.garnishmusicproduction.com/', code: 'tyo' },
    { label: 'SEA', href: 'https://sea.garnishmusicproduction.com/', code: 'sea' },
    { label: 'BCN', href: 'https://bcn.garnishmusicproduction.com/', code: 'bcn' },
    { label: 'HOU', href: 'https://hou.garnishmusicproduction.com/', code: 'hou' },
    { label: 'SYD', href: 'https://syd.garnishmusicproduction.com/', code: 'syd' },
    { label: 'AV', href: 'https://av.garnishmusicproduction.com/', code: 'av' },
    { label: 'LIS', href: 'https://lis.garnishmusicproduction.com/', code: 'lis' },
    { label: 'SF', href: 'https://sf.garnishmusicproduction.com/', code: 'sf' },
    { label: 'SG', href: 'https://sg.garnishmusicproduction.com/', code: 'sg' },
    { label: 'PDX', href: 'https://pdx.garnishmusicproduction.com/', code: 'pdx' },
    { label: 'MRB', href: 'https://mrb.garnishmusicproduction.com/', code: 'mrb' },
    { label: 'BH', href: 'https://bh.garnishmusicproduction.com/', code: 'bh' },
  ],
};

const getAboutItems = (subdomain?: string) => {
  if (subdomain === 'la') {
    return [
      { label: 'Home', href: '/' },
      { label: 'Discord', href: 'https://garn.link/discord' },
      { label: 'Tutors', href: '/instructors/' },
      { label: 'Appu Krishnan', href: 'https://la.garnishmusicproduction.com/instructors/appu/' },
      { label: 'Dave Garnish', href: 'https://edu.garnishmusicproduction.com/music/dave-garnish/' },
      { label: 'Terms', href: '/terms/' },
      { label: 'Privacy Policy', href: '/privacy-policy/' },
      { label: 'Gift Certificate', href: 'https://edu.garnishmusicproduction.com/gift/' },
      { label: 'Contact', href: '/contact/' },
    ];
  }
  if (subdomain === 'edu') {
    return [
      { label: 'Home', href: '/' },
      { label: 'International Academy', href: '/international-academy/' },
      { label: 'Dave Garnish', href: 'https://edu.garnishmusicproduction.com/music/dave-garnish/' },
      { label: 'Terms', href: '/terms/' },
      { label: 'Privacy Policy', href: '/privacy-policy/' },
      { label: 'Contact', href: '/contact/' },
    ];
  }
  if (subdomain === 'mia') {
    return [
      { label: 'Home', href: '/' },
      { label: 'Open House', href: '/open-house/' },
      { label: 'Instructors', href: '/instructors/' },
      { label: 'Dave Garnish', href: 'https://edu.garnishmusicproduction.com/music/dave-garnish/' },
      { label: 'Terms', href: '/terms/' },
      { label: 'Privacy Policy', href: '/privacy-policy/' },
      { label: 'Contact', href: '/contact/' },
    ];
  }
  if (subdomain === 'ber') {
    return [
      { label: 'Home', href: '/' },
      { label: 'Private/Bespoke', href: '/bespoke-private-tuition/' },
      { label: 'Dave Garnish', href: 'https://edu.garnishmusicproduction.com/music/dave-garnish/' },
      { label: 'Compliancy', href: '/compliancy/' },
      { label: 'Privacy', href: '/privacy-policy/' },
      { label: 'Contact', href: '/contact/' },
    ];
  }
  if (subdomain === 'ny') {
    return [
      { label: 'Home', href: '/' },
      { label: 'Discord', href: 'https://garn.link/discord' },
      { label: 'Instructors', href: '/instructors/' },
      { label: 'Dave Garnish', href: 'https://edu.garnishmusicproduction.com/music/dave-garnish/' },
      { label: 'Terms', href: '/terms/' },
      { label: 'Privacy Policy', href: '/privacy-policy/' },
      { label: 'Contact', href: '/contact/' },
    ];
  }
  if (subdomain === 'bcn') {
    return [
      { label: 'Home', href: '/' },
      { label: 'Dave Garnish', href: 'https://edu.garnishmusicproduction.com/music/dave-garnish/' },
      { label: 'Private Tuition', href: '/bespoke-private-tuition/' },
      { label: 'Terms', href: '/terms/' },
      { label: 'Privacy Policy', href: '/privacy-policy/' },
      { label: 'Contact', href: '/contact/' },
    ];
  }
  if (subdomain === 'nsh') {
    return [
      { label: 'Home', href: '/' },
      { label: 'Instructors', href: '/instructors/' },
      { label: 'Dave Garnish', href: 'https://edu.garnishmusicproduction.com/music/dave-garnish/' },
      { label: 'Online Community', href: 'https://garn.link/discord' },
      { label: 'Terms', href: '/terms/' },
      { label: 'Privacy Policy', href: '/privacy-policy/' },
      { label: 'Contact', href: '/contact/' },
    ];
  }
  if (subdomain === 'sf') {
    return [
      { label: 'Home', href: '/' },
      { label: 'Online', href: 'https://edu.garnishmusicproduction.com/live-online/' },
      { label: 'Dave Garnish', href: 'https://edu.garnishmusicproduction.com/music/dave-garnish/' },
      { label: 'Terms', href: '/terms/' },
      { label: 'Privacy Policy', href: '/privacy-policy/' },
      { label: 'Contact', href: '/contact/' },
    ];
  }
  if (subdomain === 'www') {
    return [
      { label: 'Home', href: '/' },
      { label: 'Tutors', href: '/instructors/' },
      { label: 'Dave Garnish', href: 'https://edu.garnishmusicproduction.com/music/dave-garnish/' },
      { label: 'Open House', href: '/open-house/' },
      { label: 'Private Tuition', href: '/bespoke-private-tuition/' },
      { label: 'Terms', href: '/terms/' },
      { label: 'Privacy Policy', href: '/privacy-policy/' },
      { label: 'Contact', href: '/contact/' },
    ];
  }
  return [
    { label: 'Home', href: '/' },
    { label: 'Instructors', href: '/instructors/' },
    { label: 'Dave Garnish', href: 'https://edu.garnishmusicproduction.com/music/dave-garnish/' },
    { label: 'Open House', href: '/open-house/' },
    { label: 'Private/Bespoke Tuition', href: '/bespoke-private-tuition/' },
    { label: 'Online Community', href: 'https://garn.link/discord' },
    { label: 'Terms', href: '/terms/' },
    { label: 'Privacy Policy', href: '/privacy-policy/' },
    { label: 'Contact', href: '/contact/' },
  ];
};

interface CourseCategoryItem {
  label: string;
  href: string;
}

interface CourseCategory {
  heading: string;
  items: CourseCategoryItem[];
}

const getCoursesItems = (subdomain?: string): Record<string, CourseCategory> => {
  if (subdomain === 'la') {
    return {
      flagship: {
        heading: 'Flagship & Diplomas',
        items: [
          { label: 'Undergraduate Business and Music (F1 Visa)', href: '/undergraduate-business-and-music/' },
          { label: 'Our Flagship 360° Academy', href: '/academy/our-flagship-360-academy/' },
          { label: 'Logic Producer Program', href: '/programs/logic-producer-program/' },
        ],
      },
      production: {
        heading: 'Music Production',
        items: [
          { label: 'Ableton Production', href: '/courses/ableton-production/' },
          { label: 'Logic Production', href: '/courses/logic-production/' },
          { label: 'Hip-Hop Production', href: '/courses/hip-hop-production/' },
          { label: 'Rhythm Section Pro', href: '/courses/rhythm-section-pro/' },
        ],
      },
      specialized: {
        heading: 'Specialized & Express',
        items: [
          { label: 'Hit Songwriting', href: '/courses/hit-songwriting/' },
          { label: 'Mixing/Mixdown Course', href: '/courses/mixing-mixdown-course/' },
          { label: 'DJ Class', href: '/courses/dj-class/' },
          { label: 'Composition', href: '/courses/composition/' },
          { label: 'Foundations', href: '/courses/foundations/' },
        ],
      },
      others: {
        heading: 'Private & Masterclass',
        items: [
          { label: 'Private Instruction & Tuition', href: '/bespoke-private-tuition/' },
          { label: 'Ableton Garnish Certified', href: '/courses/ableton-garnish-certified/' },
          { label: 'Dave Garnish Masterclass', href: 'https://edu.garnishmusicproduction.com/music/dave-garnish/' },
        ],
      },
    };
  }

  if (subdomain === 'mia') {
    return {
      comprehensive: {
        heading: 'Comprehensive Programs',
        items: [
          { label: 'Ableton Producer Program', href: '/programs/ableton-producer-program/' },
          { label: 'Logic Producer Program', href: '/programs/logic-producer-program/' },
          { label: 'Electronic Music Production', href: '/programs/electronic-music-production/' },
        ],
      },
      production: {
        heading: 'Production & DAWs',
        items: [
          { label: 'Ableton Production', href: '/courses/ableton-production/' },
          { label: 'Logic Pro', href: '/courses/logic-course/' },
          { label: 'Pro Tools', href: '/courses/pro-tools/' },
          { label: 'Hip Hop Production', href: '/courses/hip-hop-production/' },
        ],
      },
      djAndSongwriting: {
        heading: 'DJ & Songwriting',
        items: [
          { label: 'Electronic Music DJ Course', href: '/courses/electronic-music-dj-course/' },
          { label: 'Curso de DJ Pro en Español', href: '/courses/curso-de-dj-pro-en-espanol/' },
          { label: 'Songwriting Course', href: '/courses/songwriting-course/' },
          { label: 'Songwriting Music Producer', href: '/programs/songwriting-music-producer/' },
        ],
      },
      specialized: {
        heading: 'Specialized & Private',
        items: [
          { label: 'Mixing & Mastering Course', href: '/courses/mixing-mastering-course/' },
          { label: 'Final Cut Pro', href: '/courses/final-cut-pro/' },
          { label: 'Private Instruction & Tuition', href: '/bespoke-private-tuition/' },
        ],
      },
    };
  }

  if (subdomain === 'ny') {
    return {
      flagship: {
        heading: 'Flagship & Programs',
        items: [
          { label: 'Our Flagship 360° Academy', href: '/academy/our-flagship-360-academy/' },
          { label: 'Logic Producer Program', href: '/programs/logic-producer-program/' },
        ],
      },
      production: {
        heading: 'Music Production',
        items: [
          { label: 'Ableton Production', href: '/courses/ableton-production/' },
          { label: 'Logic Production', href: '/courses/logic-production/' },
          { label: 'Hip-Hop Production', href: '/courses/hip-hop-production/' },
          { label: 'Rhythm Section Pro', href: '/courses/rhythm-section-pro/' },
        ],
      },
      synthesis: {
        heading: 'Synthesis & Sound Art',
        items: [
          { label: 'Electronic Sound Art', href: '/courses/electronic-sound-art/' },
          { label: 'Sounds Design & Synthesis', href: '/courses/sounds-design-synthesis/' },
          { label: 'Hit Songwriting', href: '/courses/hit-songwriting/' },
          { label: 'Composition', href: '/courses/composition/' },
        ],
      },
      specialized: {
        heading: 'Mixing, DJ & Private',
        items: [
          { label: 'Mixing/Mixdown Course', href: '/courses/mixing/' },
          { label: 'DJ Class', href: '/courses/edj/' },
          { label: 'Ableton Garnish Certified', href: '/courses/ableton-garnish-certified/' },
          { label: 'Private Instruction & Tuition', href: '/bespoke-private-tuition/' },
        ],
      },
    };
  }

  if (['ber', 'bcn', 'syd', 'pdx', 'lis', 'sea', 'tyo'].includes(subdomain || '')) {
    return {
      comprehensive: {
        heading: 'Comprehensive Programs',
        items: [
          { label: 'Electronic Music Producer Certification', href: '/programs/ableton-producer-program/' },
          { label: 'Modern Music Producer Certification', href: '/programs/logic-producer-program/' },
          { label: 'Electronic Music Production', href: '/programs/electronic-music-production/' },
        ],
      },
      daws: {
        heading: 'DAWs & Production',
        items: [
          { label: 'Ableton Production', href: '/courses/ableton-production/' },
          { label: 'Logic Pro', href: '/courses/logic-course/' },
          { label: 'Pro Tools', href: '/courses/pro-tools/' },
          { label: 'Hip Hop Production', href: '/courses/hip-hop-production/' },
        ],
      },
      mixingAndSongwriting: {
        heading: 'Mixing & Songwriting',
        items: [
          { label: 'Mixing & Mastering Course', href: '/courses/mixing-mastering-course/' },
          { label: 'Songwriting Course', href: '/courses/songwriting-course/' },
          { label: 'Songwriting Music Producer', href: '/programs/songwriting-music-producer/' },
        ],
      },
      djAndVideo: {
        heading: 'DJ, Video & Private',
        items: [
          { label: 'Electronic Music DJ Course', href: '/courses/electronic-music-dj-course/' },
          { label: 'Turntablism DJ Course', href: '/courses/turntablism-dj-course/' },
          { label: 'Final Cut Pro', href: '/courses/final-cut-pro/' },
          { label: 'Private Instruction & Tuition', href: '/bespoke-private-tuition/' },
        ],
      },
    };
  }

  if (subdomain === 'sf') {
    return {
      programs: {
        heading: 'Programs & Workshops',
        items: [
          { label: 'Ableton Music Producer Program', href: '/programs/ableton-music-producer-program/' },
          { label: 'Build Beats Better Workshop', href: '/courses/buildbeatsbetter/' },
          { label: '12 Hour Music Business Course', href: '/courses/music-business/' },
        ],
      },
      daws: {
        heading: 'DAW Training',
        items: [
          { label: 'Ableton Live 101/201', href: '/courses/abletonlive101201/' },
          { label: 'Logic Pro X', href: '/courses/logic-course/' },
        ],
      },
      dj: {
        heading: 'DJ Courses',
        items: [
          { label: 'Electronic Music DJ', href: '/courses/electronic-music-dj-course/' },
          { label: '12 Hours Private DJ Lessons', href: '/courses/12-hours-private-dj-lessons/' },
        ],
      },
      others: {
        heading: 'Tuition & Payment Plans',
        items: [
          { label: 'Course Tuition Options', href: '/courses/course-tuition/' },
          { label: 'Workshop Payment Plan', href: '/courses/36-hour-workshop-payment-plan-custom/' },
        ],
      },
    };
  }

  if (['nsh', 'sg', 'hou'].includes(subdomain || '')) {
    return {
      programs: {
        heading: 'Producer Programs',
        items: [
          { label: 'Ableton Producer Program', href: '/programs/ableton-producer-program/' },
          { label: 'Songwriting Producer Program', href: '/programs/logic-producer-program/' },
          { label: 'Pop Music Production Course', href: '/programs/pop-music-production-course/' },
          { label: 'Electronic Music Production', href: '/programs/electronic-music-production/' },
        ],
      },
      daws: {
        heading: 'DAWs & Beatmaking',
        items: [
          { label: 'Ableton Production', href: '/courses/ableton-production/' },
          { label: 'Logic Pro', href: '/courses/logic-course/' },
          { label: 'Pro Tools', href: '/courses/pro-tools/' },
          { label: 'Maschine', href: '/courses/maschine/' },
        ],
      },
      mixingAndSongwriting: {
        heading: 'Mixing & Songwriting',
        items: [
          { label: 'Mixing & Mastering Course', href: '/courses/mixing-mastering-course/' },
          { label: 'Songwriting Course', href: '/courses/songwriting-course/' },
          { label: 'Songwriting Music Producer', href: '/programs/songwriting-music-producer/' },
        ],
      },
      djAndPrivate: {
        heading: 'DJ & Private Tuition',
        items: [
          { label: 'Electronic Music DJ Course', href: '/courses/electronic-music-dj-course/' },
          { label: 'Final Cut Pro', href: '/courses/final-cut-pro/' },
          { label: 'Private Instruction & Tuition', href: '/bespoke-private-tuition/' },
        ],
      },
    };
  }

  // Worldwide / London default
  return {
    accredited: {
      heading: 'Accredited & Diplomas',
      items: [
        { label: 'F1 USA Visa Eligible (LA)', href: 'https://la.garnishmusicproduction.com/undergraduate-business-and-music/' },
        { label: 'BA (Hons) Pathways (BCN)', href: '/ba-pathway-courses/' },
      ],
    },
    comprehensive: {
      heading: 'Comprehensive Programs',
      items: [
        { label: '360° Garnish Music Academy', href: '/academy/electronic-music-production/' },
        { label: 'Electronic Music Producer Program', href: '/programs/ableton-producer-program/' },
        { label: 'Pop Music Producer Program', href: '/programs/pop-producer-program/' },
      ],
    },
    express: {
      heading: 'Express Classes',
      items: [
        { label: 'Ableton Live', href: '/courses/ableton-live-course-london/' },
        { label: 'Logic Pro', href: '/courses/logic-pro-x-course-london/' },
        { label: 'Logic Pro Self Paced', href: 'https://www.musicgurus.com/learn/garnish-music-production-online-courses/' },
        { label: 'FL Studio', href: '/courses/fl-studio/' },
        { label: 'Pro Tools', href: '/courses/pro-tools/' },
        { label: 'Mixing/Mixdown', href: '/courses/mixing-and-mastering-course-london/' },
        { label: 'Mastering', href: '/courses/mastering/' },
        { label: 'Hit Songwriting Course', href: '/courses/songwriting-course-london/' },
        { label: 'Vocal Production', href: '/courses/vocal-production/' },
        { label: 'Composition', href: '/courses/composition/' },
        { label: 'Ableton Live for DJs', href: '/courses/ableton-live-for-djs/' },
        { label: 'Sound Design & Synthesis in Ableton Live', href: '/courses/sound-design/' },
        { label: 'Rekordbox', href: '/courses/rekordbox/' },
        { label: 'Electronic Sound Art with Arturia', href: '/courses/arturia/' },
        { label: 'Rhythm Section Programming', href: '/courses/rhythm-section-programming/' },
        { label: 'Radio & Podcast', href: '/courses/radio-podcast/' },
      ],
    },
    others: {
      heading: 'Others & Specialties',
      items: [
        { label: 'Private Instruction & Tuition', href: '/bespoke-private-tuition/' },
        { label: 'Electronic Music DJ Course', href: '/courses/dj-course/' },
        { label: 'Post Production - Mixing and Sound Design for Film and TV', href: '/courses/post-production/' },
        { label: 'K-pop Hit Songwriting & Music Production', href: '/courses/k-pop/' },
      ],
    },
  };
};

export default function Header({ site }: HeaderProps) {
  const pathname = usePathname();
  const coursesItems = getCoursesItems(site.subdomain);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close menus automatically whenever route/pathname changes
  useEffect(() => {
    setActiveMenu(null);
    setMobileOpen(false);
  }, [pathname]);

  // Close mobile menu on resize
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const openMenu = (menu: string) => {
    if (menuTimeout.current) clearTimeout(menuTimeout.current);
    setActiveMenu(menu);
  };

  const closeMenu = () => {
    menuTimeout.current = setTimeout(() => setActiveMenu(null), 150);
  };

  const handleLinkClick = () => {
    setActiveMenu(null);
    setMobileOpen(false);
  };

  const isExternal = (href: string) => href.startsWith('http');

  const renderLink = (href: string, label: string, className: string, onClickExtra?: () => void) => {
    let finalHref = href;
    // Regional sites don't have "-london" in their course slugs.
    // Strip "-london" from the end of the URL before resolving it.
    if (site.subdomain && site.subdomain !== 'www' && site.subdomain !== 'edu') {
      if (finalHref.startsWith('/courses/')) {
        finalHref = finalHref.replace(/-london(\/?)$/, '$1');
      }
    }
    
    const localHref = getLocalLink(finalHref);
    const handleClick = () => {
      handleLinkClick();
      if (onClickExtra) onClickExtra();
    };

    if (isExternal(localHref)) {
      return (
        <a href={localHref} className={className} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
          {label}
        </a>
      );
    }
    return <Link href={localHref} className={className} onClick={handleClick}>{label}</Link>;
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[70px]">
          {/* Logo - matching the Garnish block lettering */}
          <Link href="/" className="flex items-center gap-2 shrink-0" onClick={handleLinkClick}>
            <span className="text-[22px] font-black tracking-[0.04em] text-slate-900 uppercase"
              style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
              GAR
              <span className="relative">
                N
                <span className="absolute left-[45%] top-[38%] w-[3px] h-[35%] bg-emerald-500 -translate-x-1/2" />
              </span>
              ISH
            </span>
            {site.subdomain !== 'www' && (
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-slate-400 ml-1 self-end mb-[2px]">
                {site.city}
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-0">
            {/* About Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => openMenu('about')}
              onMouseLeave={closeMenu}
            >
              <button className="flex items-center gap-1 px-4 py-6 text-[13px] font-semibold text-slate-700 hover:text-[#c0392b] uppercase tracking-wide transition-colors">
                About
                <svg className="w-3 h-3 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {activeMenu === 'about' && (
                <div
                  className="absolute top-full left-0 pt-0 w-[420px] z-50"
                  onMouseEnter={() => openMenu('about')}
                  onMouseLeave={closeMenu}
                >
                  <div className="bg-white rounded-b-lg shadow-xl border border-t-0 border-slate-200 p-6">
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#c0392b] mb-3">
                          {site.subdomain === 'edu' ? 'Information' : site.city}
                        </h4>
                        <ul className="space-y-2">
                          {getAboutItems(site.subdomain).map((item) => (
                            <li key={item.href}>
                              {renderLink(item.href, item.label,
                                'block text-[13px] text-slate-600 hover:text-[#c0392b] transition-colors'
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#c0392b] mb-3">
                          Locations
                        </h4>
                        <ul className="space-y-1.5">
                          {ABOUT_ITEMS.locations.map((item) => (
                            <li key={item.code}>
                              <a
                                href={getLocalLink(item.href)}
                                onClick={handleLinkClick}
                                className={`block text-[13px] transition-colors ${
                                  site.subdomain === item.code
                                    ? 'text-[#c0392b] font-semibold'
                                    : 'text-slate-600 hover:text-[#c0392b]'
                                }`}
                              >
                                {item.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Music Production Courses Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => openMenu('courses')}
              onMouseLeave={closeMenu}
            >
              <button className="flex items-center gap-1 px-4 py-6 text-[13px] font-semibold text-slate-700 hover:text-[#c0392b] uppercase tracking-wide transition-colors">
                Music Production Courses
                <svg className="w-3 h-3 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {activeMenu === 'courses' && (
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 pt-0 w-[720px] z-50"
                  onMouseEnter={() => openMenu('courses')}
                  onMouseLeave={closeMenu}
                >
                  <div className="bg-white rounded-b-lg shadow-xl border border-t-0 border-slate-200 p-6">
                    <div className="grid grid-cols-4 gap-6">
                      {Object.values(coursesItems).map((col: CourseCategory) => (
                        <div key={col.heading}>
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#c0392b] mb-3">
                            {col.heading}
                          </h4>
                          <ul className="space-y-2">
                            {col.items.map((item: CourseCategoryItem) => (
                              <li key={item.href}>
                                {renderLink(item.href, item.label,
                                  'block text-[13px] text-slate-600 hover:text-[#c0392b] transition-colors leading-snug'
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Contact */}
            <Link
              href="/contact-map/"
              onClick={handleLinkClick}
              className="px-4 py-6 text-[13px] font-semibold text-slate-700 hover:text-[#c0392b] uppercase tracking-wide transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Right Side: Cart + Mobile Toggle */}
          <div className="flex items-center gap-2">
            {/* Cart Icon */}
            <Link
              href="/cart/"
              onClick={handleLinkClick}
              className="relative p-2 text-slate-600 hover:text-[#c0392b] transition-colors"
              aria-label="Cart"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#c0392b] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                0
              </span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-slate-700 hover:text-[#c0392b] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 shadow-xl max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-4 space-y-1">
            {/* About Section */}
            <div className="border-b border-slate-100 pb-3 mb-3">
              <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#c0392b]">{site.subdomain === 'edu' ? 'Information' : site.city}</p>
              {getAboutItems(site.subdomain).map((item) => {
                const localHref = getLocalLink(item.href);
                return (
                  <div key={item.href}>
                    {isExternal(localHref) ? (
                      <a href={localHref} className="block px-3 py-2 text-sm text-slate-600" onClick={handleLinkClick}>
                        {item.label}
                      </a>
                    ) : (
                      <Link href={localHref} className="block px-3 py-2 text-sm text-slate-600" onClick={handleLinkClick}>
                        {item.label}
                      </Link>
                    )}
                  </div>
                );
              })}

              <p className="px-3 py-2 mt-2 text-[10px] font-bold uppercase tracking-widest text-[#c0392b]">Locations</p>
              <div className="grid grid-cols-3 gap-1 px-3">
                {ABOUT_ITEMS.locations.map((item) => (
                  <a key={item.code} href={getLocalLink(item.href)} className="text-sm text-slate-600 py-1 hover:text-[#c0392b]" onClick={handleLinkClick}>
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Courses Section */}
            {Object.values(coursesItems).map((col: CourseCategory) => (
              <div key={col.heading} className="pb-2">
                <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#c0392b]">{col.heading}</p>
                {col.items.map((item: CourseCategoryItem) => {
                  const localHref = getLocalLink(item.href);
                  return (
                    <div key={item.href}>
                      {isExternal(localHref) ? (
                        <a href={localHref} className="block px-3 py-2 text-sm text-slate-600" onClick={handleLinkClick}>
                          {item.label}
                        </a>
                      ) : (
                        <Link href={localHref} className="block px-3 py-2 text-sm text-slate-600" onClick={handleLinkClick}>
                          {item.label}
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Contact */}
            <Link
              href="/contact-map/"
              className="block px-3 py-3 text-sm font-semibold text-slate-800"
              onClick={handleLinkClick}
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
