import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from 'fumadocs-mdx/config';
import { rehypeCode } from 'fumadocs-core/mdx-plugins';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// You can customise Zod schemas for frontmatter and `meta.json` here
// see https://fumadocs.dev/docs/mdx/collections
export const docs = defineDocs({
  docs: {
    schema: frontmatterSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkMath],
    // Reorder so KaTeX runs before Shiki highlighting.
    // Fumadocs' default pipeline inserts `rehypeCode` first.
    rehypePlugins(plugins) {
      const codeIdx = plugins.findIndex(
        (p) => Array.isArray(p) && p[0] === rehypeCode,
      );
      const code = codeIdx >= 0 ? plugins[codeIdx] : null;
      const rest = codeIdx >= 0 ? plugins.filter((_, i) => i !== codeIdx) : plugins;

      return [rehypeKatex, ...(code ? [code] : []), ...rest];
    },
  },
});
