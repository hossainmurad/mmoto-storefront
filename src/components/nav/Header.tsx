import Link from "next/link"
import { getI18n } from "@/lib/i18n/server"
import { getCategoryTree } from "@/lib/medusa/categories"
import { HOTLINE, PAGE_LINKS, UTILITY_LINKS } from "@/lib/nav-config"
import { HeaderIcons } from "./HeaderIcons"
import { Icon } from "./icons"
import { LangSwitch } from "./LangSwitch"
import { MegaMenu } from "./MegaMenu"
import { MobileMenu } from "./MobileMenu"
import { SearchBox } from "./SearchBox"
import s from "./nav.module.css"

/**
 * Site header: announcement bar, main bar (logo, search, account icons) and
 * the category bar with mega menus. Server component: categories load on the
 * server and are cached, so the menu is in the HTML on first paint. Counts and
 * search suggestions are client components that load after the page.
 */
export async function Header() {
  const [{ t, href }, categories] = await Promise.all([getI18n(), getCategoryTree()])

  return (
    <>
      <a href="#main" className={s.skip}>{t.nav.skip}</a>
      <div className={s.announce}>
        <div className={`${s.wrap} ${s.announceIn}`}>
          <p>
            <span className={s.annShort}>{t.nav.announceShort}</span>
            <span className={s.annFull}>{t.nav.announceFull}</span>
          </p>
          <div className={s.announceEnd}>
            <nav aria-label={t.nav.helpAndCompany} className={s.util}>
              {UTILITY_LINKS.map((l) => <Link key={l.href} href={href(l.href)}>{t.nav[l.key]}</Link>)}
              <a href={HOTLINE.href} className={s.hotline}>
                <Icon name="phone" size={16} /> {HOTLINE.label}
              </a>
            </nav>
            <LangSwitch />
          </div>
        </div>
      </div>

      <header className={s.header}>
        <div className={`${s.wrap} ${s.mainBar}`}>
          <MobileMenu categories={categories} pages={[...PAGE_LINKS, ...UTILITY_LINKS]} hotline={HOTLINE} />

          <Link href={href("/")} className={s.logo} aria-label={t.nav.logoHome}>
            <span className={s.logoMark} aria-hidden="true" />
            MMOTO
          </Link>

          <SearchBox />
          <HeaderIcons />
        </div>

        <MegaMenu categories={categories} pages={PAGE_LINKS} />
      </header>
    </>
  )
}
