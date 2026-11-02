import React from "react";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { isLocale, isTheme, presentation } from "@/lib/site";

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; theme: string }>;
}) {
  const { locale, theme } = await params;
  if (!isLocale(locale) || !isTheme(theme)) notFound(); 
  const { dir } = presentation(locale, theme);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <DirectionProvider direction={dir}>
        <SidebarProvider defaultOpen={true}>{children}</SidebarProvider>
      </DirectionProvider>
    </NextIntlClientProvider>
  );
}
