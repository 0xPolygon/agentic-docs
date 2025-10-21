  'use client';

  import { RootProvider } from 'fumadocs-ui/provider/next';
  import StaticSearchDialog from '@/components/search';
  import type { ReactNode } from 'react';

  export function Provider({ children }: { children: ReactNode }) {
    return (
      <RootProvider
        search={{
          SearchDialog: StaticSearchDialog,
        }}
      >
        {children}
      </RootProvider>
    );
  }