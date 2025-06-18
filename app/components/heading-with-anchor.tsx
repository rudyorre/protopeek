'use client';

import { Link } from 'lucide-react';
import { ReactNode, useMemo, createElement } from 'react';

interface HeadingWithAnchorProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
  className?: string;
}

export function HeadingWithAnchor({ level, children, className = '' }: HeadingWithAnchorProps) {
  // Memoize the ID generation to prevent unnecessary re-computations
  const id = useMemo(() => {
    const text = typeof children === 'string' ? children : extractTextFromChildren(children);
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  }, [children]);

  const headingTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  
  // Get the appropriate typography class for each heading level
  const getTypographyClass = (level: number) => {
    switch (level) {
      case 1: return 'text-display-small';
      case 2: return 'text-headline-medium';
      case 3: return 'text-headline-small';
      case 4: return 'text-title-large';
      case 5: return 'text-title-medium';
      case 6: return 'text-title-medium';
      default: return 'text-headline-medium';
    }
  };

  // Memoize the link label to prevent recalculation
  const linkLabel = useMemo(() => {
    const text = typeof children === 'string' ? children : extractTextFromChildren(children);
    return `Link to section: ${text}`;
  }, [children]);

  return createElement(
    headingTag,
    {
      id,
      className: `group scroll-mt-20 ${getTypographyClass(level)} text-white ${className}`
    },
    createElement(
      'span',
      { className: 'inline-flex items-center gap-2' },
      children,
      createElement(
        'a',
        {
          href: `#${id}`,
          className: 'opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100',
          'aria-label': linkLabel
        },
        createElement(Link, { className: 'h-4 w-4 text-gray-400 hover:text-blue-400' })
      )
    )
  );
}

// Helper function to extract text from React children
function extractTextFromChildren(children: ReactNode): string {
  if (typeof children === 'string') {
    return children;
  }
  
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join('');
  }
  
  if (children && typeof children === 'object' && 'props' in children) {
    return extractTextFromChildren((children as any).props.children);
  }
  
  return '';
}
