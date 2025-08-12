import type { SiteInventory } from './sitemap';

export type LinkRule = { keywords: string[]; url: string };

export function buildLinkMap(inv: SiteInventory, overrides: LinkRule[] = []): LinkRule[] {
  const hubs: LinkRule[] = [];

  function findUrl(match: RegExp): string | undefined {
    const pool = [...inv.pages, ...inv.collections, ...inv.blogs];
    const hit = pool.find(t => match.test(t.loc));
    return hit?.loc;
  }

  const wholesaleUrl = findUrl(/wholesale/i);
  if (wholesaleUrl) hubs.push({ keywords: ['wholesale', 'wholesale coffee'], url: wholesaleUrl });

  const contactUrl = findUrl(/contact|connect/i);
  if (contactUrl) hubs.push({ keywords: ['contact', 'connect'], url: contactUrl });

  const subUrl = findUrl(/subscription|subscribe/i) || inv.collections.find(c => /subscription/i.test(c.loc))?.loc;
  if (subUrl) hubs.push({ keywords: ['subscription', 'coffee subscription'], url: subUrl });

  const collectionUrl = inv.collections[0]?.loc;
  if (collectionUrl) hubs.push({ keywords: ['coffee collection', 'whole bean coffee'], url: collectionUrl });

  const mapByUrl = new Map<string, LinkRule>();
  hubs.forEach(r => mapByUrl.set(r.url, r));
  overrides.forEach(o => mapByUrl.set(o.url, o));

  return Array.from(mapByUrl.values());
}
