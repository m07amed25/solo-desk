import type messages from "../messages/en.json";
import type { SiteLocale } from "../lib/site";

declare module "next-intl" {
  interface AppConfig {
    Locale: SiteLocale;
    Messages: typeof messages;
  }
}
