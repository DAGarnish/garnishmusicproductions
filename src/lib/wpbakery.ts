import { resolveImageUrl } from './wordpress';

/**
 * Parses WPBakery Page Builder and Mikado theme shortcodes into clean,
 * modern, responsive Tailwind CSS layouts with accessible interactive accordions.
 */
export function parseWPBakery(content: string | null | undefined, accentColor: string = '#dd0000'): string {
  if (!content) return '';

  let html = content;

  // Replace HTML quote entities and curly quotes with straight quotes for easier matching
  html = html
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
  html = html
    .replace(/<p>\s*(\[\/?(vc_|mkd_)[^\]]+\])\s*<\/p>/gi, '$1')
    .replace(/<p>\s*(\[\/?(vc_|mkd_)[^\]]+\])/gi, '$1')
    .replace(/(\[\/?(vc_|mkd_)[^\]]+\])\s*<\/p>/gi, '$1')
    .replace(/<br\s*\/?>\s*(\[\/?(vc_|mkd_)[^\]]+\])/gi, '$1')
    .replace(/(\[\/?(vc_|mkd_)[^\]]+\])\s*<br\s*\/?>/gi, '$1');

  // 1. Process vc_video link="..." shortcodes into responsive YouTube/Vimeo iframes
  html = html.replace(/\[vc_video\s+[^\]]*link=["']([^"']+)["'][^\]]*\]/gi, (match, url) => {
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

  // 2. Process vc_single_image
  html = html.replace(/\[vc_single_image\s*([^\]]*)\]/gi, (match, attrs) => {
    const imgMatch = attrs.match(/image="([^"]+)"/i) || attrs.match(/img_size="([^"]+)"/i);
    const urlMatch = attrs.match(/url="([^"]+)"/i) || attrs.match(/link="([^"]+)"/i);
    
    let imageUrl = 'https://res.cloudinary.com/s7pus8t5/image/upload/garnish-uploads/2020/02/Garnish26-1.jpg';
    if (urlMatch && urlMatch[1]) {
      imageUrl = urlMatch[1];
      const resolved = resolveImageUrl(imageUrl);
      if (resolved) imageUrl = resolved;
    }
    return `
      <div class="relative aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-sm border border-slate-100 my-6 bg-slate-50">
        <img src="${imageUrl}" alt="Course Asset" class="object-cover w-full h-full" />
      </div>
    `;
  });

  // 2. Process Mikado Accordions ([mkd_accordion] ... [/mkd_accordion])
  html = html.replace(/\[mkd_accordion\s*([^\]]*)\]/gi, '<div class="my-8 space-y-4 w-full test-page-accordion">');
  html = html.replace(/\[\/mkd_accordion\]/gi, '</div>');

  // 3. Process Accordion Tabs ([mkd_accordion_tab title="The Basics" ...])
  let accordionIndex = 0;
  html = html.replace(/\[mkd_accordion_tab\s*([^\]]*)\]/gi, (match, attrs) => {
    const titleMatch = attrs.match(/title=["']([^"']+)["']/i);
    const title = titleMatch ? titleMatch[1] : 'Course Section';
    const isOpen = accordionIndex === 0 ? ' open' : '';
    accordionIndex++;

    return `
      <details class="group rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm transition-all"${isOpen}>
        <summary class="flex items-center justify-between p-4 sm:p-5 text-white font-bold cursor-pointer select-none text-base sm:text-lg transition-colors" style="background-color: ${accentColor};">
          <span>${title}</span>
          <span class="text-xl font-mono transition-transform duration-200 group-open:rotate-180">▾</span>
        </summary>
        <div class="p-6 text-slate-700 leading-relaxed bg-white border-t border-slate-100 prose prose-slate max-w-none">
    `;
  });
  html = html.replace(/\[\/mkd_accordion_tab\]/gi, '</div></details>');

  // 4. Process Mikado Separators
  html = html.replace(/\[mkd_separator\s*([^\]]*)\]/gi, `
    <hr class="my-6 border-t-2 w-full" style="border-color: ${accentColor};" />
  `);

  // 5. Process structural shortcodes (vc_row, vc_column)
  html = html.replace(/\[vc_row\s*([^\]]*)\]/gi, (match, attrs) => {
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
  html = html.replace(/\[\/vc_row\]/gi, '</div>');

  html = html.replace(/\[vc_row_inner\s*([^\]]*)\]/gi, '<div class="flex flex-wrap gap-6 my-4 w-full">');
  html = html.replace(/\[\/vc_row_inner\]/gi, '</div>');

  html = html.replace(/\[vc_column\s*([^\]]*)\]/gi, (match, attrs) => {
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
  html = html.replace(/\[\/vc_column\]/gi, '</div>');

  html = html.replace(/\[vc_column_inner\s*([^\]]*)\]/gi, (match, attrs) => {
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
  html = html.replace(/\[\/vc_column_inner\]/gi, '</div>');

  // 6. Process vc_empty_space
  html = html.replace(/\[vc_empty_space\s*([^\]]*)\]/gi, (match, attrs) => {
    const heightMatch = attrs.match(/height="([^"]+)"/i) || attrs.match(/height=([^\s\]]+)/i);
    const height = heightMatch ? heightMatch[1] : '24px';
    return `<div style="height: ${height};" class="w-full"></div>`;
  });

  // 7. Strip all remaining unhandled vc_ and mkd_ shortcodes ([vc_column_text], [/vc_column_text], [mkd_portfolio_slider...], etc.)
  html = html.replace(/\[\/?(vc_|mkd_)[^\]]*\]/gi, '');

  // 8. Clean up leftover empty paragraphs and convert CDN links
  html = html.replace(/<p>\s*<\/p>/gi, '');
  html = html
    .replace(/https?:\/\/[^\/]+\/wp-content\/uploads\//gi, 'https://www.garnishmusicproduction.com/wp-content/uploads/')
    .replace(/(?<![a-z]:\/\/[^\s"']*)\/(wp-content\/uploads\/)/gi, 'https://www.garnishmusicproduction.com/$1')
    .replace(/src=["']\/uploads\//gi, 'src="https://www.garnishmusicproduction.com/wp-content/uploads/');

  // 9. Force any WPBakery column wrapping mkd-testimonials to occupy 100% full width
  if (html.includes('mkd-testimonials') || html.includes('mkd-testimonial')) {
    html = html.replace(
      /<div class="[^"]*md:w-\[calc\([^)]+\)\][^"]*">([\s\S]*?mkd-testimonials[\s\S]*?)<\/div>/gi,
      '<div class="w-full flex flex-col justify-center my-6">$1</div>'
    );
  }

  return html;
}
