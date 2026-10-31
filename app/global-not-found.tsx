import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { geistMono, geistSans, rugis, sahabah } from "@/lib/fonts";
import { presentation } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: "404 | SoloDesk",
  robots: { index: false, follow: false },
};

// The complete 404 document uses request cookies for its language and theme.
export const instant = false;

export default async function GlobalNotFound() {
  const preferences = await cookies();
  const { locale, theme, dir } = presentation(
    preferences.get("solodesk-locale")?.value,
    preferences.get("solodesk-theme")?.value,
  );
  const t = await getTranslations({ locale, namespace: "NotFound" });

  return (
    <html
      lang={locale}
      dir={dir}
      data-theme={theme}
      className={`${rugis.variable} ${sahabah.variable} ${geistSans.variable} ${geistMono.variable} ${theme} h-full antialiased`}
    >
      <body className="flex min-h-svh flex-col">
        <a href="#main-content" className="skip-link">{t("skip")}</a>
        <header className="site-container mx-auto flex w-full shrink-0 justify-center py-[clamp(0.75rem,4svh,3rem)]">
          <Link href="/" prefetch={false} className="brand-link" aria-label={t("home")}>
            <Image src="/solodesk_logo_transparent.png" alt="SoloDesk" width={169} height={47} className="brand-wordmark" preload />
          </Link>
        </header>

        <main id="main-content" className="site-container mx-auto flex w-full flex-1 flex-col items-center justify-center py-[clamp(0.5rem,1.5svh,1.5rem)] text-center">
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center">
            <p aria-hidden="true" dir="ltr" className="font-[family-name:var(--font-rugis)] text-[clamp(4rem,min(17vw,22svh),14rem)] leading-none [@media(max-height:500px)]:text-[4rem]">404</p>
            <h1 className="mt-[clamp(0.75rem,3svh,2.25rem)] text-2xl leading-tight text-balance sm:text-4xl lg:text-[3.375rem]">{t("heading")}</h1>
            <p className="mx-auto mt-[clamp(0.75rem,2svh,1.5rem)] max-w-2xl text-sm leading-relaxed text-pretty text-muted-foreground sm:text-lg">
              <span className="sr-only">404. {t("title")} </span>
              {t("description")}
            </p>
            <Link href="/" prefetch={false} className={buttonVariants({ size: "lg", className: "mt-[clamp(1rem,3.5svh,2.5rem)] gap-3 px-6 sm:h-13 sm:px-7 sm:text-base motion-reduce:transition-none" })}>
              {t("home")}
              <ArrowUpRight aria-hidden="true" data-icon="inline-end" className="rtl:-scale-x-100" />
            </Link>
            <nav aria-label={t("destinations")} className="mt-[clamp(0.5rem,2svh,2rem)] flex flex-wrap items-center justify-center gap-x-5 sm:gap-x-7">
              <Link href="/sign-in" prefetch={false} className={buttonVariants({ variant: "link", size: "lg", className: "text-muted-foreground hover:text-foreground motion-reduce:transition-none" })}>{t("signIn")}</Link>
              <span aria-hidden="true" className="h-5 border-s border-muted-foreground" />
              <Link href="/#contact" prefetch={false} className={buttonVariants({ variant: "link", size: "lg", className: "text-muted-foreground underline hover:text-foreground motion-reduce:transition-none" })}>{t("contact")}</Link>
            </nav>
          </div>
        </main>

        <footer className="site-container mx-auto flex w-full shrink-0 flex-wrap items-center justify-center gap-3 py-[clamp(0.75rem,3svh,2rem)] text-xs text-muted-foreground sm:text-sm">
          <span>{t("title")}</span><span aria-hidden="true">·</span><span>SoloDesk</span>
        </footer>
      </body>
    </html>
  );
}
