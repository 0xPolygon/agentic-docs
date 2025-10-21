# Polygon Agentic Payments Documentation

Thanks for contributing! This repository contains the Polygon Payments docs,
built on Fumadocs + Next.js with a static export. The sections below walk
through the key workflows you’ll need.

## Project Structure

- `content/docs/**`: Markdown/MDX source for every doc page. Nested folders map
  directly to route segments (e.g. `content/docs/general/x402/intro.mdx` →
  `/general/x402/intro`).
- `content/docs/**/meta.json`: Optional metadata for ordering, titles, and tab
  configuration.
- `public/**`: Static assets served at the site root (e.g. images referenced in
  MDX). Subfolders supported. Reference images with this subfolder included in
  the path.
- `src/app/(docs)/`: App router layout + catch-all page that renders MDX via
  Fumadocs.
- `src/mdx-components.tsx`: Custom MDX component overrides (e.g. image sizing
  helper).

## Writing Content

1. Create a new `.mdx` file under `content/docs/…`.
2. Include frontmatter for `title` and `description` so metadata renders
   correctly.
3. Use standard MDX + React components (all Fumadocs UI components are
   available). Ideally, keep it standard MD so it's easily portable outside
   Fumadocs later.

### Sorting Pages (meta.json)

Each folder may contain a `meta.json` file that controls ordering and tab
behaviour. Example:

```json
// content/docs/general/x402/meta.json
{
  "title": "X402",
  "description": "Agentic payments tutorials",
  "root": true,
  "pages": ["intro", "how-it-works", "quickstart-buyers", "..."]
}
```

- `root: true` marks the folder as a **sidebar tab** entry (visible in the
  dropdown).
- `pages` is an ordered array of page basenames; use `"..."` to include
  remaining pages alphabetically after the listed items.

### Creating / Customising Tabs

1. Add `"root": true` to the folder’s `meta.json` to expose it as a tab.
2. Optional: provide `title` and `description` fields to control tab text.
3. Optional icons: update `src/app/(docs)/layout.tsx` and use the
   `sidebar.tabs.transform` hook. For example:

```tsx
// src/app/(docs)/layout.tsx (excerpt)
import { Globe } from 'lucide-react';

const docsOptions: DocsLayoutProps = {
  ...baseOptions(),
  tree: source.pageTree,
  sidebar: {
    tabs: {
      transform(option, node) {
        if (node.$id === 'general') {
          return { ...option, icon: <Globe /> };
        }
        return option;
      },
    },
  },
};
```

## Images

- Place assets under `public/` (e.g. `public/autopay/autopay1.png`). Reference
  them with absolute paths (`/autopay/autopay1.png`).
- For standard Markdown images, use `![](/path/to/image.png)`.
- To control width, switch to JSX and use the custom `<img>` support defined in `src/mdx-components.tsx`:

```mdx
<img src="/autopay/autopay3.png" alt="Screenshot" width="420px" />
```

`width` accepts a string (`"420px"`, `"60%"`) or a number (pixels).

## Local Development

1. Install dependencies: `bun install` (or `npm install`).
2. Start the dev server: `bun run dev` (or `npm run dev`). This runs Next.js
   with hot reloading.
3. The site is statically exported via `bun run build` followed by
   `bun run export` (the default build already handles export because
   `output: 'export'` is set in `next.config.mjs`).
4. Preview the static output by serving the `out/` directory:
   - `npx http-server out`
   - or `bunx serve out`

## Contribution Workflow

1. Branch from `main`.
2. Make content or configuration changes.
3. Run `bun run lint` to ensure formatting/rules pass.
4. Run `bun run build` (or `bun run build && bun run export`) to confirm the
   static build succeeds.
5. Commit and open a PR describing the changes (include screenshots for layout
   updates when relevant).

## Helpful Tips

- The docs layout lives in `src/app/(docs)/layout.tsx`. Adjust navigation, tabs,
  and banners there.
- Global typography/layout tweaks can be done in `src/app/global.css`.
- Search is configured to use Orama static mode in `src/components/search.tsx`;
  update this if you need custom filters or different engines.
- If you add new icons to tabs or navigation, use `lucide-react` (already
  installed) for consistency.

Thanks again for helping improve the Polygon Payments documentation!
