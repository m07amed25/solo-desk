import { getTranslations } from "next-intl/server";
import {
  Building2,
  Cloud,
  Coins,
  Command,
  Languages,
  Percent,
  SunMoon,
  Timer,
} from "lucide-react";
import { featureGrid } from "@/lib/site-content";
import { StatusBadge } from "@/components/landing/status-badge";

const featureIconMap = {
  shortcuts: Command,
  timer: Timer,
  saveStatus: Cloud,
  multiCurrency: Coins,
  taxDiscount: Percent,
  workspaces: Building2,
  bilingual: Languages,
  themes: SunMoon,
} as const;

export async function FeaturesSection() {
  const t = await getTranslations("Landing");

  return (
    <section
      id="features"
      className="site-section site-container"
      aria-labelledby="features-heading"
    >
      <div className="section-intro">
        <div>
          <h2 id="features-heading" className="section-title">
            {t("features.heading")}
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground text-base leading-relaxed">
            {t("features.description")}
          </p>
        </div>
      </div>
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
        {featureGrid.map((feature) => {
          const Icon = featureIconMap[feature.id];
          const title = t(`features.items.${feature.id}.title`);
          const description = t(`features.items.${feature.id}.description`);

          return (
            <div
              key={feature.id}
              className="group flex flex-col border-t border-border/70 pt-4 transition-colors hover:border-foreground/30"
            >
              <div className="flex items-center justify-between mb-3">
                <Icon
                  className="size-4 text-muted-foreground transition-colors group-hover:text-foreground"
                  aria-hidden="true"
                />
                <StatusBadge
                  status={feature.status}
                  variant="quiet"
                  availableLabel={t("tour.statusAvailable")}
                  inDevelopmentLabel={t("tour.statusInDevelopment")}
                  plannedLabel={t("tour.statusPlanned")}
                />
              </div>
              <h3 className="font-sans text-sm font-medium text-foreground tracking-tight">
                {title}
              </h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
