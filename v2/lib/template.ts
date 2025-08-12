export function applyTemplate(params: {
  draft: { meta: { title: string; description: string }; articleHtml: string; jsonld: string[] };
}): string {
  const { draft } = params;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${draft.meta.title}</title>
  <meta name="description" content="${draft.meta.description}" />
  <style>
    :root{ --content-width:980px; --side-pad:clamp(24px,6vw,80px); --leading:1.7; }
    body{ margin:0; color:#0f1218; background:#fff; font:17px/var(--leading) system-ui,-apple-system,Segoe UI,Roboto,Inter,"Helvetica Neue",Arial,sans-serif; }
    .page{ max-width:var(--content-width); margin-inline:auto; padding:40px var(--side-pad) 64px; }
    .measure{ max-width:85ch; margin-inline:auto; }
    h1,h2,h3{ line-height:1.25; margin:1.2em 0 .5em; letter-spacing:-.01em; }
    h1{ font-size:clamp(32px,4.5vw,46px); }
    h2{ font-size:clamp(24px,3.4vw,34px); }
    h3{ font-size:clamp(20px,2.8vw,26px); }
    p{ margin:0 0 1.2em; }
    ul,ol{ padding-left:1.5rem; margin:0 0 1.2em; }
    li{ margin:.4em 0; }
    img{ max-width:100%; height:auto; display:block; margin:32px auto; }
    .rule{ border:0; border-top:1px solid #e5e7eb; margin:32px 0; }
    [dir]{ unicode-bidi:plaintext; }
  </style>
</head>
<body>
  <main class="page">
    <article class="measure" data-blog-article>
${draft.articleHtml}
    </article>
  </main>
  ${draft.jsonld.map(ld => `<script type="application/ld+json">${ld}</script>`).join('\n  ')}
</body>
</html>`;
}
