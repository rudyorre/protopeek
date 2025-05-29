import Link from "next/link"
import { ExternalLink, Github, Globe } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full border-t border-gray-800 bg-[#202124] py-6">
      <div className="container mx-auto px-4">
        {/* Creator Attribution - Added prominently at the top */}
        <div className="flex flex-col items-center justify-center mb-8 pb-6 border-b border-gray-800">
          <p className="text-gray-300 mb-2">
            Created by <span className="font-medium text-blue-400">Rudy Orre</span>
          </p>
          <div className="flex items-center gap-4 mt-2">
            <a
              href="https://rudyorre.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-gray-300 hover:text-blue-400 transition-colors bg-[#303134] px-3 py-1.5 rounded-md"
            >
              <Globe className="h-4 w-4" />
              rudyorre.com
            </a>
            <a
              href="https://github.com/rudyorre"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-gray-300 hover:text-blue-400 transition-colors bg-[#303134] px-3 py-1.5 rounded-md"
            >
              <Github className="h-4 w-4" />
              @rudyorre
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Product Links */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-gray-400 hover:text-blue-400 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-400 hover:text-blue-400 transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-400 hover:text-blue-400 transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-400 hover:text-blue-400 transition-colors">
                  Help
                </Link>
              </li>
            </ul>
          </div>

          {/* Documentation Links */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3">Documentation</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://protobuf.dev/overview/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-1"
                >
                  Protocol Buffers
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://grpc.io/docs/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-1"
                >
                  gRPC
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://developers.google.com/protocol-buffers/docs/reference/overview"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-1"
                >
                  API Reference
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://developers.google.com/protocol-buffers/docs/proto3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-1"
                >
                  Proto3 Guide
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/protocolbuffers/protobuf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-1"
                >
                  Protobuf GitHub
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/grpc/grpc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-1"
                >
                  gRPC GitHub
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/protobufjs/protobuf.js"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-1"
                >
                  protobuf.js
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://developers.google.com/protocol-buffers/docs/downloads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-1"
                >
                  Download protoc
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} <span className="text-gray-300">proto.sourcedrive.co</span> by{" "}
              <a
                href="https://rudyorre.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Rudy Orre
              </a>
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-4">
            <a
              href="https://github.com/rudyorre"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 transition-colors"
              aria-label="GitHub"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 transition-colors"
              aria-label="Twitter"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
