'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowLeft, Info, Shield, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

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

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden border-gray-700 bg-[#303134] text-gray-200 hover:border-blue-500 hover:bg-[#303134]"
        >
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 bg-[#202124] border-gray-800">
        {/* Simple back link */}
        <Link 
          href="/" 
          onClick={() => setIsOpen(false)}
          className='flex items-center gap-2 mt-6 mb-6 text-sm text-gray-400 hover:text-blue-400 transition-colors'
        >
          <ArrowLeft className='h-4 w-4' />
          Back to ProtoPeek
        </Link>
        
        <div className="space-y-6">
          {navigationItems.map((section) => (
            <div key={section.title} className="mb-6">
              <h3 className="mb-3 text-sm font-semibold text-gray-400I  tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200',
                          isActive
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-gray-400 hover:bg-[#303134] hover:text-white'
                        )}
                      >
                        <Icon className='h-4 w-4 flex-shrink-0' />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{item.name}</div>
                          <div className={cn(
                            'text-xs transition-colors',
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
        </div>
      </SheetContent>
    </Sheet>
  );
}