# Suitehive website and docs

The marketing site and documentation for [Suitehive](https://github.com/Suitehive/suitehive), the
open-source, self-hostable workspace (Mail, Calendar, Auth/SSO and Admin).

Built with [Astro](https://astro.build) and [Starlight](https://starlight.astro.build). The output is a
static site: no server, no third-party fonts, CDNs, analytics or trackers.

| Path | What it is |
|---|---|
| `/` | Landing page |
| `/features/mail/`, `/features/calendar/`, `/features/admin/` | Feature pages with real screenshots |
| `/self-hosting/`, `/roadmap/`, `/about/` | Marketing pages |
| `/docs/...` | Documentation (Starlight) |
| `/docs/api/auth/`, `/docs/api/mail/`, `/docs/api/calendar/` | API reference generated from the OpenAPI specs |

## Run it

You need Node 24. The site is its own npm project; it is **not** part of the workspace root's npm workspaces.

```sh
cd website
npm install
npm run dev        # http://localhost:5400
```

The API reference reads the OpenAPI specs from `../contracts/openapi/*.yaml`, so clone the
[contracts](https://github.com/Suitehive/contracts) repo next to this one (the normal workspace layout).

## Build

```sh
npm run build        # static site in dist/, plus the Pagefind search index
npm run check:links  # checks every internal link, anchor and asset in dist/
npm run preview      # serves dist/ on http://localhost:5400
```

`npm run build` fails on a broken docs link (via `starlight-links-validator`). Set `SITE_URL` to the
public URL before building for production, so canonical links, Open Graph tags and the sitemap are right:

```sh
SITE_URL=https://www.example.org npm run build
```

## Deploy

`dist/` is plain static files. Any static host works (GitHub Pages, Netlify, Cloudflare Pages, Caddy,
nginx). Serve `404.html` for missing pages. There is no deploy job yet; CI only builds.

## Project layout

```
src/
  pages/                 marketing pages (Astro)
  components/site/       nav, footer, screenshot frame, copy-command pill, architecture picture
  components/docs/       Starlight overrides (site title, header links)
  content/docs/docs/     documentation pages (MDX), one folder per sidebar section
  assets/screenshots/    real screenshots of the development build (optimized to AVIF/WebP at build)
  assets/brand/          approved marketing images and logos
  styles/marketing.css   marketing design tokens (warm paper, Outfit display, pastel cards)
  styles/docs.css        Starlight re-theme (cool slate, indigo accent, Geist + Outfit)
scripts/check-links.mjs  link checker for dist/
```

## Writing docs

- Each page starts with a one-line **What you'll learn** and ends with **Next steps**.
- Code blocks get a language and, for files, a `title="path/to/file"`.
- Use Starlight's `<Steps>`, `<Tabs syncKey="os">` (bash / PowerShell) and `<Aside>`.
- Diagrams are ```` ```mermaid ```` blocks (rendered in the browser, self-hosted).
- Internal links are absolute with a trailing slash: `/docs/admin/users/`.
- Only document what the code does. Mark planned features as "not available yet".

Sidebar order comes from `sidebar.order` in each page's frontmatter and the groups in `astro.config.mjs`.

## Screenshots

Screenshots in `src/assets/screenshots/` are taken from a running development stack with demo data
(1600×1000 at 2×). Retake them when the apps change, and keep them real: no mockups in the docs.

## CI

`.github/workflows/ci.yml` checks out this repo and `Suitehive/contracts` side by side, installs, builds
and runs the link checker. While the repos are private, add a repository secret
`CONTRACTS_READ_TOKEN` (a fine-grained token with read access to `Suitehive/contracts`).

## License

Not chosen yet, same as the rest of Suitehive.
