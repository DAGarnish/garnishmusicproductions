// src/lib/sites.ts
// Multisite configuration — maps subdomains to WordPress blog IDs

export interface SiteConfig {
  blogId: number;
  subdomain: string;
  name: string;
  city: string;
  tagline: string;
  accentColor: string;       // Primary accent for buttons, links
  accentColorHover: string;
  heroGradient: string;      // Hero section gradient
  heroImage?: string;        // Campus-specific hero image URL
  address?: string;
  phone?: string;
  email?: string;
}

// Direct Cloudinary URLs for all campus hero images (sourced from garnish-media folder)
// These are the actual uploaded CDN URLs — no local file dependency
const _CDN = 'https://res.cloudinary.com/s7pus8t5/image/upload';

export const SITES: Record<string, SiteConfig> = {
  www: {
    blogId: 1,
    subdomain: 'www',
    name: 'Garnish Music Production School',
    city: 'London',
    tagline: "The World's Boutique Music Production School",
    accentColor: '#c0392b',
    accentColorHover: '#a93226',
    heroGradient: 'from-slate-950 via-slate-900 to-slate-950',
    heroImage: `${_CDN}/v1783689930/garnish-media/studio-hero-www.webp`,
  },
  la: {
    blogId: 7,
    subdomain: 'la',
    name: 'Garnish Music Production School',
    city: 'Los Angeles',
    tagline: 'Music Production & DJ School | Los Angeles',
    accentColor: '#c0392b',
    accentColorHover: '#a93226',
    heroGradient: 'from-slate-950 via-slate-900 to-slate-950',
    heroImage: `${_CDN}/v1783689926/garnish-media/studio-hero-la.jpg`,
    address: '7600 Melrose Avenue, Los Angeles, California, 90046, USA',
  },
  ny: {
    blogId: 9,
    subdomain: 'ny',
    name: 'Garnish Music Production School',
    city: 'New York',
    tagline: 'Music Production & DJ School | New York',
    accentColor: '#c0392b',
    accentColorHover: '#a93226',
    heroGradient: 'from-slate-950 via-slate-900 to-slate-950',
    heroImage: `${_CDN}/v1783689926/garnish-media/studio-hero-ny.jpg`,
  },
  nsh: {
    blogId: 2,
    subdomain: 'nsh',
    name: 'Garnish Music Production School',
    city: 'Nashville',
    tagline: 'Music Production School | Nashville',
    accentColor: '#c0392b',
    accentColorHover: '#a93226',
    heroGradient: 'from-slate-950 via-slate-900 to-slate-950',
    heroImage: `${_CDN}/v1783689926/garnish-media/studio-hero-nsh.jpg`,
  },
  ber: {
    blogId: 3,
    subdomain: 'ber',
    name: 'Garnish Music Production School',
    city: 'Berlin',
    tagline: 'Music Production School | Berlin',
    accentColor: '#c0392b',
    accentColorHover: '#a93226',
    heroGradient: 'from-slate-950 via-slate-900 to-slate-950',
    heroImage: `${_CDN}/v1783689924/garnish-media/studio-hero-ber.jpg`,
  },
  hk: {
    blogId: 4,
    subdomain: 'hk',
    name: 'Garnish Music Production School',
    city: 'Hong Kong',
    tagline: 'Music Production School | Hong Kong',
    accentColor: '#c0392b',
    accentColorHover: '#a93226',
    heroGradient: 'from-slate-950 via-slate-900 to-slate-950',
    heroImage: `${_CDN}/v1783689924/garnish-media/studio-hero-hk.jpg`,
  },
  mia: {
    blogId: 5,
    subdomain: 'mia',
    name: 'Garnish Music Production School',
    city: 'Miami',
    tagline: 'Music Production School | Miami',
    accentColor: '#c0392b',
    accentColorHover: '#a93226',
    heroGradient: 'from-slate-950 via-slate-900 to-slate-950',
    heroImage: `${_CDN}/v1783689926/garnish-media/studio-hero-mia.jpg`,
  },
  edu: {
    blogId: 8,
    subdomain: 'edu',
    name: 'Garnish Music Production School',
    city: 'Global Hub',
    tagline: 'Online Music Production Education',
    accentColor: '#c0392b',
    accentColorHover: '#a93226',
    heroGradient: 'from-slate-950 via-slate-900 to-slate-950',
    heroImage: `${_CDN}/v1783689387/garnish-media/studio-hero-edu.jpg`,
  },
  tyo: {
    blogId: 18,
    subdomain: 'tyo',
    name: 'Garnish Music Production School',
    city: 'Tokyo',
    tagline: 'Music Production School | Tokyo',
    accentColor: '#c0392b',
    accentColorHover: '#a93226',
    heroGradient: 'from-slate-950 via-slate-900 to-slate-950',
    heroImage: `${_CDN}/v1783689928/garnish-media/studio-hero-tyo.jpg`,
  },
  sea: {
    blogId: 21,
    subdomain: 'sea',
    name: 'Garnish Music Production School',
    city: 'Seattle',
    tagline: 'Music Production School | Seattle',
    accentColor: '#c0392b',
    accentColorHover: '#a93226',
    heroGradient: 'from-slate-950 via-slate-900 to-slate-950',
    heroImage: `${_CDN}/v1783689928/garnish-media/studio-hero-sea.jpg`,
  },
  bcn: {
    blogId: 30,
    subdomain: 'bcn',
    name: 'Garnish Music Production School',
    city: 'Barcelona',
    tagline: 'Music Production School | Barcelona',
    accentColor: '#c0392b',
    accentColorHover: '#a93226',
    heroGradient: 'from-slate-950 via-slate-900 to-slate-950',
    heroImage: `${_CDN}/v1783689924/garnish-media/studio-hero-bcn.jpg`,
  },
  hou: {
    blogId: 33,
    subdomain: 'hou',
    name: 'Garnish Music Production School',
    city: 'Houston',
    tagline: 'Music Production School | Houston',
    accentColor: '#c0392b',
    accentColorHover: '#a93226',
    heroGradient: 'from-slate-950 via-slate-900 to-slate-950',
    heroImage: `${_CDN}/v1783689924/garnish-media/studio-hero-hou.jpg`,
  },
  syd: {
    blogId: 35,
    subdomain: 'syd',
    name: 'Garnish Music Production School',
    city: 'Sydney',
    tagline: 'Music Production School | Sydney',
    accentColor: '#c0392b',
    accentColorHover: '#a93226',
    heroGradient: 'from-slate-950 via-slate-900 to-slate-950',
    heroImage: `${_CDN}/v1783689928/garnish-media/studio-hero-syd.jpg`,
  },
  av: {
    blogId: 46,
    subdomain: 'av',
    name: 'Garnish AV',
    city: 'Audio/Visual',
    tagline: 'Audio & Visual Production',
    accentColor: '#c0392b',
    accentColorHover: '#a93226',
    heroGradient: 'from-slate-950 via-slate-900 to-slate-950',
    heroImage: `${_CDN}/v1783689923/garnish-media/studio-hero-av.webp`,
  },
  lis: {
    blogId: 48,
    subdomain: 'lis',
    name: 'Garnish Music Production School',
    city: 'Lisbon',
    tagline: 'Music Production School | Lisbon',
    accentColor: '#c0392b',
    accentColorHover: '#a93226',
    heroGradient: 'from-slate-950 via-slate-900 to-slate-950',
    heroImage: `${_CDN}/v1783689925/garnish-media/studio-hero-lis.jpg`,
  },
  sf: {
    blogId: 51,
    subdomain: 'sf',
    name: 'Garnish Music Production School',
    city: 'San Francisco',
    tagline: 'Music Production School | San Francisco',
    accentColor: '#c0392b',
    accentColorHover: '#a93226',
    heroGradient: 'from-slate-950 via-slate-900 to-slate-950',
    heroImage: `${_CDN}/v1783689928/garnish-media/studio-hero-sf.jpg`,
  },
  sg: {
    blogId: 54,
    subdomain: 'sg',
    name: 'Garnish Music Production School',
    city: 'Singapore',
    tagline: 'Music Production School | Singapore',
    accentColor: '#c0392b',
    accentColorHover: '#a93226',
    heroGradient: 'from-slate-950 via-slate-900 to-slate-950',
    heroImage: `${_CDN}/v1783689928/garnish-media/studio-hero-sg.jpg`,
  },
  pdx: {
    blogId: 55,
    subdomain: 'pdx',
    name: 'Garnish Music Production School',
    city: 'Portland',
    tagline: 'Music Production School | Portland',
    accentColor: '#c0392b',
    accentColorHover: '#a93226',
    heroGradient: 'from-slate-950 via-slate-900 to-slate-950',
    heroImage: `${_CDN}/v1783689927/garnish-media/studio-hero-pdx.jpg`,
  },
  mrb: {
    blogId: 56,
    subdomain: 'mrb',
    name: 'Garnish Music Production School',
    city: 'Marbella',
    tagline: 'Music Production School | Marbella',
    accentColor: '#c0392b',
    accentColorHover: '#a93226',
    heroGradient: 'from-slate-950 via-slate-900 to-slate-950',
    heroImage: `${_CDN}/v1783689926/garnish-media/studio-hero-mrb.jpg`,
  },
  bh: {
    blogId: 57,
    subdomain: 'bh',
    name: 'Garnish Music Production School',
    city: 'Bournemouth',
    tagline: 'Music Production School | Bournemouth',
    accentColor: '#c0392b',
    accentColorHover: '#a93226',
    heroGradient: 'from-slate-950 via-slate-900 to-slate-950',
    heroImage: `${_CDN}/v1783689924/garnish-media/studio-hero-bh.jpg`,
  },
};

// Get site config from hostname
export function getSiteFromHostname(hostname: string): SiteConfig {
  // Extract subdomain from hostname
  const parts = hostname.split('.');

  // For local development: localhost:3000 = main site
  if (hostname.startsWith('localhost') || hostname.startsWith('127.0.0.1')) {
    return SITES.www;
  }

  // For subdomains like la.garnishmusicproduction.com
  if (parts.length >= 3) {
    const subdomain = parts[0];
    if (SITES[subdomain]) {
      return SITES[subdomain];
    }
  }

  // Default to main site
  return SITES.www;
}

// Build WordPress API URL for a specific site (uses subdomain-based routing)
export function getApiUrlForSite(siteConfig: SiteConfig): string {
  const baseDomain = process.env.WORDPRESS_BASE_DOMAIN || 'garnishmusicproduction.com';
  if (siteConfig.subdomain === 'www' || siteConfig.blogId === 1) {
    return `https://www.${baseDomain}/wp-json`;
  }
  return `https://${siteConfig.subdomain}.${baseDomain}/wp-json`;
}

// Get all city sites (excluding utility sites)
export function getCitySites(): SiteConfig[] {
  const excludeSlugs = ['av', 'edu'];
  return Object.values(SITES).filter(s => !excludeSlugs.includes(s.subdomain));
}

/**
 * Utility to convert production multisite links to local localhost links in development mode.
 * e.g., https://la.garnishmusicproduction.com/courses/abc -> http://la.localhost:3000/courses/abc
 * or https://www.garnishmusicproduction.com/ -> http://localhost:3000/
 */
export function getLocalLink(url: string): string {
  // Check if we are running in development environment
  const isDev = process.env.NODE_ENV === 'development';
  
  if (!isDev) {
    return url;
  }

  // Keep dave-garnish and appu on relative local paths in development mode
  if (url.includes('dave-garnish')) {
    return '/courses/dave-garnish/';
  }
  if (url.includes('appu')) {
    return '/instructors/appu/';
  }

  try {
    if (url.startsWith('https://') && url.includes('garnishmusicproduction.com')) {
      const parsedUrl = new URL(url);
      const hostParts = parsedUrl.hostname.split('.');
      
      let subdomain = 'www';
      if (hostParts.length >= 3) {
        subdomain = hostParts[0];
      }
      
      const pathAndSearch = parsedUrl.pathname + parsedUrl.search + parsedUrl.hash;
      
      if (subdomain === 'www') {
        return `http://localhost:3000${pathAndSearch}`;
      } else {
        return `http://${subdomain}.localhost:3000${pathAndSearch}`;
      }
    }
  } catch {
    // return original url if parsing fails
  }
  return url;
}
