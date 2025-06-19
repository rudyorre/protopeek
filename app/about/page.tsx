import { BlogPost } from '../components/blog-post';
import { HeadingWithAnchor } from '../components/heading-with-anchor';
import { ExternalLink } from 'lucide-react';

export default function AboutPage() {
  return (
    <BlogPost
      title="About ProtoPeek"
      description="Learn about the motivation and story behind ProtoPeek"
      date="January 2025"
      readTime="4 min read"
    >
      <div className='space-y-6 text-body-large text-gray-300'>
        <section>
          <HeadingWithAnchor level={2} className='mb-4'>Our Mission</HeadingWithAnchor>
          <p className='leading-relaxed'>
            ProtoPeek was born out of a simple frustration: existing online protobuf decoders 
            didn't make it easy to use <code className='rounded bg-gray-700 px-2 py-1 text-blue-400'>.proto</code> files 
            for better decoding and visualization. Most tools only offered raw decoding without 
            the context that schema files provide, making it difficult to understand complex 
            protobuf structures.
          </p>
        </section>

        <section>
          <HeadingWithAnchor level={2} className='mb-4'>Why We Built This</HeadingWithAnchor>
          <div className='space-y-4'>
            <p className='leading-relaxed'>
              When working with Protocol Buffers, having access to the schema dramatically 
              improves the debugging and exploration experience. ProtoPeek bridges this gap 
              by allowing you to:
            </p>
            <ul className='list-disc space-y-2 pl-6'>
              <li>Upload your <code className='rounded bg-gray-700 px-2 py-1 text-blue-400'>.proto</code> files for enhanced decoding</li>
              <li>Visualize protobuf data with proper field names and types</li>
              <li>Explore complex nested structures with an intuitive tree view</li>
              <li>Analyze byte-level encoding with detailed tables</li>
              <li>Work entirely in your browser with complete privacy</li>
            </ul>
          </div>
        </section>

        <section>
          <HeadingWithAnchor level={2} className='mb-4'>Learning Journey</HeadingWithAnchor>
          <p className='leading-relaxed'>
            Building ProtoPeek was also a fantastic learning opportunity to dive deep into 
            the protobuf encoding and decoding patterns. Understanding how Protocol Buffers 
            work at the byte level has been both challenging and rewarding, and we hope this 
            tool helps others on their own protobuf journey.
          </p>
        </section>

        <section>
          <HeadingWithAnchor level={2} className='mb-4'>Special Thanks</HeadingWithAnchor>
          <div className='rounded-lg border border-gray-700 bg-[#303134] p-6'>
            <p className='leading-relaxed'>
              We want to give special thanks to{' '}
              <a 
                href='https://protobuf-decoder.netlify.app/' 
                target='_blank' 
                rel='noopener noreferrer'
                className='inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors'
              >
                protobuf-decoder.netlify.app
                <ExternalLink className='ml-1 h-3 w-3' />
              </a>
              {' '}for inspiration and for being an invaluable resource during testing and 
              development. Their work helped validate our decoding logic and provided 
              excellent reference implementations.
            </p>
          </div>
        </section>

        <section>
          <HeadingWithAnchor level={2} className='mb-4'>Open Source</HeadingWithAnchor>
          <p className='leading-relaxed'>
            ProtoPeek is completely open source and available on{' '}
            <a 
              href='https://github.com/rudyorre/protopeek' 
              target='_blank' 
              rel='noopener noreferrer'
              className='inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors'
            >
              GitHub
              <ExternalLink className='ml-1 h-3 w-3' />
            </a>
            . We welcome contributions, bug reports, and feature requests from the community. 
            Together, we can make protobuf debugging better for everyone.
          </p>
        </section>
      </div>
    </BlogPost>
  );
}
