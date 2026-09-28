# SoloPrimus · 元臻

Independent research for solo investors and creators: investing, AI, and self-media.

## Run locally

This is a static website. No dependency installation or build step is required.

```sh
python -m http.server 8765
```

Open `http://localhost:8765`. The deployed document root must be this repository root.

## Pages

- `index.html`: brand and research overview, animated hero and conceptual canvas illustrations.
- `dashboard.html`: category filters and two original educational articles, freely accessible.
- `pricing.html`: legacy redirect to the free research library; no plans or payment interface.

All published articles, research, and resources are free. No account or payment is required. Resources not yet written are clearly marked as in preparation and will also be free on release. The approved mountain-and-path logo is retained. The wordmark is SoloPrimus; the Chinese name is 元臻.

## Design and assets

The redesign uses Taste Skill and draws visual inspiration from the light surfaces, generous typography, warm accents, and looping graphics at https://llmquant.com/. Its code, visual asset, and brand copy are original to SoloPrimus; no reference-site logos or artwork are used.

`assets/images/mountain-mark.svg` is the production vector rendition of the client-approved mountain and S-shaped path. Header and footer use the same two filled paths; `assets/favicon.svg` opens the narrow channel slightly for small sizes and adapts its color to the browser theme.

`assets/images/mountain-sculpture.webp` is the dimensional hero, generated for this project with OpenAI's built-in image generation tool from the approved logo. Its transparent platinum faces and copper edges are animated with a slow rise and a clipped studio highlight. Motion pauses together with the page's control, outside the viewport, in hidden tabs, and under the system reduced-motion preference. The research graphics remain original conceptual canvas animations, not live market data, forecasts, or performance history.

PT Serif is used for English and Spanish editorial headings and reading copy; Montserrat is used for navigation and controls, following the reference site's font pairing. Japanese and Korean use writing-system-specific type stacks and spacing. All Latin fonts are self-hosted; licenses are included in `assets/fonts`. The original Manrope font remains available to the base design. Social icons are from Bootstrap Icons, with their license in `assets/icons`.

## Behavior

- Responsive layouts, a keyboard-operable mobile menu, native reading dialogs, and FAQ disclosures.
- Light and dark color themes. The selected preference is stored locally.
- English is the default. The selector order is English, Chinese, Japanese, Korean, Spanish. The English, Japanese, Korean, and Spanish brand copy is independently adapted to each language rather than translating the Chinese name's etymology. All three pages, reading dialogs, metadata, and accessible labels are localized. Language choice persists locally; `?lang=en`, `zh-CN`, `ja`, `ko`, or `es` can explicitly select a language. Static HTML remains readable in English without JavaScript.
- All membership and payment-plan interfaces and copy have been removed in every language. GitHub links to `https://github.com/soloprimus`; Discord is a disabled coming-soon entry.
- The Substack panel links to the supplied profile `https://substack.com/@soloprimus`. It does not collect email addresses or claim to submit subscriptions. A publication embed URL has not been supplied.
- Footer icons appear in this order: Facebook, GitHub, X, Discord, LinkedIn. X links to `https://x.com/veryzs`. Facebook, Discord, and LinkedIn are visibly disabled pending real destinations.
- Translations are bundled in `assets/js/locales.js`; styles for language-specific typography and the selector are in `assets/css/locales.css`. No external translation service is contacted.
- A motion pause control and support for the operating system's reduced-motion preference.
- Canvas work is limited to visible sections and pauses in background tabs.
- No third-party scripts, analytics, trackers, or runtime API keys.

## Deployment

The user authorized publishing the free-access revision on 2026-09-28. `assets/css/editorial.css` contains its typography and Substack/social layout; the approved mountain sculpture and animation are retained. The Substack panel is a follow link, independent of site access.

Push `main` to the hosting platform connected to this repository. No build command is necessary; publish the root directory. This repository does not configure an external hosting account, domain DNS, TLS, or payment credentials.
