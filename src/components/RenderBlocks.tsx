import React from 'react';
import Link from 'next/link';
import type { SiteConfig } from '@/lib/sites';
import { parseWPBakery } from '@/lib/wpbakery';

interface BlockProps {
  layout?: any[] | null;
  site: SiteConfig;
}

export const RenderBlocks: React.FC<BlockProps> = ({ layout, site }) => {
  if (!layout || !Array.isArray(layout) || layout.length === 0) {
    return null;
  }

  return (
    <div className="space-y-12">
      {layout.map((block, index) => {
        const key = block.id || `block-${index}`;

        switch (block.blockType) {
          case 'hero':
            return (
              <section key={key} className="bg-slate-900 text-white rounded-3xl p-8 sm:p-14 relative overflow-hidden shadow-md">
                <div 
                  className="absolute inset-0 opacity-40 bg-gradient-to-br"
                  style={{ backgroundImage: `linear-gradient(135deg, ${site.accentColor}40 0%, #0f172a 100%)` }}
                />
                <div className="relative z-10 max-w-3xl">
                  {block.badge && (
                    <span 
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
                      style={{ color: '#fff', backgroundColor: site.accentColor }}
                    >
                      {block.badge}
                    </span>
                  )}
                  <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight font-display mb-6">
                    {block.heading}
                  </h1>
                  {block.subheading && (
                    <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8">
                      {block.subheading}
                    </p>
                  )}
                  {block.buttons && Array.isArray(block.buttons) && (
                    <div className="flex flex-wrap gap-4">
                      {block.buttons.map((btn: any, btnIdx: number) => (
                        <Link
                          key={btnIdx}
                          href={btn.url || '#'}
                          className={`px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${
                            btn.style === 'secondary'
                              ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                              : 'text-white hover:opacity-90'
                          }`}
                          style={btn.style === 'primary' ? { backgroundColor: site.accentColor } : {}}
                        >
                          {btn.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            );

          case 'richText': {
            // Parse WPBakery shortcodes if present (migrated legacy content)
            const cleanHtml = parseWPBakery(block.htmlContent || '', site.accentColor);

            return (
              <section key={key} className={`mx-auto ${block.containerWidth === 'full' ? 'w-full' : 'max-w-4xl'}`}>
                <div 
                  className="wp-content prose prose-slate max-w-none"
                  style={{ '--accent': site.accentColor } as React.CSSProperties}
                  dangerouslySetInnerHTML={{ __html: cleanHtml }}
                />
              </section>
            );
          }

          case 'courseGrid':
            return (
              <section key={key} className="py-8 border-t border-slate-100">
                <div className="text-center max-w-2xl mx-auto mb-10">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {block.heading || 'Featured Programs'}
                  </h2>
                  {block.subheading && (
                    <p className="text-slate-500 text-sm mt-2">{block.subheading}</p>
                  )}
                </div>
                <div className={`grid gap-6 sm:grid-cols-${block.columns || '3'}`}>
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100/80 hover:shadow-md transition-shadow">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2 block">Comprehensive Certificate</span>
                    <h3 className="font-bold text-slate-900 text-lg mb-2">Music Production & Sound Engineering</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-6">Our flagship 360-hour academy program covering Ableton Live, Logic Pro, Pro Tools, mixing, acoustics, and synthesis.</p>
                    <Link href="/programs/music-production" className="text-xs font-bold flex items-center gap-1 hover:underline" style={{ color: site.accentColor }}>
                      Explore Program &rarr;
                    </Link>
                  </div>
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100/80 hover:shadow-md transition-shadow">
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-2 block">Specialized Academy</span>
                    <h3 className="font-bold text-slate-900 text-lg mb-2">Electronic Music & DJ Performance</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-6">Master club sound systems, beatmatching, harmonic mixing, performance setups, and live remixing.</p>
                    <Link href="/programs/dj-performance" className="text-xs font-bold flex items-center gap-1 hover:underline" style={{ color: site.accentColor }}>
                      Explore Program &rarr;
                    </Link>
                  </div>
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100/80 hover:shadow-md transition-shadow">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-600 mb-2 block">Professional Track</span>
                    <h3 className="font-bold text-slate-900 text-lg mb-2">Mix Engineering & Mastering</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-6">Advanced analogue and digital mix techniques, acoustic treatment, mastering signal chains, and stem preparation.</p>
                    <Link href="/programs/mixing-mastering" className="text-xs font-bold flex items-center gap-1 hover:underline" style={{ color: site.accentColor }}>
                      Explore Program &rarr;
                    </Link>
                  </div>
                </div>
              </section>
            );

          case 'featureGrid':
            return (
              <section key={key} className="py-6">
                {block.heading && (
                  <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">{block.heading}</h2>
                )}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {block.features && Array.isArray(block.features) && block.features.map((feat: any, idx: number) => (
                    <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                      <h3 className="font-bold text-slate-900 mb-2">{feat.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">{feat.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            );

          case 'cta':
            return (
              <section 
                key={key} 
                className={`rounded-3xl p-8 sm:p-12 text-center my-8 ${
                  block.theme === 'dark'
                    ? 'bg-slate-900 text-white'
                    : block.theme === 'light'
                    ? 'bg-slate-50 border border-slate-200 text-slate-900'
                    : 'text-white shadow-lg'
                }`}
                style={block.theme === 'accent' ? { backgroundColor: site.accentColor } : {}}
              >
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-4 font-display">
                  {block.heading}
                </h2>
                {block.description && (
                  <p className="text-sm sm:text-base opacity-90 max-w-2xl mx-auto leading-relaxed mb-8">
                    {block.description}
                  </p>
                )}
                <Link
                  href={block.buttonUrl || '/contact'}
                  className="inline-block px-8 py-3.5 rounded-xl font-bold text-sm bg-white text-slate-900 hover:bg-slate-100 shadow-sm transition-all"
                >
                  {block.buttonLabel || 'Enroll Now'}
                </Link>
              </section>
            );

          default:
            return null;
        }
      })}
    </div>
  );
};
