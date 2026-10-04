# SOLO PRIMUS · 凌霄

Personal website of Solo Primus (凌霄): essays on investing, AI, and self-improvement.
English is served at `/`, Chinese at `/zh/`.

I’m Dr. Solo Primus, Assistant Professor. The English slogan is “One person. Three levers. Unlimited upside.” The Chinese homepage uses its own voice: “独行有道 · 借力登高 · 凌霄无界”. The site is organized around investing, AI, and self-improvement.

## RSS and follow links

The feeds already belong to this website. Use these exact URLs in a reader or in the RSS links:

- English: `https://soloprimus.com/feed.xml`
- Chinese: `https://soloprimus.com/zh/feed.xml`

`node scripts/build.mjs` generates both feeds from `content/essays/`, including full article text, publication dates, and stable article URLs. Publish the generated XML with each update. No third-party RSS service or Substack feed URL is required. `_headers` serves both feeds as `application/rss+xml` with a five-minute cache.

All account URLs live in `SITE.links` in `content/site.mjs`. `SITE.socialPlatforms.en` and `.zh` control the footer lists. Every social entry uses a locally bundled platform logo, with its name in the tooltip and accessible label. A `null` URL without an available QR image renders a non-clickable icon with a small status dot and “Coming soon” / “即将开放” in its tooltip. Replace it with the real HTTPS account URL and rebuild to activate the link wherever it appears. For WeChat, use a working official-account landing page or article URL; do not invent an account URL.

`SITE.qrCodes` configures the supplied original QR images for WeChat, Douyin, and Xiaohongshu, bundled in `assets/images/social/`. An icon activates when its configured image exists at build time. Clicking it opens a keyboard-accessible dialog with the original image, account information where supplied, and a download link. Without JavaScript it opens the original image directly. Preserve the original pixels and colors rather than regenerating or retouching QR codes.

English homepage actions: Substack and X. Chinese homepage actions: Douyin and WeChat Official Account. The supplied account links are X (`https://x.com/thesoloprimus`), Substack (`https://substack.com/@soloprimus`), GitHub (`https://github.com/soloprimus`), and YouTube (`https://www.youtube.com/@SoloPrimus`).

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

Supported Markdown: `##`/`###` headings (three or more `##` headings add an “On this page” list), paragraphs, `**bold**`, `*italic*`, `==key sentence==` (brand highlight), `[links](https://…)`, `> quotes`, `-` and `1.` lists, `---` rules, local essay figures, and pipe tables with column alignment.

Store essay images under `assets/images/essays/<slug>/` and embed them with `![A descriptive caption](/assets/images/essays/<slug>/figure.png)`. Captions also provide alternative text. Images remain proportional, and wide tables scroll within the reading column on small screens. RSS image URLs are made absolute so figures work outside the website. Keep the original publication date and use the same slug for a complete English/Chinese pair; both the header and article byline link directly to the matching translation.

Node 22 or later is required for deployment tooling. The browser site uses no third-party runtime dependencies; Wrangler is a pinned development dependency.

## Visitor statistics

The visitor section is between the follow band and footer on English and Chinese pages. `assets/js/visitor-globe.js` reads the same-origin `/api/visitors` endpoint; counters are never initialized with fabricated numbers. Unavailable statistics show a clear status message, and missing geolocation produces no invented markers.

`workers/index.mjs` records successful HTML document requests in a SQLite-backed Durable Object. The same IP counts once per California calendar day (`America/Los_Angeles`, including daylight saving time) and once in the all-time total, shared by both language versions. Known bots, feeds, images, API reads, redirects and 404 responses do not increase the count. These are unique IP estimates, rather than an exact count of individual people: shared networks and changing IPs affect the result. Historical traffic is not backfilled; the interface displays the start date. The browser formats dates and update times using the API's reporting timezone. The switch from Beijing time on October 4, 2026 preserves existing records: all visits collected before the switch fall on October 4 in both timezones.

An object-private random HMAC key deduplicates IPs. Only hashes, daily totals and geographic aggregates are stored; the counter does not persist raw IPs, GPS positions, user agents or browsing histories. Cloudflare supplies IP-based city and region names at the edge. City aggregates use coordinates rounded to 0.1 degrees; when no city is available, coordinates are rounded to two-degree cells. IP geolocation can describe a VPN or network exit rather than a reader's actual city. Day-level deduplication and geographic rows are retained for 14 days; all-time hashes and aggregate totals persist across releases. There is no external IP lookup service or tracking cookie. Previously counted readers can add their city on a later visit without increasing either visitor count. Legacy geographic aggregates remain available until city data is collected.

The native Canvas globe loads its local Natural Earth geometry near the viewport, renders at 30 fps while visible, stops offscreen or in hidden tabs, and respects reduced motion. Its geography source and license are documented in `assets/data/README.md`.

Run `npm ci`, `npm test`, `npm run build`, and `npm run dev` to verify locally. Local development uses a separate storage namespace and may have placeholder edge geolocation; never seed production with local test visits.

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

Typography follows jamesclear.com: a classic serif for reading (Minion Pro there, Crimson Pro here) and a geometric sans for headings and navigation (Europa there, Figtree here). Chinese pages set reading text in 思源宋体 (Noto Serif SC) and headings in the system 黑体 (PingFang SC or Microsoft YaHei). The Chinese homepage slogan uses 思源宋体 in three lines, with a copper final line; its share card follows the same treatment. Emphasis inside Chinese reading text uses 黑体, and key sentences use a copper highlight.

The palette keeps the copper accent of the mountain mark on warm white, with a matching dark theme. The home page explains each topic with a small static diagram: an investment thesis card, an AI framework connecting technology, industry, and applications, and a practice loop grounded in human nature and biology. The mountain sculpture rises once when the page opens and then stays still, so no pause control is needed; it doesn't move at all when the system asks for reduced motion.

`assets/images/mountain-sculpture.webp` was generated for this project from the approved mountain-and-path logo. `assets/images/mountain-mark.svg` is the vector mark.

## Run locally

```sh
python -m http.server 8790
```

Open `http://localhost:8790`. Links use root-relative paths, so serve the repository root.

## Deployment

Cloudflare Workers Builds deploys the existing `soloprimus-com` Worker from this repository. Generated pages remain committed at the repository root. The checked-in `wrangler.jsonc` adds the statistics Worker, static-assets binding and durable-object migration; `npx wrangler deploy` creates the SQLite namespace on the first release and preserves it on later deployments.

Keep the Worker name and existing domain unchanged. `.assetsignore` excludes manuscripts, Worker source, tests, tools and development output from public assets. Never upload `.dev.vars`, credentials or local statistics databases. The public `/api/visitors` response uses `Cache-Control: no-store` so numbers cannot be frozen in the asset cache.

## Licenses

Figtree, Crimson Pro, and Noto Serif SC are self-hosted under the SIL Open Font License 1.1 (`assets/fonts/*/OFL.txt`). Social logos are bundled in `assets/icons/social.json` from Simple Icons (CC0 1.0), with WeChat Channels from Remix Icon (Apache 2.0) and Toutiao from ByteDance IconPark (Apache 2.0), via the Iconify collection. Source URLs are included for each logo; the corresponding licenses are in `assets/icons/LICENSE-*.txt`. Logos remain trademarks of their respective owners. The existing Bootstrap Icons license is retained in `assets/icons/LICENSE.txt`.
