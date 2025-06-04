import type React from "react"
import "@/app/globals.css"
import { Roboto } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Footer } from "@/app/components/footer"

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
})

export const metadata = {
  title: "ProtoPeek",
  description: "A modern tool to decode protobuf data using .proto files",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <main className="min-h-screen bg-[#1a1a1a] text-white flex flex-col">
            <div className="flex-grow">{children}</div>
            <Footer />
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
