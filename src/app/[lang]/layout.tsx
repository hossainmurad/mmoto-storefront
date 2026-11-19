import type { Metadata, Viewport } from "next"
import { Header } from "@/components/nav/Header"
import { I18nProvider } from "@/lib/i18n/client"
import { LOCALES } from "@/lib/i18n/config"
import { getI18n } from "@/lib/i18n/server"
import "@fontsource/barlow/400.css"
import "@fontsource/barlow/500.css"
import "@fontsource/barlow/600.css"
import "@fontsource/barlow/700.css"
import "@fontsource/barlow-condensed/500.css"
import "@fontsource/barlow-condensed/600.css"
import "@fontsource/barlow-condensed/700.css"
import "@fontsource/bebas-neue/400.css"
import "./globals.css"

// Only /en (served at the plain URLs) and /bn exist; anything else is a 404.
export const dynamicParams = false
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }))
}

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getI18n()
  return locale === "bn"
    ? {
        title: { default: "MMOTO | বাংলাদেশে মোটরসাইকেল হেলমেট, গিয়ার ও পার্টস", template: "%s | MMOTO" },
        description: "হেলমেট, রাইডিং গিয়ার ও আসল মোটরসাইকেল পার্টস। সারা বাংলাদেশে ক্যাশ অন ডেলিভারি।",
      }
    : {
        title: { default: "MMOTO | Motorcycle helmets, gear and parts in Bangladesh", template: "%s | MMOTO" },
        description: "Helmets, riding gear and genuine motorcycle parts. Cash on delivery across Bangladesh.",
      }
}

export const viewport: Viewport = { themeColor: "#2e2d2d", width: "device-width", initialScale: 1 }

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, t } = await getI18n()
  return (
    <html lang={locale} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <I18nProvider locale={locale} t={t}>
          <Header />
          <main id="main">{children}</main>
        </I18nProvider>
      </body>
    </html>
  )
}
