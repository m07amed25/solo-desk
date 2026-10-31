import { getTranslations } from "next-intl/server";
import { Check, EyeOff, Lock, ShieldCheck } from "lucide-react";
import { securityCommitments } from "@/lib/site-content";

const securityIconMap = {
  noTrackers: EyeOff,
  tenantIsolation: Lock,
  encryption: ShieldCheck,
  disclaimer: Check,
} as const;

export async function SecuritySection() {
  const t = await getTranslations("Landing");

  return (
    <section
      id="security"
      className="site-section site-container"
      aria-labelledby="security-heading"
    >
      <div className="section-intro">
        <div>
          <h2 id="security-heading" className="section-title">
            {t("security.heading")}
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground text-base leading-relaxed">
            {t("security.description")}
          </p>
        </div>
      </div>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
        {securityCommitments.map((commitment) => {
          const Icon = securityIconMap[commitment.id];
          const title = t(`security.commitments.${commitment.id}Title`);
          const description = t(
            `security.commitments.${commitment.id}Desc`,
          );

          return (
            <div
              key={commitment.id}
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
