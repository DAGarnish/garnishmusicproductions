// src/lib/wordpress.ts

/**
 * Builds the WordPress REST API base URL for a given subdomain.
 *
 * - In development (no WORDPRESS_BASE_DOMAIN set): uses localhost:8080 for
 *   the main site only. All subsite content is fetched from the LIVE production
 *   API because WordPress Multisite subdomain routing does not resolve on localhost.
 *
 * - In production (Vercel): constructs https://{subdomain}.{WORDPRESS_BASE_DOMAIN}/wp-json
 *   for every subsite automatically.
 */
export function getApiUrl(subdomain: string = 'www'): string {
  const baseDomain = process.env.WORDPRESS_BASE_DOMAIN || 'garnishmusicproduction.com';

  // Always use the live production API (works for both local dev & production)
  // because WordPress Multisite subdomain URLs cannot resolve on localhost.
  if (subdomain === 'www' || subdomain === '') {
    return `https://www.${baseDomain}/wp-json`;
  }

  return `https://${subdomain}.${baseDomain}/wp-json`;
}

// General WordPress Post/Page Interface
export interface WordPressPost {
  id: number;
  date: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  featured_media: number;
  price?: string; // For WooCommerce products
  regular_price?: string;
  sale_price?: string;
  acf?: Record<string, any>;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text: string;
      media_details?: {
        sizes?: Record<string, { source_url: string; width: number; height: number }>;
      };
    }>;
    'author'?: Array<{
      name: string;
      avatar_urls?: Record<string, string>;
    }>;
    'wp:term'?: Array<Array<{
      id: number;
      name: string;
      slug: string;
      taxonomy: string;
    }>>;
  };
}

// Utility to resolve any image or upload path to Cloudinary / live CDN when local files are not present
export function resolveImageUrl(urlOrPath: string | undefined | null): string | null {
  if (!urlOrPath || typeof urlOrPath !== 'string' || urlOrPath.trim() === '') return null;

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || 's7pus8t5';

  // Already a full Cloudinary URL — pass through unchanged (handles garnish-media and garnish-uploads DB URLs)
  if (urlOrPath.startsWith('https://res.cloudinary.com/')) {
    return urlOrPath;
  }

  // Any other full http/https URL — pass through as-is
  if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
    return urlOrPath;
  }

  // Local /media/ folder or /studio-hero paths → garnish-media (campus hero images)
  if (urlOrPath.startsWith('/media/')) {
    const filename = urlOrPath.replace(/^\/media\//, '');
    return `https://res.cloudinary.com/${cloudName}/image/upload/garnish-media/${filename}`;
  }
  if (urlOrPath.startsWith('/studio-hero')) {
    const filename = urlOrPath.replace(/^\//, '');
    return `https://res.cloudinary.com/${cloudName}/image/upload/garnish-media/${filename}`;
  }

  // local-hero/ db wp_upload_path pattern → garnish-media
  if (urlOrPath.startsWith('local-hero/')) {
    const filename = urlOrPath.replace('local-hero/', '');
    return `https://res.cloudinary.com/${cloudName}/image/upload/garnish-media/${filename}`;
  }

  // WordPress /uploads/ paths → garnish-uploads (user's Cloudinary upload folder)
  if (urlOrPath.startsWith('/uploads/')) {
    const relativePath = urlOrPath.replace(/^\/uploads\//, '');
    return `https://res.cloudinary.com/${cloudName}/image/upload/garnish-uploads/${relativePath}`;
  }

  // Raw wpUploadPath patterns (e.g., '2018/03/foo.jpg' or 'sites/2/2019/01/bar.png') → garnish-uploads
  if (/^(sites\/\d+\/)?\d{4}\/\d{2}\//.test(urlOrPath)) {
    return `https://res.cloudinary.com/${cloudName}/image/upload/garnish-uploads/${urlOrPath.replace(/^\//, '')}`;
  }

  // Full wp-content/uploads URL from any domain → garnish-uploads
  const wpMatch = urlOrPath.match(/[\/a-zA-Z0-9.:_-]*\/wp-content\/uploads\/(.+)/i);
  if (wpMatch && wpMatch[1]) {
    return `https://res.cloudinary.com/${cloudName}/image/upload/garnish-uploads/${wpMatch[1].split('?')[0]}`;
  }

  return urlOrPath;
}


// Utility to resolve featured image source URL from embedded data
export function getFeaturedImage(post: WordPressPost, size: string = 'full'): { url: string; alt: string } | null {
  const media = post._embedded?.['wp:featuredmedia']?.[0];
  if (!media) return null;

  const rawUrl = media.media_details?.sizes?.[size]?.source_url || media.source_url;
  const url = resolveImageUrl(rawUrl) || rawUrl;
  const alt = media.alt_text || post.title.rendered;

  return { url, alt };
}

// Utility to resolve author name
export function getAuthorName(post: WordPressPost): string {
  return post._embedded?.['author']?.[0]?.name || 'Admin';
}

// Utility to resolve terms (categories, tags, custom taxonomies)
export function getTerms(post: WordPressPost, taxonomy: string = 'category') {
  const termGroups = post._embedded?.['wp:term'] || [];
  for (const group of termGroups) {
    const match = group.filter(t => t.taxonomy === taxonomy);
    if (match.length > 0) return match;
  }
  return [];
}

/**
 * Fetch a collection of posts/pages/CPTs from the WordPress REST API for a specific subdomain.
 *
 * Resilience strategy:
 * - On 5xx (server error from WordPress): retry once WITHOUT _embed, since WordPress
 *   sometimes throws a 500 when _embed tries to resolve a broken media attachment.
 * - On 4xx or any network failure: log a warning and return [] — never crash the page.
 */
export async function getCollection(
  subdomain: string,
  endpoint: string,
  queryParameters: Record<string, string | number> = {}
): Promise<WordPressPost[]> {
  const apiUrl = getApiUrl(subdomain);

  const buildUrl = (withEmbed: boolean): string => {
    const params = new URLSearchParams();
    if (withEmbed) params.append('_embed', '1');
    Object.entries(queryParameters).forEach(([key, val]) => {
      params.append(key, String(val));
    });
    return `${apiUrl}/wp/v2/${endpoint}?${params.toString()}`;
  };

  const attemptFetch = async (url: string): Promise<WordPressPost[] | null> => {
    try {
      const res = await fetch(url, {
        next: { revalidate: 60 },
      });

      if (res.ok) {
        return await res.json();
      }

      // 5xx = WordPress server error — caller will retry without _embed
      if (res.status >= 500) {
        console.warn(`[WP API] ${res.status} from ${url} — will retry without _embed`);
        return null;
      }

      // 4xx = genuinely not found or forbidden — no point retrying
      console.warn(`[WP API] ${res.status} from ${url} — skipping`);
      return [];
    } catch (err) {
      console.warn(`[WP API] Network error fetching ${url}:`, err);
      return [];
    }
  };

  // First attempt: with _embed for rich data (featured images, terms, author)
  const withEmbed = await attemptFetch(buildUrl(true));
  if (withEmbed !== null) return withEmbed;

  // Second attempt: without _embed (avoids WordPress 500s on broken media)
  console.warn(`[WP API] Retrying ${endpoint} on "${subdomain}" without _embed`);
  const withoutEmbed = await attemptFetch(buildUrl(false));
  return withoutEmbed ?? [];
}


/**
 * Fetch a single post/page/CPT by its slug for a specific subdomain
 */
export async function getSingleBySlug(
  subdomain: string,
  endpoint: string,
  slug: string
): Promise<WordPressPost | null> {
  try {
    const posts = await getCollection(subdomain, endpoint, { slug });
    if (posts && posts.length > 0) {
      return posts[0];
    }
    return null;
  } catch (error) {
    console.error(`Error in getSingleBySlug for subdomain "${subdomain}", endpoint "${endpoint}", and slug "${slug}":`, error);
    return null;
  }
}

/**
 * High-level helper: Fetch posts list
 */
export async function getPosts(subdomain: string, limit: number = 10, page: number = 1): Promise<WordPressPost[]> {
  return getCollection(subdomain, 'posts', { per_page: limit, page });
}

/**
 * High-level helper: Fetch single post
 */
export async function getPostBySlug(subdomain: string, slug: string): Promise<WordPressPost | null> {
  return getSingleBySlug(subdomain, 'posts', slug);
}

/**
 * High-level helper: Fetch single page
 */
export async function getPageBySlug(subdomain: string, slug: string): Promise<WordPressPost | null> {
  return getSingleBySlug(subdomain, 'pages', slug);
}

/**
 * High-level helper: Fetch WooCommerce products
 */
export async function getProducts(subdomain: string, limit: number = 20): Promise<WordPressPost[]> {
  // WooCommerce products are exposed via /wp/v2/product custom post type in standard WP REST configuration
  // or /wc/v3/products if using the WooCommerce REST API. For headless setups, custom post type product is easiest.
  return getCollection(subdomain, 'product', { per_page: limit });
}

/**
 * High-level helper: Fetch WooCommerce product by slug
 */
export async function getProductBySlug(subdomain: string, slug: string): Promise<WordPressPost | null> {
  return getSingleBySlug(subdomain, 'product', slug);
}
