import { baseOptions } from '@/lib/layout.shared';
import { source } from '@/lib/source';
import { cn } from '@/lib/cn';
import { getSidebarTabs } from 'fumadocs-ui/utils/get-sidebar-tabs';
import { Banknote, ExternalLink, Smartphone } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Polygon Knowledge Layer',
  description:
    'Technical documentation and knowledge resources for Polygon protocols and scaling technologies.',
};

type LandingItem = {
  title: React.ReactNode;
  description?: React.ReactNode;
  url: string;
  external?: boolean;
  icon?: React.ReactNode;
};

function getLandingItems(): LandingItem[] {
  const tabs = getSidebarTabs(source.pageTree, {
    transform(option, node) {
      switch (node.$id) {
        case 'general':
          return { ...option, icon: <Banknote /> };
        case 'flutter':
          return { ...option, icon: <Smartphone /> };
        default:
          return option;
      }
    },
  });

  const externals: LandingItem[] = [
    {
      title: 'Agglayer',
      description: 'Interoperability docs',
      url: 'https://docs.agglayer.dev/',
      external: true,
      icon: <ExternalLink />,
    },
    {
      title: 'CDK',
      description: 'Agglayer CDK docs',
      url: 'https://docs.agglayer.dev/cdk/',
      external: true,
      icon: <ExternalLink />,
    },
  ];

  return [
    ...tabs.map((t) => ({
      title: t.title,
      description: t.description,
      url: t.url,
      icon: t.icon,
    })),
    ...externals,
  ];
}

function LandingCard({ item }: { item: LandingItem }) {
  const cardClass =
    'group rounded-2xl border bg-fd-card p-5 transition-colors hover:bg-fd-accent';

  const content = (
    <>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0 text-fd-muted-foreground group-hover:text-fd-foreground">
          {item.icon ?? <ExternalLink className="size-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-base font-semibold text-fd-foreground">
                {item.title}
              </div>
              {item.description ? (
                <div className="mt-1 text-sm text-fd-muted-foreground">
                  {item.description}
                </div>
              ) : null}
            </div>
            <div className="pt-0.5 text-fd-muted-foreground group-hover:text-fd-foreground">
              {item.external ? '↗' : '→'}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  if (item.external) {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noreferrer"
        className={cardClass}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={item.url} className={cardClass}>
      {content}
    </Link>
  );
}

export default function HomePage() {
  const opts = baseOptions();
  const items = getLandingItems();
  const headerLinks = (opts.links ?? []).filter(
    (l): l is { url: string; text: React.ReactNode } =>
      typeof (l as { url?: unknown }).url === 'string',
  );

  return (
    <div className="min-h-dvh bg-fd-background text-fd-foreground">
      <header className="sticky top-0 z-20 border-b bg-fd-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex items-center">{opts.nav?.title}</span>
          </Link>

          <nav className="hidden items-center gap-4 md:flex">
            {headerLinks.map((l) => (
              <a
                key={l.url}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-fd-muted-foreground hover:text-fd-foreground"
              >
                {l.text}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 md:py-14">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              The Polygon Knowledge Layer
            </h1>
            <div className="mt-4 text-lg text-fd-muted-foreground">
              Welcome to the technical documentation and knowledge resources for
              Polygon protocols and scaling technologies.
            </div>
            <div className="mt-3 text-lg text-fd-muted-foreground">
              Choose a context to get started.
            </div>

            <div className="mt-5 text-sm text-fd-muted-foreground">
              See also:{' '}
              <a
                href="https://polygon.technology/blog/polygon-payments-101-a-guide-to-building-payments-on-polygon"
                className="underline underline-offset-4 hover:text-fd-foreground"
              >
                Polygon Payments 101
              </a>
            </div>
          </div>

          <div className="hidden md:block">
            <img
              src="/main-img.svg"
              alt=""
              className={cn(
                'mx-auto w-full max-w-md rounded-2xl border bg-fd-card object-cover',
              )}
            />
          </div>
        </div>

        <section className="mt-10 md:mt-14">
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((item) => (
              <LandingCard key={item.url} item={item} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

