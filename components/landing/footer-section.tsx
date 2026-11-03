import Image from "next/image";
import { cacheLife } from "next/cache";
import { getTranslations } from "next-intl/server";

async function getCurrentYear() {
  "use cache";
  cacheLife("max");
  return new Date().getFullYear();
}

export async function FooterSection() {
  const [currentYear, t, nav] = await Promise.all([
    getCurrentYear(),
    getTranslations("Landing"),
    getTranslations("Navigation"),
  ]);
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-border/40 bg-background md:mt-28">
      <div className="site-container pb-8 pt-16 sm:pb-12 sm:pt-20">
        <div className="grid grid-cols-1 gap-12 pb-14 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col items-start gap-4 lg:col-span-5">
            <a
              href="/"
              className="inline-flex items-center gap-2 font-semibold"
            >
              <Image
                src="/solodesk_no_bg_no_text.png"
                alt=""
                width={18}
                height={18}
              />
              <bdi>SoloDesk</bdi>
            </a>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {t("footer")}
            </p>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {t("footerNav.disclaimer")}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 lg:col-span-7">
            <nav
              aria-label={t("footerNav.product")}
              className="flex flex-col items-start gap-3 text-sm"
            >
              <h3 className="font-semibold">{t("footerNav.product")}</h3>
              {(
                [
                  ["features", "/#features"],
                  ["tour", "/#tour"],
                  ["how", "/#how-it-works"],
                  ["security", "/#security"],
                  ["faq", "/#faq"],
                  ["contact", "/#contact"],
                ] as const
              ).map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {nav(label)}
                </a>
              ))}
            </nav>
            <nav
              aria-label={t("footerNav.account")}
              className="flex flex-col items-start gap-3 text-sm"
            >
              <h3 className="font-semibold">{t("footerNav.account")}</h3>
              <a
                href="/sign-in"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {nav("signIn")}
              </a>
              <a
                href="/sign-up"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {nav("signUp")}
              </a>
            </nav>
          </div>
        </div>
        <div className="border-t border-border/40 pt-8 text-sm text-muted-foreground">
          <span>
            © {currentYear} <bdi>SoloDesk</bdi>
          </span>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none flex w-full select-none items-center justify-center overflow-hidden pt-8"
        >
          <span className="select-none text-[17vw] font-black leading-none tracking-tight text-foreground/[0.04] lg:text-[230px]">
            SoloDesk
          </span>
        </div>
      </div>
    </footer>
  );
}
