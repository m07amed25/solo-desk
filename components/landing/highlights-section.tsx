import { getTranslations } from "next-intl/server";
import { Clock3, Coins, Languages } from "lucide-react";
import { heroHighlights } from "@/lib/site-content";

const highlightIconMap = {
  multiCurrency: Coins,
  recoverableTime: Clock3,
  bilingual: Languages,
} as const;

export async function HighlightsSection() {
  const t = await getTranslations("Landing");

  return (
    <section
      id="highlights"
      className="site-container pt-12 pb-6"
      aria-labelledby="highlights-heading"
    >
      <h2 id="highlights-heading" className="sr-only">
        {t("nav.hero")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {heroHighlights.map((highlight) => {
          const Icon = highlightIconMap[highlight.id];
          const titleKey = `highlights.${highlight.id}Title` as const;
          const descKey = `highlights.${highlight.id}Desc` as const;

          return (
            <div
              key={highlight.id}
              className="rounded-xl border border-border/80 bg-card/60 p-5 backdrop-blur-xs flex items-start gap-4 transition-colors hover:border-border"
            >
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground border border-border">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold text-foreground text-sm tracking-tight">
                  {t(titleKey)}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t(descKey)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
