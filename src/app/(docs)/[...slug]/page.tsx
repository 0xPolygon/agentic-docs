import { getPageImage, source } from '@/lib/source';
import {
  getDocsGithubConfig,
  getDocsRepoFilePath,
  safeGetDocsGithubLastEditTime,
} from '@/lib/docs-github';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/mdx-components';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';

export default async function Page(props: PageProps<'/[...slug]'>) {
  const params = await props.params;
  const slug = params.slug;
  const page = source.getPage(slug);
  if (!page) notFound();

  const MDX = page.data.body;

  const github = getDocsGithubConfig();
  const repoFilePath = github ? getDocsRepoFilePath(page.path) : null;

  const lastUpdate =
    github && repoFilePath
      ? await safeGetDocsGithubLastEditTime(github, repoFilePath)
      : null;

  const editOnGithub =
    github && repoFilePath
      ? {
          owner: github.owner,
          repo: github.repo,
          sha: github.sha,
          path: repoFilePath,
        }
      : undefined;

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      editOnGithub={editOnGithub}
      lastUpdate={lastUpdate ?? undefined}
    >
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
  return source.generateParams().filter((entry) => entry.slug?.length);
}

export async function generateMetadata(
  props: PageProps<'/[...slug]'>,
): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImage(page).url,
    },
  };
}

