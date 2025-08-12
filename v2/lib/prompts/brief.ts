import type { LinkRule } from '../linkmap';
import { getProvider } from '../providers/llm';

export type Brief = {
  outline: { h2: string; h3?: string[] }[];
  entities: string[];
  faqs: { q: string; a: string }[];
  internalLinks: { anchor: string[]; url: string }[];
  wordcount: number;
  cta: 'none'|'inline'|'card';
};

function safeParseJSON<T>(text: string): T | null {
  try { return JSON.parse(text) as T; } catch {
    const m = text.match(/```json[\s\S]*?```/i) || text.match(/\{[\s\S]*\}/);
    if (m) { try { return JSON.parse(m[0].replace(/```json|```/g,'')) as T; } catch {} }
    return null;
  }
}

export async function makeBrief(params: {
  brand: any; cfg: any; linkMap: LinkRule[];
}): Promise<Brief> {
  const { brand, cfg, linkMap } = params;
  const providerName = (process.env.LLM_PROVIDER || '').toLowerCase();

  if (providerName === 'openai' || providerName === 'anthropic') {
    const prov = getProvider();
    const system = "You are a senior SEO strategist and technical editor. Return strict JSON only.";
    const prompt = `{
  "brand": ${JSON.stringify(brand.brand || brand.site)},
  "site": ${JSON.stringify(brand.site)},
  "tone": ${JSON.stringify(brand.tone || [])},
  "keyword": ${JSON.stringify(cfg.keyword)},
  "audience": ${JSON.stringify(cfg.audience)},
  "intent": ${JSON.stringify(cfg.intent)},
  "wordcount": ${JSON.stringify(cfg.wordcount)},
  "internalLinks": ${JSON.stringify(linkMap.map(m => ({ anchor: m.keywords, url: m.url })))}
}
Return JSON with keys: outline (array of {h2, h3[]}), entities[], faqs[{q,a}], internalLinks (as provided), wordcount (number), cta ("none"|"inline"|"card").`;

    const out = await prov.complete(prompt, { system, maxTokens: 2000 });
    const parsed = safeParseJSON<Brief>(out);
    if (parsed) return parsed;
  }

  const kw = (cfg.keyword || '').trim();
  const outline = [
    { h2: `Understanding ${kw}` , h3: ['What it means', 'Why it matters'] },
    { h2: `Key Factors that Impact ${kw}`, h3: ['Quality', 'Origin', 'Seasonality'] },
    { h2: `How to Choose a Provider`, h3: ['Criteria', 'Red flags'] },
    { h2: `Pricing & Contracts`, h3: ['Typical ranges', 'Negotiation tips'] },
    { h2: `FAQs` }
  ];
  const entities = [kw, 'sourcing', 'roaster', 'sustainability', 'cupping'];
  const faqs = [
    { q: `What is ${kw}?`, a: `${kw} refers to...` },
    { q: `How do I evaluate quality for ${kw}?`, a: `Look for...` }
  ];
  const internalLinks = linkMap.map(m => ({ anchor: m.keywords, url: m.url }));
  return { outline, entities, faqs, internalLinks, wordcount: cfg.wordcount || 1400, cta: cfg.cta || 'none' };
}
