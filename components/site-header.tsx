import Image from "next/image";
import { locale as rootLocale, theme as rootTheme } from "next/root-params";
import { getTranslations } from "next-intl/server";
import { Languages, Moon, Sun, Monitor } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { SiteDisclosure } from "@/components/site-disclosure";
import { presentation, themes, type ReturnPath } from "@/lib/site";

export async function SiteHeader({returnTo = "/"}: {returnTo?: ReturnPath}) {
  const t = await getTranslations("Navigation");
  const {locale,theme} = presentation(await rootLocale(),await rootTheme());
  const nextLocale = locale === "en" ? "ar" : "en";
  const nextTheme = themes[(themes.indexOf(theme) + 1) % themes.length];
  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  return <>
    <a href="#main-content" className="skip-link">{t("skip")}</a>
    <header className="site-header site-container">
      <a href="/" className="brand-link"><Image src="/solodesk_logo_transparent.png" alt="SoloDesk" width={169} height={47} className="brand-wordmark" preload /></a>
      <nav aria-label={t("label")} className="hidden items-center gap-8 lg:flex">
        <a href="/#features">{t("features")}</a><a href="/#how-it-works">{t("how")}</a>
      </nav>
      <div className="header-controls">
        <div className="hidden items-center gap-2 lg:flex">
          <a href="/sign-in" className={buttonVariants({variant:"ghost",size:"lg"})}>{t("signIn")}</a>
          <a href="/sign-up" className={buttonVariants({size:"lg"})}>{t("signUp")}</a>
        </div>
        <form action="/api/preferences" method="post">
          <input type="hidden" name="returnTo" value={returnTo} /><input type="hidden" name="locale" value={nextLocale} /><input type="hidden" name="theme" value={theme} />
          <Button type="submit" variant="ghost" size="icon-lg" aria-label={t("switchLanguage", {language:nextLocale === "ar" ? "العربية" : "English"})} title={t("switchLanguage", {language:nextLocale === "ar" ? "العربية" : "English"})}><Languages aria-hidden="true" /></Button>
        </form>
        <form action="/api/preferences" method="post">
          <input type="hidden" name="returnTo" value={returnTo} /><input type="hidden" name="locale" value={locale} /><input type="hidden" name="theme" value={nextTheme} />
          <Button type="submit" variant="ghost" size="icon-lg" aria-label={t("switchTheme", {current:t(theme),next:t(nextTheme)})} title={t("switchTheme", {current:t(theme),next:t(nextTheme)})}><ThemeIcon aria-hidden="true" /></Button>
        </form>
        <SiteDisclosure menuLabel={t("menu")}>
          <nav aria-label={t("label")} className="flex flex-col gap-3">
            <a href="/#features" className={buttonVariants({variant:"ghost",size:"lg"})}>{t("features")}</a>
            <a href="/#how-it-works" className={buttonVariants({variant:"ghost",size:"lg"})}>{t("how")}</a>
            <a href="/sign-in" className={buttonVariants({variant:"outline",size:"lg"})}>{t("signIn")}</a>
            <a href="/sign-up" className={buttonVariants({size:"lg"})}>{t("signUp")}</a>
          </nav>
        </SiteDisclosure>
      </div>
    </header>
  </>;
}
