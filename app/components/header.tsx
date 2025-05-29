import { Code } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="w-full border-b border-gray-800 bg-[#202124] py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-500 p-2 rounded-full">
              <Code className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-medium text-white">Protobuf Decoder</h1>
              <div className="hidden sm:block text-xs text-gray-400">
                by{" "}
                <a
                  href="https://rudyorre.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  Rudy Orre
                </a>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <a
              href="https://protobuf.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-300 hover:text-blue-400 transition-colors"
            >
              Protobuf Docs
            </a>
            <a
              href="https://grpc.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-300 hover:text-blue-400 transition-colors"
            >
              gRPC
            </a>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-700 hover:border-blue-500 bg-[#303134] hover:bg-[#303134] text-gray-200"
              asChild
            >
              <a href="https://github.com/protocolbuffers/protobuf/releases" target="_blank" rel="noopener noreferrer">
                Download protoc
              </a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
