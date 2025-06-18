import { Header } from './header';
import { PageNavigation } from './page-navigation';
import { MobileNavigation } from './mobile-navigation';
import { ReactNode } from 'react';

interface PageLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function PageLayout({ title, description, children }: PageLayoutProps) {
  return (
    <>
      <Header />
      <div className='container mx-auto max-w-7xl px-4 py-10'>
        <div className='flex gap-8 relative'>
          {/* Navigation Sidebar */}
          <div className='hidden lg:block flex-shrink-0'>
            <PageNavigation />
          </div>
          
          {/* Main Content */}
          <div className='flex-1 max-w-4xl'>
            {/* Mobile Navigation Button */}
            <div className='mb-6 lg:hidden'>
              <MobileNavigation />
            </div>
            
            <div className='mb-8 text-center'>
              <h1 className='mb-4 text-4xl font-medium text-white'>{title}</h1>
              {description && (
                <p className='text-lg text-gray-400'>{description}</p>
              )}
            </div>
            <div className='prose prose-invert prose-blue max-w-none'>
              <div className='rounded-lg border border-gray-800 bg-[#202124] p-8 shadow-lg'>
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
