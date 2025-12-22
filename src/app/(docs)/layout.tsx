// src/app/docs/layout.tsx
import { DocsLayout, DocsLayoutProps } from 'fumadocs-ui/layouts/notebook';
import { baseOptions } from '@/lib/layout.shared';
import { source } from '@/lib/source';
import { Banknote, ExternalLink, Hexagon, Layers, Shield, Wrench, Smartphone } from 'lucide-react';
import { getSidebarTabs } from 'fumadocs-ui/utils/get-sidebar-tabs';

const tabs = [
  ...getSidebarTabs(source.pageTree, {
    transform(option, node) {
      switch (node.$id) {
        case 'general':
          return { ...option, icon: <Banknote /> };
        case 'pos':
          return { ...option, icon: <Layers /> };
        case 'security':
          return { ...option, icon: <Shield /> };
        case 'tools':
          return { ...option, icon: <Wrench /> };
        case 'zkevm':
          return { ...option, icon: <Hexagon /> };
        case 'flutter':
          return { ...option, icon: <Smartphone /> };
        default:
          return option;
      }
    },
  }),
  // External tabs (shown in the same dropdown)
  {
    title: 'Agglayer',
    description: 'Interoperability docs',
    url: 'https://docs.agglayer.dev/',
    icon: <ExternalLink />,
  },
  {
    title: 'CDK',
    description: 'Agglayer CDK docs',
    url: 'https://docs.agglayer.dev/cdk/',
    icon: <ExternalLink />,
  },
] as DocsLayoutProps['sidebar'] extends { tabs?: infer T } ? Exclude<T, false> : never;

const docsOptions: DocsLayoutProps = {
  ...baseOptions(),
  tree: source.pageTree,
  sidebar: {
    // banner: <div>Hello World</div>,
    tabs,
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <DocsLayout  {...docsOptions}>
      {children}
    </DocsLayout>
  );
}