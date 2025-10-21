import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { cn } from '@/lib/cn';


function MarkdownImage({
  maxWidth,
  className,
  style,
  ...props
}: React.ComponentProps<'img'> & { maxWidth?: string | number }) {
  const resolvedMaxWidth =
    typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth;

  return (
    <img
      {...props}
      className={cn('rounded-lg', className)}
      style={{
        width: '100%',
        height: 'auto',
        maxWidth: resolvedMaxWidth ?? style?.maxWidth ?? '100%',
        ...style,
      }}
    />
  );
}

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    img: MarkdownImage,
    ...components,
  };
}
