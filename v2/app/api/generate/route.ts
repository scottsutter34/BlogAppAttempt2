import { NextRequest, NextResponse } from 'next/server';
import { parseSitemap } from '@/lib/sitemap';
import { buildLinkMap } from '@/lib/linkmap';
import { makeBrief } from '@/lib/prompts/brief';
import { writeDraft } from '@/lib/prompts/draft';
import { applyTemplate } from '@/lib/template';
import { injectInternalLinks } from '@/lib/inject';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const brand = body.brand || {};
    const cfg = body.article || {};
    const overrides = body.overrides || [];
    const site = brand.site || '';
    const sitemapUrl = brand.sitemap_url || (site ? new URL('/sitemap.xml', site).toString() : '');
    if (!sitemapUrl) return NextResponse.json({ error: 'Missing site/sitemap_url' }, { status: 400 });

    const inv = await parseSitemap(sitemapUrl);
    const linkMap = buildLinkMap(inv, overrides);

    const brief = await makeBrief({ brand, cfg, linkMap });
    const draft = await writeDraft({ brief, cfg });

    let html = applyTemplate({ draft });
    html = injectInternalLinks(html, linkMap, { cap: (brand.link_policy?.max_internal ?? 6), utm: (brand.link_policy?.utm ?? true) });

    return NextResponse.json({ html, meta: draft.meta });
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
