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
│       ├── ROOT/                # Top-level pages (index, quickstart, concepts)
│       │   ├── nav.adoc
│       │   ├── pages/
│       │   └── images/          # ← Put ROOT-level screenshots here
│       │
│       ├── builder/             # Email builder documentation
│       │   ├── nav.adoc
│       │   ├── pages/
│       │   └── images/          # ← Put builder screenshots here
│       │
│       └── sdk/                 # SDK reference documentation
│           ├── nav.adoc
│           └── pages/
│
└── ui/
    └── supplemental-ui/
        ├── css          
        ├── img 
        ├── layouts           
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
| `ROOT` | `docs/modules/ROOT/` | Top-level pages — home, quickstart, concepts |
| `builder` | `docs/modules/builder/` | Email builder feature docs |
| `sdk` | `docs/modules/sdk/` | SDK and REST API reference |

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
