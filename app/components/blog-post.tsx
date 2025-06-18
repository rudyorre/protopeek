import { Header } from './header';
import { PageNavigation } from './page-navigation';
import { MobileNavigation } from './mobile-navigation';
import { ReactNode } from 'react';
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
            
            {/* Article Header */}
            <article className='mb-8'>
              <header className='mb-8 text-center'>
                <h1 className='mb-4 text-4xl font-bold text-white'>{title}</h1>
                {description && (
                  <p className='mb-6 text-xl text-gray-400'>{description}</p>
                )}
                
                {/* Meta information */}
                <div className='flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500'>
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
              <div className='prose prose-invert prose-blue prose-lg max-w-none'>
                <div className='rounded-lg border border-gray-800 bg-[#202124] p-8 shadow-lg'>
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
