// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';
import starlightOpenAPI, { openAPISidebarGroups } from 'starlight-openapi';
import starlightLinksValidator from 'starlight-links-validator';
import { existsSync } from 'node:fs';

// Keep sidebar slugs only when the page exists (lets the site build while sections are being written).
const page = (slug) =>
  ['.mdx', '.md'].some((ext) => existsSync(new URL(`./src/content/docs/${slug}${ext}`, import.meta.url))) ? [slug] : [];

// The public URL the site is deployed at. Used for canonical links, Open Graph and the sitemap.
const site = process.env.SITE_URL ?? 'https://suitehive.github.io';

export default defineConfig({
  site,
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  image: { responsiveStyles: false },
  // Mermaid is loaded only on pages with diagrams; its chunk is large by nature.
  vite: { build: { chunkSizeWarningLimit: 3000 } },
  integrations: [
    // Must come before Starlight so it can transform ```mermaid blocks.
    mermaid({ theme: 'neutral', autoTheme: true, enableLog: false }),
    starlight({
      title: 'Suitehive Docs',
      description:
        'Documentation for Suitehive, the open-source, self-hostable workspace: Mail, Calendar and single sign-on on your own server.',
      favicon: '/favicon.svg',
      head: [
        { tag: 'meta', attrs: { property: 'og:image', content: new URL('/og.png', site).href } },
        { tag: 'meta', attrs: { property: 'og:image:width', content: '1280' } },
        { tag: 'meta', attrs: { property: 'og:image:height', content: '640' } },
        { tag: 'meta', attrs: { name: 'twitter:image', content: new URL('/og.png', site).href } },
      ],
      disable404Route: true,
      lastUpdated: false,
      pagination: true,
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/Suitehive' }],
      customCss: [
        '@fontsource-variable/geist',
        '@fontsource-variable/geist-mono',
        '@fontsource-variable/outfit',
        './src/styles/docs.css',
      ],
      components: {
        SiteTitle: './src/components/docs/SiteTitle.astro',
        SocialIcons: './src/components/docs/SocialIcons.astro',
      },
      expressiveCode: {
        themes: ['github-light', 'github-dark-dimmed'],
        useStarlightUiThemeColors: false,
        styleOverrides: {
          borderRadius: '14px',
          borderColor: 'var(--sh-border)',
          codeFontFamily: "'Geist Mono Variable', ui-monospace, monospace",
          codeFontSize: '0.84rem',
          codeLineHeight: '1.65',
          uiFontFamily: "'Geist Variable', system-ui, sans-serif",
          frames: {
            shadowColor: 'transparent',
            editorActiveTabIndicatorTopColor: 'transparent',
            frameBoxShadowCssValue: 'none',
          },
        },
      },
      plugins: [
        starlightOpenAPI([
          { base: 'docs/api/auth', schema: '../contracts/openapi/auth.yaml', sidebar: { label: 'Auth API' } },
          { base: 'docs/api/mail', schema: '../contracts/openapi/mail.yaml', sidebar: { label: 'Mail API' } },
          { base: 'docs/api/calendar', schema: '../contracts/openapi/calendar.yaml', sidebar: { label: 'Calendar API' } },
        ]),
        starlightLinksValidator({ errorOnRelativeLinks: true, errorOnLocalLinks: false, exclude: ['/', '/docs/api/**', '/features/**', '/self-hosting', '/self-hosting/', '/roadmap', '/roadmap/', '/about', '/about/'] }),
      ],
      sidebar: [
        { label: 'Start here', items: [{ label: 'Docs home', link: '/docs/' }] },
        { label: 'Getting started', items: [{ autogenerate: { directory: 'docs/getting-started' } }] },
        {
          label: 'User guide',
          items: [
            { label: 'Mail', collapsed: true, items: [{ autogenerate: { directory: 'docs/user-guide/mail' } }] },
            { label: 'Calendar', collapsed: true, items: [{ autogenerate: { directory: 'docs/user-guide/calendar' } }] },
            ...page('docs/user-guide/account'),
            ...page('docs/user-guide/connecting-apps'),
          ],
        },
        { label: 'Admin guide', collapsed: true, items: [{ autogenerate: { directory: 'docs/admin' } }] },
        { label: 'Self-hosting', collapsed: true, items: [{ autogenerate: { directory: 'docs/self-hosting' } }] },
        { label: 'Architecture', collapsed: true, items: [{ autogenerate: { directory: 'docs/architecture' } }] },
        {
          label: 'Developers',
          collapsed: true,
          items: [
            ...page('docs/developers/first-15-minutes'),
            ...page('docs/developers/how-it-fits'),
            ...page('docs/developers/local-environment'),
            ...page('docs/developers/repo-map'),
            { label: 'Concepts', items: [{ autogenerate: { directory: 'docs/developers/concepts' } }] },
            { label: 'Recipes', items: [{ autogenerate: { directory: 'docs/developers/recipes' } }] },
            ...page('docs/developers/testing'),
            ...page('docs/developers/coding-principles'),
            ...page('docs/developers/contributing'),
            ...page('docs/developers/api-reference'),
            ...page('docs/developers/glossary'),
          ],
        },
        { label: 'API reference', collapsed: true, items: openAPISidebarGroups },
        { label: 'Project', items: [...page('docs/faq'), ...page('docs/roadmap'), ...page('docs/changelog')] },
      ],
    }),
  ],
});
