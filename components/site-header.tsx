import Image from "next/image";
import { locale as rootLocale, theme as rootTheme } from "next/root-params";
import { getTranslations } from "next-intl/server";
import { Languages, Moon, Sun, Monitor } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { SiteDisclosure } from "@/components/site-disclosure";
import {
  HeaderScrollContainer,
  HeaderNavLink,
} from "@/components/header-scroll-container";
import { presentation, themes, type ReturnPath } from "@/lib/site";

export async function SiteHeader({
  returnTo = "/",
}: {
  returnTo?: ReturnPath;
}) {
  const t = await getTranslations("Navigation");
  const { locale, theme } = presentation(await rootLocale(), await rootTheme());
  const nextLocale = locale === "en" ? "ar" : "en";
  const nextTheme = themes[(themes.indexOf(theme) + 1) % themes.length];
  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  return (
    <>
      <a href="#main-content" className="skip-link">
        {t("skip")}
      </a>
      <HeaderScrollContainer>
        <a href="/" className="brand-link">
          <Image
            src="/solodesk_logo_transparent.png"
            alt="SoloDesk"
            width={169}
            height={47}
            className="brand-wordmark"
            preload
          />
        </a>
        <nav
          aria-label={t("label")}
          className="hidden items-center gap-6 xl:gap-8 lg:flex text-sm"
        >
          <HeaderNavLink href="/#tour" sectionId="tour">
            {t("tour")}
          </HeaderNavLink>
          <HeaderNavLink href="/#features" sectionId="features">
            {t("features")}
          </HeaderNavLink>
          <HeaderNavLink href="/#how-it-works" sectionId="how-it-works">
            {t("how")}
          </HeaderNavLink>
          <HeaderNavLink href="/#why-solodesk" sectionId="why-solodesk">
            {t("why")}
          </HeaderNavLink>
          <HeaderNavLink href="/#faq" sectionId="faq">
            {t("faq")}
          </HeaderNavLink>
          <HeaderNavLink href="/#contact" sectionId="contact">
            {t("contact")}
          </HeaderNavLink>
        </nav>
        <div className="header-controls">
          <div className="hidden items-center gap-2 lg:flex">
            <a
              href="/sign-in"
              className={buttonVariants({ variant: "ghost", size: "lg" })}
            >
              {t("signIn")}
            </a>
            <a href="/sign-up" className={buttonVariants({ size: "lg" })}>
              {t("signUp")}
            </a>
          </div>
          <form action="/api/preferences" method="post">
            <input type="hidden" name="returnTo" value={returnTo} />
            <input type="hidden" name="locale" value={nextLocale} />
            <input type="hidden" name="theme" value={theme} />
            <Button
              type="submit"
              variant="ghost"
              size="icon-lg"
              aria-label={t("switchLanguage", {
                language: nextLocale === "ar" ? "العربية" : "English",
              })}
              title={t("switchLanguage", {
                language: nextLocale === "ar" ? "العربية" : "English",
              })}
            >
              <Languages aria-hidden="true" />
            </Button>
          </form>
          <form action="/api/preferences" method="post">
            <input type="hidden" name="returnTo" value={returnTo} />
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="theme" value={nextTheme} />
            <Button
              type="submit"
              variant="ghost"
              size="icon-lg"
              aria-label={t("switchTheme", {
                current: t(theme),
                next: t(nextTheme),
              })}
              title={t("switchTheme", {
                current: t(theme),
                next: t(nextTheme),
              })}
            >
              <ThemeIcon aria-hidden="true" />
            </Button>
          </form>
          <SiteDisclosure menuLabel={t("menu")}>
            <nav
              aria-label={t("label")}
              className="flex flex-col gap-2 max-h-[80vh] overflow-y-auto p-2"
            >
              <a
                href="/#tour"
                className={buttonVariants({ variant: "ghost", size: "lg" })}
              >
                {t("tour")}
              </a>
              <a
                href="/#features"
                className={buttonVariants({ variant: "ghost", size: "lg" })}
              >
                {t("features")}
              </a>
              <a
                href="/#how-it-works"
                className={buttonVariants({ variant: "ghost", size: "lg" })}
              >
                {t("how")}
              </a>
              <a
                href="/#why-solodesk"
                className={buttonVariants({ variant: "ghost", size: "lg" })}
              >
                {t("why")}
              </a>
              <a
                href="/#security"
                className={buttonVariants({ variant: "ghost", size: "lg" })}
              >
                {t("security")}
              </a>
              <a
                href="/#faq"
                className={buttonVariants({ variant: "ghost", size: "lg" })}
              >
                {t("faq")}
              </a>
              <a
                href="/#contact"
                className={buttonVariants({ variant: "ghost", size: "lg" })}
              >
                {t("contact")}
              </a>
              <div className="my-2 border-t border-border pt-2 flex flex-col gap-2">
                <a
                  href="/sign-in"
                  className={buttonVariants({ variant: "outline", size: "lg" })}
                >
                  {t("signIn")}
                </a>
                <a href="/sign-up" className={buttonVariants({ size: "lg" })}>
                  {t("signUp")}
                </a>
              </div>
            </nav>
          </SiteDisclosure>
        </div>
      </HeaderScrollContainer>
    </>
  );
}
