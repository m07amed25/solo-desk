import { getTranslations } from "next-intl/server";
import { Briefcase, Code2, Users2 } from "lucide-react";
import { audienceProfiles } from "@/lib/site-content";

const audienceIconMap = {
  freelance: Code2,
  consultant: Briefcase,
  agency: Users2,
} as const;

export async function AudienceSection() {
  const t = await getTranslations("Landing");

  return (
    <section
      id="audience"
      className="site-section site-container"
      aria-labelledby="audience-heading"
    >
      <div className="section-intro">
        <div>
          <h2 id="audience-heading" className="section-title">
            {t("audience.heading")}
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground text-base leading-relaxed">
            {t("audience.description")}
          </p>
        </div>
      </div>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-x-8 lg:gap-x-12 gap-y-10">
        {audienceProfiles.map((profile) => {
          const Icon = audienceIconMap[profile.id];
          const title = t(`audience.profiles.${profile.id}.title`);
          const description = t(
            `audience.profiles.${profile.id}.description`,
          );

          return (
            <div
              key={profile.id}
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
