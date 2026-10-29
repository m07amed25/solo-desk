import { getRequestConfig } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";
import { isLocale } from "@/lib/site";

const loaders = {
  en: () => import("@/messages/en.json").then((module) => module.default),
  ar: () => import("@/messages/ar.json").then((module) => module.default),
};

export default getRequestConfig(async ({ locale: explicitLocale }) => {
  const locale = explicitLocale ?? await rootLocale();
  if (!isLocale(locale)) throw new Error("An explicit supported site locale is required");
  return { locale, messages: await loaders[locale](), timeZone: "UTC" };
});
