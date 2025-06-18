'use client';

import { Header } from './header';
import { PageNavigation } from './page-navigation';
import { MobileNavigation } from './mobile-navigation';
import { Breadcrumbs } from './breadcrumbs';
import { ReactNode, useEffect } from 'react';
import { Calendar, Clock, User } from 'lucide-react';

interface BlogPostProps {
  title: string;
  description?: string;
  author?: string;
  date?: string;
  readTime?: string;
  children: ReactNode;
}

export function BlogPost({ 
  title, 
  description, 
  author = 'Rudy Orre', 
  date,
  readTime,
  children 
}: BlogPostProps) {
  // Handle scrolling to anchor on page load
  useEffect(() => {
    const handleAnchorScroll = () => {
      if (typeof window !== 'undefined' && window.location.hash) {
        const hash = window.location.hash.slice(1);
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
          }
        }, 100);
      }
    };

    // Handle initial load
    handleAnchorScroll();

    // Handle browser back/forward navigation
    window.addEventListener('hashchange', handleAnchorScroll);
    
    return () => {
      window.removeEventListener('hashchange', handleAnchorScroll);
    };
  }, []);

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
            
            {/* Breadcrumbs */}
            <Breadcrumbs />
            
            {/* Article Header */}
            <article className='mb-8'>
              <header className='mb-8'>
                <h1 className='mb-4 text-display-small font-normal text-white tracking-tight'>{title}</h1>
                {description && (
                  <p className='mb-6 text-title-large font-normal text-gray-300 leading-relaxed'>{description}</p>
                )}
                
                {/* Meta information */}
                <div className='flex flex-wrap items-center gap-4 text-label-large text-gray-500'>
                  {author && (
                    <div className='flex items-center gap-1'>
                      <User className='h-4 w-4' />
                      <span>{author}</span>
                    </div>
                  )}
                  {date && (
                    <div className='flex items-center gap-1'>
                      <Calendar className='h-4 w-4' />
                      <span>{date}</span>
                    </div>
                  )}
                  {readTime && (
                    <div className='flex items-center gap-1'>
                      <Clock className='h-4 w-4' />
                      <span>{readTime}</span>
                    </div>
                  )}
                </div>
              </header>

              {/* Article Content */}
              <div className='prose prose-invert prose-blue max-w-none'>
                <div className='rounded-lg border border-gray-800 bg-[#202124] p-8 shadow-lg text-body-large leading-relaxed'>
                  {children}
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </>
  );
}
