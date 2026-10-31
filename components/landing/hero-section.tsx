import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { WorkPreview } from "@/components/landing/work-preview";

export async function HeroSection() {
  const t = await getTranslations("Landing");
  const c = await getTranslations("Common");

  return (
    <section
      id="hero"
      className="hero site-container"
      aria-labelledby="hero-heading"
    >
      <div data-hero-copy>
        <h1 id="hero-heading" className="hero-title">
          {t("title")}
        </h1>
        <p className="hero-description">{t("description")}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <a href="/sign-up" className={buttonVariants({ size: "lg" })}>
            {c("getStarted")}
            <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
          </a>
          <a
            href="/#tour"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            {c("explore")}
          </a>
        </div>
      </div>
      <div className="hero-preview">
        <WorkPreview />
      </div>
    </section>
  );
}
