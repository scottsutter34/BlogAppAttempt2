import type { Brief } from './brief';
import { getProvider } from '../providers/llm';

function paragraph(text: string){ return `<p>${text}</p>`; }

export type Draft = {
  meta: { title: string; description: string; slug: string };
  articleHtml: string;
  jsonld: string[];
};

function slugify(s: string){
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
}

function safeParseJSON<T>(text: string): T | null {
  try { return JSON.parse(text) as T; } catch {
    const m = text.match(/```json[\s\S]*?```/i) || text.match(/\{[\s\S]*\}/);
    if (m) { try { return JSON.parse(m[0].replace(/```json|```/g,'')) as T; } catch {} }
    return null;
  }
}

export async function writeDraft(params: { brief: Brief; cfg: any }): Promise<Draft> {
  const { brief, cfg } = params;
  const kw = cfg.keyword;
  const providerName = (process.env.LLM_PROVIDER || '').toLowerCase();

  if (providerName === 'openai' || providerName === 'anthropic') {
    const prov = getProvider();
    const system = "You write authoritative, conversion-minded long-form content. Return strict JSON only.";
    const prompt = `Follow this brief to create an expert article. Return JSON with keys: meta:{title,description,slug}, articleHtml (string; valid HTML inside <article> tags is fine), jsonld (array of JSON-LD strings).\nBrief JSON: ${JSON.stringify(brief)}\nConstraints: wordcount ${brief.wordcount}±15%, include internal link placeholders like [INTERNAL_LINK:anchor] where relevant, tone ${JSON.stringify(cfg.tone || ['professional'])}.`;

    const out = await prov.complete(prompt, { system, maxTokens: 4000 });
    const parsed = safeParseJSON<Draft>(out);
    if (parsed && parsed.meta?.title && parsed.articleHtml) {
      parsed.meta.slug = parsed.meta.slug || slugify(parsed.meta.title);
      return parsed;
    }
  }

  // Fallback stub
  const title = `${kw.charAt(0).toUpperCase()+kw.slice(1)}: The Complete Guide`;
  const description = `Everything you need to know about ${kw} — selection, pricing, and best practices.`;
  const slug = slugify(kw);
  const sections = brief.outline.map(sec => {
    let html = `<h2>${sec.h2}</h2>`;
    if (sec.h3 && sec.h3.length) {
      html += sec.h3.map(h3 => `<h3>${h3}</h3>${paragraph('Lorem ipsum content seeded for MVP. Replace with provider output.')}`).join('');
    } else if (/faq/i.test(sec.h2) && brief.faqs?.length) {
      html += brief.faqs.map(f => `<h3>${f.q}</h3>${paragraph(f.a)}`).join('');
    } else {
      html += paragraph('Lorem ipsum content seeded for MVP. Replace with provider output.');
    }
    return html;
  }).join('\n');

  const articleHtml = `
<h1>${title}</h1>
${paragraph('Intro paragraph that frames the topic, intent, and outcome for the reader.')}
${sections}
`;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": brief.faqs.map(f => ({"@type":"Question","name": f.q,"acceptedAnswer":{"@type":"Answer","text": f.a}}))
  };
  const jsonld = [JSON.stringify(articleLd)];
  if (brief.faqs?.length) jsonld.push(JSON.stringify(faqLd));

  return { meta: { title, description, slug }, articleHtml, jsonld };
}
