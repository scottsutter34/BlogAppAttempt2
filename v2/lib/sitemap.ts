import { XMLParser } from 'fast-xml-parser';

export type SiteTarget = { loc: string; lastmod?: string };
export type SiteInventory = {
  all: SiteTarget[];
  pages: SiteTarget[];
  collections: SiteTarget[];
  products: SiteTarget[];
  blogs: SiteTarget[];
};

export async function parseSitemap(sitemapUrl: string): Promise<SiteInventory> {
  const res = await fetch(sitemapUrl, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch sitemap: ${res.status}`);
  const xml = await res.text();
  const parser = new XMLParser({ ignoreAttributes: false });
  const json = parser.parse(xml);

  let urls: SiteTarget[] = [];

  if (json.sitemapindex?.sitemap) {
    const children = Array.isArray(json.sitemapindex.sitemap) ? json.sitemapindex.sitemap : [json.sitemapindex.sitemap];
    for (const sm of children) {
      if (!sm.loc) continue;
      try {
        const r = await fetch(sm.loc, { cache: 'no-store' });
        if (!r.ok) continue;
        const x = await r.text();
        const j = parser.parse(x);
        if (j.urlset?.url) {
          const arr = Array.isArray(j.urlset.url) ? j.urlset.url : [j.urlset.url];
          for (const u of arr) urls.push({ loc: u.loc, lastmod: u.lastmod });
        }
      } catch {}
    }
  } else if (json.urlset?.url) {
    const arr = Array.isArray(json.urlset.url) ? json.urlset.url : [json.urlset.url];
    for (const u of arr) urls.push({ loc: u.loc, lastmod: u.lastmod });
  }

  urls = urls.filter(Boolean);

  const inv: SiteInventory = { all: urls, pages: [], collections: [], products: [], blogs: [] };
  urls.forEach(u => {
    const path = new URL(u.loc).pathname;
    if (path.includes('/collections/')) inv.collections.push(u);
    else if (path.includes('/products/')) inv.products.push(u);
    else if (path.includes('/blogs/')) inv.blogs.push(u);
    else inv.pages.push(u);
  });

  return inv;
}
