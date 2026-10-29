import type { Metadata } from "next";
import { rugis, sahabah, geistSans, geistMono } from "@/lib/fonts";
import "../../../globals.css";
import { notFound } from "next/navigation";
import { isLocale, isTheme, locales, themes, presentation } from "@/lib/site";

export const metadata: Metadata = {
  title: "SoloDesk",
  description: "A clearer view of your independent work.",
};

export function generateStaticParams() {
  return locales.flatMap((locale) => themes.map((theme) => ({ locale, theme })));
}

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{locale: string; theme: string}> }) {
  const {locale, theme} = await params;
  if (!isLocale(locale) || !isTheme(theme)) notFound();
  const {dir} = presentation(locale, theme);
  return (
    <html
      lang={locale}
      dir={dir}
      data-theme={theme}
      className={`${rugis.variable} ${sahabah.variable} ${geistSans.variable} ${geistMono.variable} ${theme} h-full antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
