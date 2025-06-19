'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Info, Shield, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationItem {
  name: string;
  href: string;
  icon: typeof ArrowLeft;
  description: string;
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

const navigationItems: NavigationSection[] = [
  {
    title: 'Guides',
    items: [
      {
        name: 'How to Use',
        href: '/tutorial',
        icon: BookOpen,
        description: 'Complete tutorial guide'
      }
    ]
  },
  {
    title: 'About',
    items: [
      {
        name: 'Mission',
        href: '/about',
        icon: Info,
        description: 'Mission and motivation'
      },
      {
        name: 'Privacy Policy',
        href: '/privacy',
        icon: Shield,
        description: 'How we protect your data'
      }
    ]
  }
];

export function PageNavigation() {
  const pathname = usePathname();

  return (
    <div className='sticky top-8 w-64 h-fit max-h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden'>
      {/* Simple back link */}
      <Link 
        href="/" 
        className='flex items-center gap-2 mb-6 text-label-large text-gray-400 hover:text-blue-400 transition-colors min-w-0'
      >
        <ArrowLeft className='h-4 w-4 flex-shrink-0' />
        <span className='truncate'>Back to ProtoPeek</span>
      </Link>
      
      <nav className='space-y-6 min-w-0'>
        {navigationItems.map((section) => (
          <div key={section.title} className='mb-6 min-w-0'>
            <h3 className='mb-3 text-xs text-gray-400 font-medium tracking-wider uppercase truncate'>
              {section.title}
            </h3>
            <ul className='space-y-1 min-w-0'>
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <li key={item.name} className='min-w-0'>
                    <Link
                      href={item.href}
                      className={cn(
                        'nav-item group flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 w-full min-w-0',
                        isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-gray-400 hover:bg-[#303134] hover:text-white'
                      )}
                    >
                      <Icon className='h-4 w-4 flex-shrink-0' />
                      <div className='flex-1 min-w-0 overflow-hidden'>
                        <div className='text-label-large font-medium truncate'>{item.name}</div>
                        <div className={cn(
                          'text-xs transition-colors truncate',
                          isActive ? 'text-blue-100' : 'text-gray-500 group-hover:text-gray-400'
                        )}>
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}