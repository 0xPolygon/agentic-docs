import { getPageImage, source } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/page';
import { notFound, redirect } from 'next/navigation';
import { getMDXComponents } from '@/mdx-components';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';

export default async function Page(props: PageProps<'/[[...slug]]'>) {
  const params = await props.params;
  const isRoot = !params.slug?.length;
  const slug = isRoot ? ['general'] : params.slug;
  const page = source.getPage(slug);
  if (!page) notFound();

  if (isRoot) redirect(page.url);

  const MDX = page.data.body;

  const isIndexPage = slug.join('/') === 'general';

  return (
    <DocsPage toc={isIndexPage ? [] : page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  const params = source.generateParams();
  if (!params.some((entry) => entry.slug?.length === 0)) {
    const first = params[0];
    params.push(
      ('lang' in (first ?? {})
        ? { slug: [], lang: first.lang }
        : { slug: [] }) as (typeof params)[number],
    );
  }
  return params;
}

export async function generateMetadata(
  props: PageProps<'/[[...slug]]'>,
): Promise<Metadata> {
  const params = await props.params;
  const slug = params.slug?.length ? params.slug : ['general'];
  const page = source.getPage(slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImage(page).url,
    },
  };
}
