# Maildeno Docs

Official documentation site for [Maildeno](https://maildeno.com) — the visual email template builder with a powerful render API.

Built with [Antora](https://antora.org) and deployed to [Cloudflare Pages](https://pages.cloudflare.com).

---

## Table of contents

- [Project structure](#project-structure)
- [Local development](#local-development)
- [Writing documentation](#writing-documentation)
- [Adding images](#adding-images)
- [Deployment](#deployment)
- [Environment setup (CI/CD)](#environment-setup-cicd)
- [Custom domain](#custom-domain)
- [Troubleshooting](#troubleshooting)

---

## Project structure

```
maildeno-docs/
├── antora-playbook.yml          # Production build (pulls from GitHub)
├── antora-playbook-local.yml    # Local development build (reads from disk)
├── wrangler.toml                # Cloudflare Pages project config
├── package.json
│
├── .github/
│   └── workflows/
│       └── deploy.yml           # CI/CD: build + deploy on push to main
│
├── docs/
│   ├── antora.yml               # Component descriptor (name, version, nav)
│   └── modules/
│       ├── ROOT/                # index, quickstart, concepts, glossary,
│       │   │                    # troubleshooting, changelog
│       │   ├── nav.adoc
│       │   ├── pages/
│       │   └── images/
│       │
│       ├── opensource/          # @maildeno/editor and @maildeno/renderer
│       │   ├── nav.adoc
│       │   ├── pages/
│       │   └── images/
│       │
│       ├── builder/             # Hosted email builder
│       │   ├── nav.adoc
│       │   ├── pages/
│       │   └── images/
│       │
│       └── sdk/                 # SDK and REST API reference
│           ├── nav.adoc
│           └── pages/
│
└── ui/
    ├── ui-bundle.zip            # Base UI (layouts, site.css, site.js)
    └── supplemental-ui/         # Overlaid on top of the bundle
        ├── css/
        │   ├── brand.css        # ← Sage brand tokens. Overrides the bundle.
        │   ├── tabs.css         # ← Vendored from @asciidoctor/tabs
        │   └── highlight-tokens.css
        ├── js/
        │   ├── tabs.js          # ← Vendored from @asciidoctor/tabs
        │   └── docs-enhance.js  # ← Wraps tables in a scroll container
        ├── img/                 # logo.svg, logo-dark.svg, logo.png,
        │                        # favicon.png, favicon-64.png
        ├── layouts/
        │   └── default.hbs      # Page shell
        ├── _redirects           # Cloudflare Pages URL redirects
        └── _headers             # HTTP security headers
```

---

## Local development

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18 |
| npm | ≥ 9 |

### First-time setup

```bash
git clone https://github.com/maildeno/docs.git
cd docs
npm install
```

### Build and serve locally

```bash
# One command: build the site then open it at http://localhost:5000
npm run dev
```

This runs two steps:
1. `npm run build:local` — Antora reads content from your local filesystem (no network fetch from GitHub).
2. `npm run serve` — starts a local HTTP server at `http://localhost:5000` and opens your browser.

### Build only (no server)

```bash
npm run build:local
# Output: build/site/
```

### Live reload (manual workflow)

Antora doesn't have built-in watch mode. For faster iteration:

```bash
# Terminal 1 — keep the server running
npx http-server build/site -p 5000 -c-1

# Terminal 2 — rebuild after editing a page
npm run build:local
# Refresh your browser to see changes
```

Tip: Use a browser extension like [LiveReload](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei) or run `browser-sync` in proxy mode for automatic refreshes.

### Clean the build

```bash
npm run clean
```

---

## Writing documentation

Documentation is written in [AsciiDoc](https://asciidoc.org). Pages live under `docs/modules/<module>/pages/`.

### Modules

| Module | Path | Purpose |
|--------|------|---------|
| `ROOT` | `docs/modules/ROOT/` | Home, quickstart, concepts, glossary, troubleshooting, changelog |
| `opensource` | `docs/modules/opensource/` | `@maildeno/editor` and `@maildeno/renderer` — the MIT packages |
| `builder` | `docs/modules/builder/` | The hosted email builder |
| `sdk` | `docs/modules/sdk/` | Hosted SDK and REST API reference |

Each module has its own `nav.adoc`, and all four are listed in `docs/antora.yml`.
A page that exists but is not in a `nav.adoc` builds and is reachable by URL, but
never appears in the sidebar — that is the usual cause of a "missing" new page.

### Creating a new page

1. Create a `.adoc` file under the appropriate `pages/` directory.
2. Add a title and description:

```asciidoc
= Page Title
:description: One-sentence description for SEO.

Content starts here.
```

3. Add it to the module's `nav.adoc`:

```asciidoc
* xref:my-new-page.adoc[My New Page]
```

### Cross-referencing pages

```asciidoc
// Same module
xref:other-page.adoc[Link text]

// Different module
xref:builder:merge-tags.adoc[Merge Tags]
xref:sdk:javascript.adoc[JavaScript SDK]
```

### Code blocks with syntax highlighting

````asciidoc
[source,typescript]
----
const html = await client.renderHtml("template-id")
----
````

### Callouts

```asciidoc
NOTE: A tip or additional context.

TIP: A helpful hint.

WARNING: Something the user should be careful about.

CAUTION: A potentially destructive or irreversible action.

IMPORTANT: A critical piece of information.
```

### Tabs (multi-language examples)

```asciidoc
[tabs]
====
JavaScript::
+
[source,typescript]
----
const html = await client.renderHtml("id")
----

Python::
+
[source,python]
----
html = client.render_html("id")
----
====
```

---

## Adding images

Place images in the `images/` directory of the relevant module:

```
docs/modules/ROOT/images/        ← for ROOT pages
docs/modules/builder/images/     ← for builder pages
docs/modules/sdk/images/         ← for SDK pages
```

Reference them in `.adoc` files:

```asciidoc
// Image in the same module
image::my-screenshot.png[Alt text description,role=center,width=100%]

// Image from another module
image::builder:editor-canvas.png[Editor canvas,role=center,width=100%]
```

**Image naming convention:**

```
<module>-<feature>-<description>.png

Examples:
  canvas.png
  email-health.png
  merge-tag-detected.png
  vis-rule.png
```

---

## Branding

The site's colours live in **`ui/supplemental-ui/css/brand.css`**, which is loaded
*after* the UI bundle's `site.css` in `layouts/default.hbs`. Both files declare the
same CSS custom properties at the same specificity, so source order decides — which
means the bundle can be regenerated without losing the brand.

### Changing the accent colour

Edit the two accent blocks in `brand.css`:

```css
:root {                                   /* light mode */
  --color-accent:      #3f5e4a;
  --color-accent-h:    #33503e;
  --color-accent-bg:   #edf3ee;
}

[data-theme="maildeno_doc_v1"] {          /* dark mode */
  --color-accent:      #8fbb9c;
  --color-accent-h:    #a6cdb1;
  --color-accent-bg:   #16201a;
}
```

### The core tokens

| Token | Light | Dark |
|-------|-------|------|
| `--color-bg` | `#ffffff` | `#0f0f10` |
| `--color-text` | `#4b564e` | `hsla(0,0%,100%,.62)` |
| `--color-heading` | `#232b26` | `hsla(0,0%,100%,.92)` |
| `--color-accent` | `#3f5e4a` | `#8fbb9c` |
| `--color-code-bg` | `#0f0f10` | `#0a0a0b` |

Dark-mode text is a **translucent white**, not a fixed grey, so it composites
correctly over every surface step rather than matching only the base background.

`--color-heading` exists because the UI bundle points `h1`–`h5` and `<strong>` at
`--color-text`. Now that `--color-text` is the softer brand body colour, headings
need their own token or they flatten into the paragraph beneath them.

Then update the two `theme-color` meta tags in `layouts/default.hbs`.

> **The dark accent inverts, it does not darken.** A dark sage cannot reach a 4.5:1
> contrast ratio against a dark background at any usable saturation. If you change
> the brand colour, pick a *light tint* of the same hue for dark mode rather than
> nudging the original.

Every foreground/background pair in `brand.css` meets WCAG 2.1 AA, and the measured
ratios are noted in comments beside each token. Re-check them after any change.

### Logo and favicon

`ui/supplemental-ui/img/` holds `logo.svg`, `logo-dark.svg`, `logo.png`,
`favicon.png` and `favicon-64.png`. These override the equivalents inside
`ui-bundle.zip`.

**Two logo files, not one.** The light logo's wordmark is dark sage and is nearly
invisible on `#0f0f10`, so `logo-dark.svg` inverts it — light sage wordmark, light
icon block, dark glyph. Both are in the DOM and swapped with CSS, because a
`<picture>` with `prefers-color-scheme` would follow the OS setting rather than the
site's own theme toggle.

`favicon-64.png` is a square 64×64 render, referenced first in `default.hbs` —
browsers downscale a non-square source badly in a tab.

### Syntax highlighting

`css/highlight-tokens.css` owns every token colour. No highlight.js theme is loaded,
so this file is the only place code colours are defined. Each token clears 4.5:1
against both code backgrounds; `.hljs-comment` is deliberately quieter and carries an
italic style so it stays identifiable without relying on colour alone.

---

## Tabs

Multi-language examples use the `[tabs]` block from `@asciidoctor/tabs`.

**The syntax is strict.** The processor requires the block to contain **exactly one
description list**, with each item's content attached by a `+` continuation. Anything
else is silently passed through as a plain example block — no error, it just renders
as an inert list.

````asciidoc
[tabs]
====
JavaScript::
+
[source,typescript]
----
const html = await client.renderHtml("id")
----

Python::
+
[source,python]
----
html = client.render_html("id")
----
====
````

For a tab holding more than one block, wrap the content in an open block:

````asciidoc
[tabs]
====
JavaScript::
+
--
[source,typescript]
----
const html = await client.renderHtml("id")
----

NOTE: Load your API key from an environment variable.
--
====
````

Two things that do **not** work, and fail silently:

| Wrong | Why |
|-------|-----|
| `* Label` with an open block | Produces a ulist, not a dlist |
| `Label::` with no `+` before the content | The content becomes a sibling, not a child |

### Assets

The extension ships its own CSS and JS, but Antora's UI bundle has no way to pick
them up — so both are vendored into `ui/supplemental-ui/` and linked from
`layouts/default.hbs`:

- `css/tabs.css` — copied verbatim, so it can be re-copied on upgrade
- `js/tabs.js` — activates the tablist; without it every panel stays visible

`brand.css` loads after `tabs.css` and re-skins it onto the sage tokens, because the
upstream stylesheet hard-codes `#fff` and `#f5f5f5` and is invisible in dark mode.

To upgrade:

```bash
npm update @asciidoctor/tabs
cp node_modules/@asciidoctor/tabs/dist/css/tabs.css ui/supplemental-ui/css/tabs.css
cp node_modules/@asciidoctor/tabs/dist/js/tabs.js   ui/supplemental-ui/js/tabs.js
```

Re-add the provenance header to `tabs.css` afterwards, and check that the class names
`brand.css` targets (`.tablist`, `li.is-selected`, `.tabpanel`, `.tabs.is-loading`)
have not changed.

---

## Tables

**Do not write a rule that targets a bare `.tableblock`.** Asciidoctor puts that
class on the `<table>`, on every `<th>` and `<td>`, *and* on the `<p>` inside each
cell. A `display: block` on a bare `.tableblock` turns every cell into a block and
collapses the whole table into one stacked column.

Every table rule in `brand.css` is scoped to `table.tableblock` or to a specific
cell element for that reason.

The same trap catches `[.table-scroll]`: Asciidoctor generates **no wrapper element**
for tables, so that role lands on the `<table>` itself. `js/docs-enhance.js` inserts
a real `div.table-scroll-wrap` around each table, which is what makes horizontal
scrolling work without breaking the percentage widths in `<colgroup>`.

That script is a progressive enhancement — with JS disabled the tables still render
correctly, they just do not scroll on very narrow screens.

---

## Admonition labels

Asciidoctor emits `<i class="fa icon-note">` for the icon cell of a NOTE, TIP,
WARNING, CAUTION or IMPORTANT block. The UI bundle never loads Font Awesome, so that
cell rendered as roughly 70px of blank space beside every admonition.

`brand.css` replaces the glyph with a text label via `::after` and stacks it above
the content instead of beside it. To add a new admonition type, add a matching
`content` and `color` pair alongside the existing five.

---

## Versions and shared attributes

Package versions, runtime floors and URLs are AsciiDoc attributes defined **once** in
both playbooks, so a release means editing two files rather than every page:

```yaml
asciidoc:
  attributes:
    editor-version: '0.4.7'
    renderer-version: '0.2.0'
    js-sdk-version: '2.1.0'
    node-version: '20'
    api-base-url: 'https://api.maildeno.com'
    editor-repo: 'https://github.com/maildeno/editor'
```

Reference them in any page as `{editor-version}`, `{node-version}`, and so on.

> Keep `antora-playbook.yml` and `antora-playbook-local.yml` in sync. The local
> playbook reads from disk; the production one pulls from GitHub. A version bumped in
> only one will render differently in development than in production.

`attribute-missing: 'skip'` is set in both, so literal URL placeholders like
`/v1/sdk/template/{id}` render as written instead of warning on every build.

---

## Deployment

### Automatic (recommended)

Push to `main` to trigger a production deployment:

```bash
git add .
git commit -m "docs: update SDK error handling guide"
git push origin main
```

The [GitHub Actions workflow](.github/workflows/deploy.yml) will:
1. Install dependencies and build with Antora.
2. Deploy the `build/site/` output to Cloudflare Pages.
3. Post the deployment URL to the Actions run summary.

### Preview deployments (pull requests)

Open a pull request against `main`. The workflow deploys to a unique preview URL and posts it as a PR comment.

### Manual deploy from CLI

Install Wrangler and authenticate:

```bash
npm install -g wrangler
wrangler login
```

Build and deploy:

```bash
npm run build:local
wrangler pages deploy build/site --project-name=maildeno-docs
```

---

## Environment setup (CI/CD)

Add these to **GitHub → Settings → Secrets and variables → Actions**:

### Secrets (required)

| Secret | Where to find it |
|--------|-----------------|
| `CLOUDFLARE_API_TOKEN` | [Cloudflare Dashboard → My Profile → API Tokens](https://dash.cloudflare.com/profile/api-tokens) → **Create Token** → use the **Edit Cloudflare Workers** template, then add **Cloudflare Pages:Edit** permission. |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Dashboard → right-hand sidebar on the home page. |

### Variables (optional)

| Variable | Default | Description |
|----------|---------|-------------|
| `CF_PAGES_PROJECT_NAME` | `maildeno-docs` | Cloudflare Pages project name. |
| `GA_MEASUREMENT_ID` | _(empty)_ | Google Analytics 4 Measurement ID (e.g. `G-XXXXXXXXXX`). |

### Creating the Cloudflare Pages project (first time only)

Before the first deploy, create the Pages project:

```bash
wrangler pages project create maildeno-docs --production-branch=main
```

Or create it in the Cloudflare dashboard under **Workers & Pages → Create application → Pages**.

---

## Custom domain

1. In the Cloudflare dashboard, go to **Workers & Pages → maildeno-docs → Custom domains**.
2. Add `docs.maildeno.com`.
3. Follow the DNS instructions (add a CNAME pointing to your Pages deployment).

Uncomment and update the `routes` block in `wrangler.toml`:

```toml
[env.production]
routes = [
  { pattern = "docs.maildeno.com", custom_domain = true }
]
```

---

## Troubleshooting

### Antora build fails with "content source not found"

You are running `npm run build` (production playbook) locally. This playbook fetches content from GitHub. Use `npm run build:local` for local development.

### Changes not reflected after `npm run build:local`

The HTTP server serves cached files. Hard-refresh your browser (`Ctrl+Shift+R` / `Cmd+Shift+R`) or restart the server.

### "Module not found" or missing cross-references

Check that:
- The target page exists at the path used in the `xref:`.
- The module name in the `xref:` matches the directory name under `docs/modules/`.
- The nav file for the module is listed in `docs/antora.yml`.

### Cloudflare deployment fails with 401

The `CLOUDFLARE_API_TOKEN` secret is missing, expired, or lacks the **Cloudflare Pages:Edit** permission. Rotate it in the Cloudflare dashboard and update the GitHub secret.

### Images not showing on the deployed site

Confirm the image file exists in `docs/modules/<module>/images/` and is committed to git. Image references are case-sensitive.

---

## License

MIT
