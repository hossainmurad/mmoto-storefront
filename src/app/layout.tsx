import type { Metadata, Viewport } from "next"
import { Header } from "@/components/nav/Header"
import "@fontsource/barlow/400.css"
import "@fontsource/barlow/500.css"
import "@fontsource/barlow/600.css"
import "@fontsource/barlow/700.css"
import "@fontsource/barlow-condensed/500.css"
import "@fontsource/barlow-condensed/600.css"
import "@fontsource/barlow-condensed/700.css"
import "@fontsource/bebas-neue/400.css"
import "./globals.css"

export const metadata: Metadata = {
  title: { default: "MMOTO | Motorcycle helmets, gear and parts in Bangladesh", template: "%s | MMOTO" },
  description: "Helmets, riding gear and genuine motorcycle parts. Cash on delivery across Bangladesh.",
}

export const viewport: Viewport = { themeColor: "#2e2d2d", width: "device-width", initialScale: 1 }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Header counts={{ cart: 3, wishlist: 2, compare: 0 }} />
        <main id="main">{children}</main>
      </body>
    </html>
  )
}
