# SoloPrimus · 独臻

Independent research for solo investors and creators: investing, AI, and self-media.

## Run locally

This is a static website. No dependency installation or build step is required.

```sh
python -m http.server 8765
```

Open `http://localhost:8765`. The deployed document root must be this repository root.

## Pages

- `index.html`: brand and research overview, animated hero and conceptual canvas illustrations.
- `dashboard.html`: category filters and two original educational reading samples.
- `pricing.html`: planned membership rates and a clearly disclosed pre-launch state.

The existing routes, section anchors, arrow logo, and planned $19/month and $190/year pricing are retained. The wordmark is now SoloPrimus; the Chinese name 独臻 expresses independent inquiry and the pursuit of excellence. Payment checkout, account registration, and member authorization are not implemented. Membership must not be advertised as available until a backend, payment integration, and legal policies are ready.

## Design and assets

The redesign uses Taste Skill and draws visual inspiration from the light surfaces, generous typography, warm accents, and looping graphics at https://llmquant.com/. Its code, visual asset, and brand copy are original to SoloPrimus; no reference-site logos or artwork are used.

`assets/images/solo-sculpture.webp` was generated for this project using OpenAI's built-in image generation tool. Brief: a single ascending S-like ribbon of ribbed amber glass and polished chrome on a light platinum background, with no lettering. It is animated in CSS. The research graphics are original conceptual canvas animations, not live market data, forecasts, or performance history.

Manrope is self-hosted; its SIL Open Font License is in `assets/fonts/OFL.txt`.

## Behavior

- Responsive layouts, a keyboard-operable mobile menu, native reading dialogs, and FAQ disclosures.
- Light and dark color themes. The selected preference is stored locally.
- Chinese is the default, with English, Japanese, Korean, and Spanish available in the header. All three pages, reading dialogs, metadata, and accessible labels are translated. Language choice persists locally; `?lang=zh-CN`, `en`, `ja`, `ko`, or `es` can explicitly select a language. The static HTML remains readable in Chinese without JavaScript.
- Translations are bundled in `assets/js/locales.js`; styles for language-specific typography and the selector are in `assets/css/locales.css`. No external translation service is contacted.
- A motion pause control and support for the operating system's reduced-motion preference.
- Canvas work is limited to visible sections and pauses in background tabs.
- No third-party scripts, analytics, trackers, or runtime API keys.

## Deployment

Push `main` to the hosting platform connected to this repository. No build command is necessary; publish the root directory. This repository does not configure an external hosting account, domain DNS, TLS, or payment credentials.
