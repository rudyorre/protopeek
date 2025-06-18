import { BlogPost } from '../components/blog-post';
import { Shield, Eye, Code, Server } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <BlogPost
      title="Privacy Policy"
      description="Your privacy and data security are our top priority"
      date="January 2025"
      readTime="6 min read"
    >
      <div className='space-y-8 text-body-large text-gray-300'>
        {/* Key Point - Everything Local */}
        <div className='rounded-lg border border-green-700 bg-green-900/20 p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <Shield className='h-6 w-6 text-green-400' />
            <h2 className='text-title-large font-semibold text-green-400'>100% Local Processing</h2>
          </div>
          <p className='text-title-medium leading-relaxed text-green-100'>
            <strong>Everything happens in your browser.</strong> Your protobuf data, .proto files, 
            and any other information you provide never leave your device. There are no servers 
            processing your data, no databases storing your information, and no third parties 
            with access to your content.
          </p>
        </div>

        <section>
          <div className='flex items-center gap-3 mb-4'>
            <Eye className='h-5 w-5 text-blue-400' />
            <h2 className='text-headline-medium text-white'>What We Don't Collect</h2>
          </div>
          <div className='space-y-3'>
            <ul className='list-disc space-y-2 pl-6'>
              <li>Your protobuf data or decoded content</li>
              <li>Your .proto schema files</li>
              <li>Personal information or identifiers</li>
              <li>Usage analytics or tracking data</li>
              <li>Browser fingerprints or device information</li>
              <li>IP addresses or location data</li>
            </ul>
          </div>
        </section>

        <section>
          <div className='flex items-center gap-3 mb-4'>
            <Server className='h-5 w-5 text-purple-400' />
            <h2 className='text-headline-medium text-white'>How It Works</h2>
          </div>
          <div className='space-y-4'>
            <p className='leading-relaxed'>
              ProtoPeek is built as a client-side application using modern web technologies. 
              All protobuf decoding, parsing, and visualization happens entirely within your 
              browser using JavaScript. This architecture ensures:
            </p>
            <ul className='list-disc space-y-2 pl-6'>
              <li><strong>Complete Privacy:</strong> No data transmission to external servers</li>
              <li><strong>Offline Capability:</strong> Works without an internet connection once loaded</li>
              <li><strong>Fast Performance:</strong> No network latency for processing</li>
              <li><strong>Data Security:</strong> Your sensitive data never leaves your control</li>
            </ul>
          </div>
        </section>

        <section>
          <div className='flex items-center gap-3 mb-4'>
            <Code className='h-5 w-5 text-green-400' />
            <h2 className='text-headline-medium text-white'>Open Source Transparency</h2>
          </div>
          <div className='space-y-4'>
            <p className='leading-relaxed'>
              ProtoPeek is completely open source, which means you can:
            </p>
            <ul className='list-disc space-y-2 pl-6'>
              <li>Review all source code to verify our privacy claims</li>
              <li>See exactly how your data is processed</li>
              <li>Run your own instance if desired</li>
              <li>Contribute to improvements and security enhancements</li>
            </ul>
            <p className='leading-relaxed'>
              The entire codebase is available on{' '}
              <a 
                href='https://github.com/rudyorre/protopeek' 
                target='_blank' 
                rel='noopener noreferrer'
                className='text-blue-400 hover:text-blue-300 transition-colors'
              >
                GitHub
              </a>
              , allowing for complete transparency and community oversight.
            </p>
          </div>
        </section>

        <section>
          <h2 className='mb-4 text-headline-medium text-white'>Browser Storage</h2>
          <p className='leading-relaxed'>
            ProtoPeek may use your browser's local storage to save user preferences 
            (such as theme settings or recent file selections) for a better user experience. 
            This data remains on your device and is never transmitted anywhere.
          </p>
        </section>

        <section>
          <h2 className='mb-4 text-headline-medium text-white'>Third-Party Services</h2>
          <p className='leading-relaxed'>
            This website is hosted on standard web hosting services, but no user data 
            is processed or stored by these services. The only information these services 
            might log are standard web server logs (IP addresses, user agents, etc.) which 
            are typical for any website visit.
          </p>
        </section>

        <section>
          <h2 className='mb-4 text-headline-medium text-white'>Updates to This Policy</h2>
          <p className='leading-relaxed'>
            If we ever make changes to our privacy practices, we will update this policy 
            and note the changes in our GitHub repository. However, our core commitment 
            to local-only processing will never change.
          </p>
        </section>

        <section>
          <h2 className='mb-4 text-headline-medium text-white'>Questions?</h2>
          <p className='leading-relaxed'>
            If you have any questions about privacy or how ProtoPeek works, please feel 
            free to{' '}
            <a 
              href='https://github.com/rudyorre/protopeek/issues' 
              target='_blank' 
              rel='noopener noreferrer'
              className='text-blue-400 hover:text-blue-300 transition-colors'
            >
              open an issue on GitHub
            </a>
            {' '}or contact us directly.
          </p>
        </section>

        <div className='border-t border-gray-700 pt-6 text-label-large text-gray-400'>
          <p>Last updated: January 2025</p>
        </div>
      </div>
    </BlogPost>
  );
}
