import { PageLayout } from '../components/page-layout';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

interface BlogPostPreview {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  category?: string;
}

const blogPosts: BlogPostPreview[] = [
  {
    slug: '/tutorial',
    title: 'How to Use ProtoPeek',
    description: 'A comprehensive guide to decoding and visualizing Protocol Buffers with ProtoPeek',
    date: 'January 2025',
    readTime: '8 min read',
    category: 'Tutorial'
  },
  // Add more blog posts here in the future
];

export default function BlogPage() {
  return (
    <PageLayout
      title="Blog"
      description="Tutorials, tips, and insights about Protocol Buffers and ProtoPeek"
    >
      <div className='space-y-8'>
        {blogPosts.length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-gray-400 text-lg'>No blog posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className='space-y-6'>
            {blogPosts.map((post) => (
              <article key={post.slug} className='group'>
                <Link href={post.slug} className='block'>
                  <div className='rounded-lg border border-gray-700 bg-[#303134] p-6 transition-all duration-200 hover:border-blue-500 hover:bg-[#353539]'>
                    <div className='space-y-3'>
                      {post.category && (
                        <span className='inline-block rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white'>
                          {post.category}
                        </span>
                      )}
                      
                      <h2 className='text-xl font-semibold text-white group-hover:text-blue-400 transition-colors'>
                        {post.title}
                      </h2>
                      
                      <p className='text-gray-300 leading-relaxed'>
                        {post.description}
                      </p>
                      
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-4 text-sm text-gray-500'>
                          <div className='flex items-center gap-1'>
                            <Calendar className='h-4 w-4' />
                            <span>{post.date}</span>
                          </div>
                          <div className='flex items-center gap-1'>
                            <Clock className='h-4 w-4' />
                            <span>{post.readTime}</span>
                          </div>
                        </div>
                        
                        <div className='flex items-center gap-1 text-blue-400 group-hover:text-blue-300 transition-colors'>
                          <span className='text-sm font-medium'>Read more</span>
                          <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
        
        <div className='mt-12 rounded-lg border border-gray-700 bg-[#303134] p-6 text-center'>
          <h3 className='mb-2 text-lg font-semibold text-white'>Want to contribute?</h3>
          <p className='text-gray-300 mb-4'>
            Have ideas for blog posts or tutorials? We'd love to hear from you!
          </p>
          <a 
            href='https://github.com/rudyorre/protopeek/issues' 
            target='_blank' 
            rel='noopener noreferrer'
            className='inline-flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700'
          >
            Suggest a topic
            <ArrowRight className='h-4 w-4' />
          </a>
        </div>
      </div>
    </PageLayout>
  );
}
