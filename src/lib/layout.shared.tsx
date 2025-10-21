import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <Image
            src="/logotype-for-dark-mode.svg"
            alt="Polygon Payments"
            width={120}
            height={24}
            className="hidden dark:block"
            priority
          />
          <Image
            src="/logotype-for-light-mode.svg"
            alt="Polygon Payments"
            width={120}
            height={24}
            className="dark:hidden"
            priority
          />
        </>
      ),
    },
    // see https://fumadocs.dev/docs/ui/navigation/links
    links: [
      {
        icon: <ExternalLink />,
        text: 'Polygon',
        url: 'https://polygon.technology/',
        // secondary items will be displayed differently on navbar
        secondary: false,
      },
      {
        icon: <ExternalLink />,
        text: 'Polygon Docs',
        url: 'https://docs.polygon.technology/',
        // secondary items will be displayed differently on navbar
        secondary: false,
      },
      {
        icon: <ExternalLink />,
        text: 'Polygon Telegram',
        url: 'https://t.me/polygonhq',
        // secondary items will be displayed differently on navbar
        secondary: false,
      },
    ],
  };
}
