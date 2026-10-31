import { getTranslations } from "next-intl/server";
import { Calculator, RefreshCw, ShieldCheck, Zap } from "lucide-react";
import { principles } from "@/lib/site-content";

const principleIconMap = {
  exactness: Calculator,
  speed: Zap,
  transparency: RefreshCw,
  privacy: ShieldCheck,
} as const;

export async function PrinciplesSection() {
  const t = await getTranslations("Landing");

  return (
    <section
      id="why-solodesk"
      className="site-section site-container"
      aria-labelledby="principles-heading"
    >
      <div className="section-intro">
        <div>
          <h2 id="principles-heading" className="section-title">
            {t("whySoloDesk.heading")}
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground text-base leading-relaxed">
            {t("whySoloDesk.description")}
          </p>
        </div>
      </div>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
        {principles.map((principle) => {
          const Icon = principleIconMap[principle.id];
          const title = t(`whySoloDesk.principles.${principle.id}.title`);
          const description = t(
            `whySoloDesk.principles.${principle.id}.description`,
          );

          return (
            <div
              key={principle.id}
              className="group border-t border-border/70 pt-6 transition-colors hover:border-foreground/30"
            >
              <div className="flex items-center gap-2.5 mb-2.5">
                <Icon
                  className="size-4 text-muted-foreground transition-colors group-hover:text-foreground shrink-0"
                  aria-hidden="true"
                />
                <h3 className="font-sans text-sm sm:text-base font-medium text-foreground tracking-tight">
                  {title}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
