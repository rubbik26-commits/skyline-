import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Suspense } from "react"
import "./globals.css"
import { SkylineThemeProvider } from "@/components/skyline-theme-provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
})

export const metadata: Metadata = {
  title: "Manhattan Office-to-Residential Conversions Dashboard",
  description:
    "Comprehensive tracking of Manhattan office-to-residential conversions with real-time data and analytics",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
      <body className="font-sans">
        <SkylineThemeProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </SkylineThemeProvider>
      </body>
    </html>
  )
}
