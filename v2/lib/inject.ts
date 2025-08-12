import { JSDOM } from 'jsdom';
import type { LinkRule } from './linkmap';

export function injectInternalLinks(html: string, linkMap: LinkRule[], opts: { cap: number, utm?: boolean }){
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const container = doc.querySelector('[data-blog-article]') || doc.querySelector('article') || doc.body;
  const CAP = Math.max(0, opts.cap || 0);
  const ADD_UTM = opts.utm ?? true;
  const UTM = '?utm_source=blog&utm_medium=internal&utm_campaign=auto_linker';

  const rules = linkMap.map(r => ({
    url: r.url,
    rx: r.keywords.map(k => new RegExp(`\\b${escapeRegex(k)}\\b`, 'i'))
  }));

  const sections: Element[][] = [];
  let current: Element[] = [];
  Array.from(container.children).forEach(el => {
    if (el.tagName === 'H2') {
      if (current.length) sections.push(current);
      current = [];
    } else {
      current.push(el as Element);
    }
  });
  if (current.length) sections.push(current);

  let made = 0;
  function process(blocks: Element[]){
    const forbidden = new Set(['A','BUTTON','SELECT','TEXTAREA','INPUT']);
    const isSkip = (n: Element) => forbidden.has(n.tagName) || !!n.closest('a,button,[role="button"],.no-autolink');
    const texts = blocks.flatMap(b => b.querySelectorAll ? Array.from(b.querySelectorAll('p, li')) : []);
    const mid = Math.floor(texts.length/2);
    const ordered = texts.slice(mid).concat(texts.slice(0, mid));

    ordered.forEach(node => {
      if (made >= CAP || isSkip(node)) return;
      let html = node.innerHTML;
      const linked: Record<string, boolean> = {};
      rules.forEach(rule => {
        if (made >= CAP || linked[rule.url]) return;
        rule.rx.some(rx => {
          if (made >= CAP) return true;
          if (rx.test(html)) {
            const href = rule.url + (ADD_UTM ? UTM : '');
            html = html.replace(rx, (m) => `<a href="${href}" class="internal-link" data-autolink="true">${m}</a>`);
            linked[rule.url] = true; made++; return true;
          }
          return false;
        });
      });
      node.innerHTML = html;
    });
  }

  sections.forEach(section => process(section));
  return dom.serialize();
}

function escapeRegex(s: string){ return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
