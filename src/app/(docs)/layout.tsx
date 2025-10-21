// src/app/docs/layout.tsx
import { DocsLayout, DocsLayoutProps } from 'fumadocs-ui/layouts/notebook';
import { baseOptions } from '@/lib/layout.shared';
import { source } from '@/lib/source';
import { Banknote, Smartphone } from 'lucide-react';

const docsOptions: DocsLayoutProps = {
  ...baseOptions(),
  tree: source.pageTree,
  sidebar: {
    // banner: <div>Hello World</div>,
    tabs: {
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
    },
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <DocsLayout  {...docsOptions}>
      {children}
    </DocsLayout>
  );
}