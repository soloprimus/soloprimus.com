# SOLO PRIMUS · 凌霄

Personal website of Solo Primus (凌霄): essays on investing, AI, and self-improvement.
English is served at `/`, Chinese at `/zh/`.

Solo Primus is a professor with a PhD in economics and a seasoned investor. The English slogan is “One person. Three levers. Unlimited upside.” The Chinese site uses its own editorial voice: “独立思考，拓展人生的可能。” Both are organized around investing, AI, and self-improvement.

## RSS and follow links

The feeds already belong to this website. Use these exact URLs in a reader or in the RSS links:

- English: `https://soloprimus.com/feed.xml`
- Chinese: `https://soloprimus.com/zh/feed.xml`

`node scripts/build.mjs` generates both feeds from `content/essays/`, including full article text, publication dates, and stable article URLs. Publish the generated XML with each update. No third-party RSS service or Substack feed URL is required. `_headers` serves both feeds as `application/rss+xml` with a five-minute cache.

All account URLs live in `SITE.links` in `content/site.mjs`. `SITE.socialPlatforms.en` and `.zh` control the footer lists. A `null` URL displays “Coming soon” / “即将开放” as non-clickable text. Replace it with the real HTTPS account URL and rebuild to activate the link wherever it appears. For WeChat, use a working official-account landing page or article URL; do not invent an account URL. A QR code can be added when the real account is available.

English homepage actions: Substack and X. Chinese homepage actions: Douyin and WeChat Official Account. The current X URL is preserved from the latest site configuration (`https://x.com/veryzg`).

## Publish a new essay

1. Add a Markdown file to `content/essays/`, named `<slug>.zh.md` or `<slug>.en.md`. Use lowercase letters, digits, and hyphens in the slug. An English and a Chinese file with the same slug are linked as translations of each other.
2. Start it with front matter:

   ```md
   ---
   title: 投资一定要有升维思维
   summary: One or two sentences shown in lists, search results, and share cards.
   topic: investing        # investing | ai | growth (self-improvement)
   date: 2026-09-08
   featured: 1             # optional; lower numbers appear first in “Start here”
   note: Optional disclaimer shown under the essay.
   title_en: Optional English title, used to list a Chinese-only essay on the English site
   summary_en: Optional English summary for the same purpose
   ---
   ```

3. Build:

   ```sh
   node scripts/og.mjs      # share images in assets/og/ (needs Chrome or Edge; set CHROME_PATH if not found)
   node scripts/build.mjs   # regenerates every page, feed.xml, and sitemap.xml
   ```

4. Commit everything, including the generated HTML, and push `main`.

Supported Markdown: `##`/`###` headings (three or more `##` headings add an “On this page” list), paragraphs, `**bold**`, `*italic*`, `==key sentence==` (brand highlight), `[links](https://…)`, `> quotes`, `-` and `1.` lists, and `---` rules.

Node 18 or later is required. There are no npm dependencies.

## Layout

- `content/site.mjs`: pen names, links, and all interface copy in English and Chinese. Change a pen name here and rebuild.
- `content/essays/`: the essays.
- `scripts/build.mjs`, `scripts/markdown.mjs`: the static site generator.
- `scripts/og.mjs`: share images and `assets/apple-touch-icon.png`.
- `assets/css/site.css`, `assets/js/site.js`: styles, theme toggle, mobile menu, and essay filters.
- `assets/css/fonts.css`, `assets/fonts/`: self-hosted fonts.
- Generated output (listed in `scripts/generated-files.json`, don't edit by hand): `index.html`, `about/`, `essays/`, `zh/`, `404.html`, `feed.xml`, `zh/feed.xml`, `sitemap.xml`.
- `_redirects` sends the old `/dashboard` and `/pricing` URLs to `/essays/`. `_headers` sets long cache lifetimes for fonts and fingerprinted CSS and JS.

## Design

Typography follows jamesclear.com: a classic serif for reading (Minion Pro there, Crimson Pro here) and a geometric sans for headings and navigation (Europa there, Figtree here). Chinese pages set reading text in 思源宋体 (Noto Serif SC) and headings in the system 黑体 (PingFang SC or Microsoft YaHei). Emphasis inside Chinese reading text uses 黑体, and key sentences use a copper highlight.

The palette keeps the copper accent of the mountain mark on warm white, with a matching dark theme. The home page explains each topic with a small static diagram (a thesis card, a workflow time chart, a growth loop) instead of decorative animation. The mountain sculpture rises once when the page opens and then stays still, so no pause control is needed; it doesn't move at all when the system asks for reduced motion.

`assets/images/mountain-sculpture.webp` was generated for this project from the approved mountain-and-path logo. `assets/images/mountain-mark.svg` is the vector mark.

## Run locally

```sh
python -m http.server 8790
```

Open `http://localhost:8790`. Links use root-relative paths, so serve the repository root.

## Deployment

Static files only. Publish the repository root with no build command; the generated pages are committed.

## Licenses

Figtree, Crimson Pro, and Noto Serif SC are self-hosted under the SIL Open Font License 1.1 (`assets/fonts/*/OFL.txt`). The Substack and X icons come from Bootstrap Icons, MIT License (`assets/icons/LICENSE.txt`).
