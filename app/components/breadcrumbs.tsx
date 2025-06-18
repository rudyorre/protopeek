'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Breadcrumbs() {
  const pathname = usePathname();
  
  const pathSegments = pathname.split('/').filter(Boolean);
  
  const getBreadcrumbItems = () => {
    const items = [
      { name: 'Home', href: '/', icon: Home }
    ];
    
    pathSegments.forEach((segment, index) => {
      const href = '/' + pathSegments.slice(0, index + 1).join('/');
      const name = segment.charAt(0).toUpperCase() + segment.slice(1);
      items.push({ name, href });
    });
    
    return items;
  };

  const items = getBreadcrumbItems();

  if (items.length <= 1) return null;

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-400 mb-6">
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="h-3 w-3 mx-2 text-gray-500" />
          )}
          {index === items.length - 1 ? (
            <span className="text-gray-300 font-medium">{item.name}</span>
          ) : (
            <Link
              href={item.href}
              className="flex items-center gap-1 hover:text-blue-400 transition-colors"
            >
              {item.icon && <item.icon className="h-3 w-3" />}
              {item.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
