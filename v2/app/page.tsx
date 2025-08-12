'use client';
import React from 'react';

type Meta = { title: string; description: string; slug: string };

export default function HomePage(){
  const [site, setSite] = React.useState('https://www.yieldcoffee.com');
  const [sitemapUrl, setSitemapUrl] = React.useState('');
  const [brandName, setBrandName] = React.useState('Yield Coffee Roasters');
  const [tone, setTone] = React.useState('formal, professional, forward-thinking');
  const [keyword, setKeyword] = React.useState('wholesale coffee beans');
  const [audience, setAudience] = React.useState('cafe owners, restaurateurs, wholesale buyers');
  const [intent, setIntent] = React.useState('informational');
  const [wordcount, setWordcount] = React.useState(1400);
  const [maxInternal, setMaxInternal] = React.useState(6);
  const [utm, setUtm] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string|null>(null);
  const [html, setHtml] = React.useState<string| null>(null);
  const [meta, setMeta] = React.useState<Meta | null>(null);

  async function onGenerate(e: React.FormEvent){
    e.preventDefault();
    setLoading(true); setError(null); setHtml(null);
    try {
      const brand = {
        brand: brandName, site,
        sitemap_url: sitemapUrl || undefined,
        tone: tone.split(',').map(s=>s.trim()).filter(Boolean),
        link_policy: { max_internal: maxInternal, utm }
      };
      const article = { keyword, audience, intent, wordcount, cta: 'none', cms: 'none', faq: true };
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand, article, overrides: [] })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setHtml(data.html); setMeta(data.meta);
    } catch (err:any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function downloadHtml(){
    if (!html) return;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (meta?.slug || 'article') + '.html';
    a.click();
  }

  return (
    <div style={{fontFamily:'Inter,system-ui,Arial', padding:'24px', maxWidth:1200, margin:'0 auto'}}>
      <h1 style={{fontSize:'28px', marginBottom:'12px'}}>SEO Blog Engine — Web</h1>
      <p style={{color:'#4b5563', marginBottom:24}}>Generate publish-ready SEO articles with internal links from your sitemap.</p>
      <form onSubmit={onGenerate} style={{display:'grid', gap:12, gridTemplateColumns:'1fr 1fr'}}>
        <div>
          <label>Site URL</label>
          <input value={site} onChange={e=>setSite(e.target.value)} required className="inp" />
        </div>
        <div>
          <label>Sitemap URL (optional)</label>
          <input value={sitemapUrl} onChange={e=>setSitemapUrl(e.target.value)} className="inp" placeholder="https://.../sitemap.xml" />
        </div>
        <div>
          <label>Brand Name</label>
          <input value={brandName} onChange={e=>setBrandName(e.target.value)} className="inp" />
        </div>
        <div>
          <label>Tone (comma-separated)</label>
          <input value={tone} onChange={e=>setTone(e.target.value)} className="inp" />
        </div>
        <div>
          <label>Primary Keyword</label>
          <input value={keyword} onChange={e=>setKeyword(e.target.value)} className="inp" required />
        </div>
        <div>
          <label>Audience</label>
          <input value={audience} onChange={e=>setAudience(e.target.value)} className="inp" />
        </div>
        <div>
          <label>Intent</label>
          <select value={intent} onChange={e=>setIntent(e.target.value)} className="inp">
            <option value="informational">Informational</option>
            <option value="transactional">Transactional</option>
          </select>
        </div>
        <div>
          <label>Target Wordcount</label>
          <input type="number" value={wordcount} onChange={e=>setWordcount(parseInt(e.target.value)||1200)} className="inp" />
        </div>
        <div>
          <label>Max Internal Links</label>
          <input type="number" value={maxInternal} onChange={e=>setMaxInternal(parseInt(e.target.value)||6)} className="inp" />
        </div>
        <div>
          <label>UTM Tagging</label><br/>
          <label style={{display:'inline-flex', alignItems:'center', gap:6}}>
            <input type="checkbox" checked={utm} onChange={e=>setUtm(e.target.checked)} />
            Enable
          </label>
        </div>
        <div style={{gridColumn:'1 / -1', display:'flex', gap:12, alignItems:'center'}}>
          <button disabled={loading} type="submit" className="btn">{loading ? 'Generating…' : 'Generate Article'}</button>
          {html && <button type="button" onClick={downloadHtml} className="btn secondary">Download HTML</button>}
          {meta && <span style={{color:'#6b7280'}}>Slug: <code>{meta.slug}</code></span>}
        </div>
      </form>

      {error && <div style={{marginTop:16, color:'#b91c1c'}}>Error: {error}</div>}

      {html && (
        <div style={{marginTop:24, display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
          <div>
            <h3>Preview</h3>
            <iframe style={{width:'100%', height:'70vh', border:'1px solid #e5e7eb', borderRadius:8}} srcDoc={html} />
          </div>
          <div>
            <h3>HTML</h3>
            <textarea readOnly value={html} style={{width:'100%', height:'70vh', fontFamily:'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize:12, border:'1px solid #e5e7eb', borderRadius:8, padding:12}} />
          </div>
        </div>
      )}

      <style jsx>{`
        label{ display:block; font-size:12px; color:#374151; margin-bottom:6px; }
        .inp{ width:100%; border:1px solid #e5e7eb; border-radius:10px; padding:10px 12px; font:inherit; }
        .inp:focus{ outline:none; border-color:#9ca3af; box-shadow:0 0 0 3px rgba(156,163,175,.25); }
        .btn{ background:#0f1218; color:#fff; padding:10px 16px; border-radius:999px; border:1px solid #0f1218; cursor:pointer; font-weight:600; }
        .btn.secondary{ background:#fff; color:#0f1218; }
        h3{ margin:16px 0 8px; }
      `}</style>
    </div>
  );
}
