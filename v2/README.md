# SEO Blog Engine — Web App (Next.js)

Generate publish-ready SEO articles (HTML + JSON-LD) with internal links from your sitemap, in a browser.

## Quickstart

```bash
npm i
npm run dev
# open http://localhost:3000
```

### Optional: LLM Provider
Set env vars in `.env.local` (copy from `.env.example`):
- `LLM_PROVIDER=openai` with `OPENAI_API_KEY`
- or `LLM_PROVIDER=anthropic` with `ANTHROPIC_API_KEY`

If unset, the app uses deterministic stubs.

### Optional: Publishers
Environment variables are scaffolded for Shopify/WordPress. The `/api/publish` route is a stub in this MVP.

## What it does
- Fetches your sitemap
- Builds a keyword→URL internal link map
- Generates a brief + draft (LLM or stub)
- Wraps it in a standardized HTML template
- Injects internal links per H2 section
- Shows live preview and lets you download the HTML
