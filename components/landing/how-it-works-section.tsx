import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { journeySteps } from "@/lib/site-content";
import { StatusBadge } from "@/components/landing/status-badge";

export async function HowItWorksSection() {
  const t = await getTranslations("Landing");
  const c = await getTranslations("Common");

  return (
    <section
      id="how-it-works"
      className="site-section site-container"
      aria-labelledby="workflow-heading"
    >
      <div className="section-intro">
        <div>
          <h2 id="workflow-heading" className="section-title">
            {t("howItWorks.heading")}
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground text-base leading-relaxed">
            {t("howItWorks.description")}
          </p>
        </div>
      </div>
      <div
        data-journey
        className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10"
      >
        {journeySteps.map((step) => {
          const title = t(`howItWorks.steps.${step.id}.title`);
          const description = t(`howItWorks.steps.${step.id}.description`);

          return (
            <div
              key={step.id}
              data-journey-step
              className="group flex flex-col border-t border-border/70 pt-5 transition-colors hover:border-foreground/30"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs font-medium text-muted-foreground/80 tracking-wider">
                  <bdi>{String(step.step).padStart(2, "0")}</bdi>
                </span>
                <StatusBadge
                  status={step.status}
                  variant="quiet"
                  availableLabel={t("tour.statusAvailable")}
                  inDevelopmentLabel={t("tour.statusInDevelopment")}
                  plannedLabel={t("tour.statusPlanned")}
                />
              </div>
              <h3 className="font-sans text-sm font-medium text-foreground tracking-tight">
                {title}
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          );
        })}
      </div>
      <div className="mt-12 flex justify-center">
        <a href="/sign-up" className={buttonVariants({ size: "lg" })}>
          {c("getStarted")}
          <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
