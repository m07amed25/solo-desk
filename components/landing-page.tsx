import Image from "next/image";
import { cacheLife } from "next/cache";
import { getMessages, getTranslations } from "next-intl/server";
import {
  ArrowUpRight,
  Briefcase,
  Building2,
  Calculator,
  Check,
  Clock3,
  Cloud,
  Code2,
  Coins,
  Command,
  EyeOff,
  FileText,
  FolderKanban,
  Languages,
  Lock,
  Percent,
  RefreshCw,
  ShieldCheck,
  SunMoon,
  Timer,
  Users2,
  Zap,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Faq5 } from "@/components/ui/faq-5";
import { SiteHeader } from "@/components/site-header";
import { LandingMotion } from "@/components/landing-motion";
import { ProductTour } from "@/components/product-tour";
import { ContactWithGlobe } from "@/components/ui/contact-with-globe";
import type { ContactForm } from "@/components/contact-form";
import {
  featureGrid,
  journeySteps,
  principles,
  faqItems,
  audienceProfiles,
  securityCommitments,
  heroHighlights,
  previewProjects,
  type AvailabilityStatus,
} from "@/lib/site-content";
import { FooterNewsletterForm } from "@/components/footer-newsletter-form";

async function WorkPreview() {
  const t = await getTranslations("Landing");
  return (
    <figure className="work-preview">
      <div className="preview-topbar">
        <span className="flex items-center gap-2 font-medium">
          <Image
            src="/solodesk_no_bg_no_text.png"
            width={20}
            height={20}
            alt=""
          />
          <bdi>SoloDesk</bdi>
        </span>
        <span className="text-muted-foreground">{t("week")}</span>
      </div>
      <div className="preview-body">
        <aside className="preview-sidebar" aria-hidden="true">
          <FolderKanban />
          <Clock3 />
          <FileText />
        </aside>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-8">
            <h2 className="text-xl font-medium sm:text-2xl">{t("overview")}</h2>
            <span className="text-xs text-muted-foreground">
              {t("previewShort")}
            </span>
          </div>
          <div className="project-grid project-table-head">
            <span>{t("project")}</span>
            <span>{t("status")}</span>
            <span>{t("time")}</span>
          </div>
          {previewProjects.map((project) => (
            <div key={project.name} className="project-grid project-row">
              <span className="font-medium">{t(project.name)}</span>
              <span className="text-muted-foreground">{t(project.status)}</span>
              <span className="font-mono tabular-nums">
                <bdi>
                  {t("hours", {
                    hours: project.hours,
                    minutes: project.minutes,
                  })}
                </bdi>
              </span>
            </div>
          ))}
          <div className="preview-summary">
            <Clock3 aria-hidden="true" className="size-5" />
            <span>{t("focus")}</span>
            <span className="ms-auto font-mono text-xl tabular-nums">
              <bdi>{t("hours", { hours: 22, minutes: 45 })}</bdi>
            </span>
          </div>
        </div>
      </div>
      <figcaption>{t("preview")}</figcaption>
    </figure>
  );
}

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

const principleIconMap = {
  exactness: Calculator,
  speed: Zap,
  transparency: RefreshCw,
  privacy: ShieldCheck,
} as const;

const audienceIconMap = {
  freelance: Code2,
  consultant: Briefcase,
  agency: Users2,
} as const;

const securityIconMap = {
  noTrackers: EyeOff,
  tenantIsolation: Lock,
  encryption: ShieldCheck,
  disclaimer: Check,
} as const;

const highlightIconMap = {
  multiCurrency: Coins,
  recoverableTime: Clock3,
  bilingual: Languages,
} as const;

function StatusBadge({
  status,
  availableLabel,
  inDevelopmentLabel,
  plannedLabel,
  variant = "badge",
}: {
  status: AvailabilityStatus;
  availableLabel: string;
  inDevelopmentLabel: string;
  plannedLabel: string;
  variant?: "badge" | "quiet";
}) {
  if (variant === "quiet") {
    switch (status) {
      case "available":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="size-1.5 rounded-full bg-emerald-500/80 inline-block"
              aria-hidden="true"
            />
            <span>{availableLabel}</span>
          </span>
        );
      case "inDevelopment":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="size-1.5 rounded-full bg-amber-500/80 inline-block"
              aria-hidden="true"
            />
            <span>{inDevelopmentLabel}</span>
          </span>
        );
      case "planned":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/75">
            <span
              className="size-1.5 rounded-full bg-muted-foreground/40 inline-block"
              aria-hidden="true"
            />
            <span>{plannedLabel}</span>
          </span>
        );
    }
  }

  switch (status) {
    case "available":
      return (
        <Badge variant="default" className="gap-1.5">
          <span className="size-1.5 rounded-full bg-emerald-400 inline-block" />
          <span>{availableLabel}</span>
        </Badge>
      );
    case "inDevelopment":
      return (
        <Badge variant="secondary" className="gap-1.5">
          <span className="size-1.5 rounded-full bg-amber-400 inline-block" />
          <span>{inDevelopmentLabel}</span>
        </Badge>
      );
    case "planned":
    default:
      return (
        <Badge variant="outline" className="gap-1.5">
          <span className="size-1.5 rounded-full bg-muted-foreground/60 inline-block" />
          <span>{plannedLabel}</span>
        </Badge>
      );
  }
}

async function getCurrentYear() {
  "use cache";
  cacheLife("max");
  return new Date().getFullYear();
}

export async function LandingPage() {
  const t = await getTranslations("Landing");
  const c = await getTranslations("Common");
  const n = await getTranslations("Navigation");
  const currentYear = await getCurrentYear();

  const allMessages = (await getMessages()) as unknown as {
    Landing: {
      tour: {
        heading: string;
        statusAvailable: string;
        statusInDevelopment: string;
        statusPlanned: string;
        clients: { title: string; outcome: string; details: string[] };
        projects: { title: string; outcome: string; details: string[] };
        time: { title: string; outcome: string; details: string[] };
        invoices: { title: string; outcome: string; details: string[] };
        insights: { title: string; outcome: string; details: string[] };
      };
      contact: {
        form: Parameters<typeof ContactForm>[0]["messages"];
      };
    };
  };

  const tourMessages = {
    heading: allMessages.Landing.tour.heading,
    statusAvailable: allMessages.Landing.tour.statusAvailable,
    statusInDevelopment: allMessages.Landing.tour.statusInDevelopment,
    statusPlanned: allMessages.Landing.tour.statusPlanned,
    previewNote: t("previewShort"),
    clients: allMessages.Landing.tour.clients,
    projects: allMessages.Landing.tour.projects,
    time: allMessages.Landing.tour.time,
    invoices: allMessages.Landing.tour.invoices,
    insights: allMessages.Landing.tour.insights,
  };

  const contactMessages = allMessages.Landing.contact.form;

  return (
    <>
      <SiteHeader />
      <LandingMotion>
        {/* Section 1: Hero */}
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

        {/* Section 2: Highlights Strip */}
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

        {/* Section 3: Product Tour */}
        <section
          id="tour"
          className="site-section site-container"
          aria-labelledby="tour-heading"
        >
          <div className="section-intro">
            <div>
              <h2 id="tour-heading" className="section-title">
                {t("tour.heading")}
              </h2>
              <p className="mt-3 max-w-xl text-muted-foreground text-base leading-relaxed">
                {t("tour.description")}
              </p>
            </div>
          </div>
          <div className="mt-8">
            <ProductTour messages={tourMessages} />
          </div>
        </section>

        {/* Section 4: Detailed Technical Features Grid */}
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

        {/* Section 5: How It Works Journey */}
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

        {/* Section 6: Why SoloDesk (Principles) */}
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

        {/* Section 7: Plain-language Privacy & Security Commitments */}
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

        {/* Section 8: Audience Profiles */}
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

        {/* Section 10: Frequently Asked Questions (Minimal & Quiet Faq5) */}
        <Faq5
          id="faq"
          className="site-section site-container"
          badge={n("faq")}
          heading={t("faq.heading")}
          description={t("faq.description")}
          columns={2}
          faqs={faqItems.map((item) => ({
            question: t(`faq.questions.${item.id}.q`),
            answer: t(`faq.questions.${item.id}.a`),
          }))}
        />

        {/* Section 11: Visitor Contact Form with Interactive Globe */}
        <ContactWithGlobe
          id="contact"
          subtitle={n("contact")}
          title={t("contact.heading")}
          description={t("contact.description")}
          labels={{
            fullNameLabel: contactMessages.nameLabel,
            fullNamePlaceholder: contactMessages.namePlaceholder,
            emailLabel: contactMessages.emailLabel,
            emailPlaceholder: contactMessages.emailPlaceholder,
            messageLabel: contactMessages.messageLabel,
            messagePlaceholder: contactMessages.messagePlaceholder,
            submitButton: contactMessages.submitButton,
            submittingButton: contactMessages.submitting,
            successTitle: contactMessages.successTitle,
            successMessage: contactMessages.successMessage,
            sendAnotherButton: contactMessages.sendAnother,
            consentLabel: contactMessages.consentLabel,
            unavailable: contactMessages.unavailable,
            validationError: contactMessages.errors.generic,
            rateLimited: contactMessages.rateLimited,
          }}
        />

        {/* Section 12: Closing Call to Action */}
        <section
          id="closing"
          className="closing site-container"
          aria-labelledby="closing-heading"
        >
          <div className="max-w-xl mx-auto flex flex-col items-center text-center">
            <h2
              id="closing-heading"
              className="whitespace-pre-line text-2xl sm:text-3xl font-medium tracking-tight text-foreground leading-snug"
            >
              {t("closing")}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md">
              {t("closingBody")}
            </p>
            <div className="mt-7 flex flex-col items-center gap-2.5">
              <a
                href="/sign-up"
                className={cn(
                  buttonVariants({ size: "default" }),
                  "h-9 px-4 text-xs sm:text-sm font-medium",
                )}
              >
                {c("getStarted")}
                <ArrowUpRight
                  data-icon="inline-end"
                  className="size-3.5 transition-transform duration-200 group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5"
                  aria-hidden="true"
                />
              </a>
              <p className="text-xs text-muted-foreground/75">
                {t("accountAvailable")}
              </p>
            </div>
          </div>
        </section>
      </LandingMotion>

      {/* Section 13: Acme-Style Modern Dark Footer */}
      <footer className="relative border-t border-border/40 mt-20 md:mt-28 bg-background overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-16 sm:pt-20 pb-8 sm:pb-12">
          {/* Top row: Brand & Newsletter + 4 Navigation Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 pb-14 sm:pb-16">
            {/* Left Column: Brand & Newsletter */}
            <div className="lg:col-span-5 flex flex-col items-start">
              <a
                href="/"
                className="inline-flex items-center gap-2 text-foreground group"
              >
                <Image
                  src="/solodesk_no_bg_no_text.png"
                  alt=""
                  width={18}
                  height={18}
                  className="size-4.5 object-contain"
                />
                <span className="font-semibold text-foreground text-base tracking-tight">
                  SoloDesk
                </span>
              </a>

              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mt-4">
                The platform for teams that ship. Subscribe to get product
                updates, once a month. No spam.
              </p>

              <FooterNewsletterForm />
            </div>

            {/* Right Columns: 4 Navigation Columns */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-8">
              {/* Product */}
              <div className="flex flex-col gap-3.5">
                <h3 className="text-sm font-semibold text-foreground tracking-tight">
                  Product
                </h3>
                <nav
                  aria-label="Product links"
                  className="flex flex-col gap-2.5 text-sm"
                >
                  <a
                    href="/#features"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Features
                  </a>
                  <a
                    href="/#how-it-works"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Pricing
                  </a>
                  <a
                    href="/#tour"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Integrations
                  </a>
                  <a
                    href="/#roadmap"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Changelog
                  </a>
                  <a
                    href="/#roadmap"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Roadmap
                  </a>
                </nav>
              </div>

              {/* Company */}
              <div className="flex flex-col gap-3.5">
                <h3 className="text-sm font-semibold text-foreground tracking-tight">
                  Company
                </h3>
                <nav
                  aria-label="Company links"
                  className="flex flex-col gap-2.5 text-sm"
                >
                  <a
                    href="/#why-solodesk"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    About
                  </a>
                  <a
                    href="/#tour"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Blog
                  </a>
                  <a
                    href="/#contact"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Careers
                  </a>
                  <a
                    href="/#audience"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Customers
                  </a>
                  <a
                    href="/#contact"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Contact
                  </a>
                </nav>
              </div>

              {/* Resources */}
              <div className="flex flex-col gap-3.5">
                <h3 className="text-sm font-semibold text-foreground tracking-tight">
                  Resources
                </h3>
                <nav
                  aria-label="Resources links"
                  className="flex flex-col gap-2.5 text-sm"
                >
                  <a
                    href="/#tour"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Documentation
                  </a>
                  <a
                    href="/#how-it-works"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Guides
                  </a>
                  <a
                    href="/#security"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    API reference
                  </a>
                  <a
                    href="/#contact"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Community
                  </a>
                  <a
                    href="/#security"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Status
                  </a>
                </nav>
              </div>

              {/* Legal */}
              <div className="flex flex-col gap-3.5">
                <h3 className="text-sm font-semibold text-foreground tracking-tight">
                  Legal
                </h3>
                <nav
                  aria-label="Legal links"
                  className="flex flex-col gap-2.5 text-sm"
                >
                  <a
                    href="/#security"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Privacy
                  </a>
                  <a
                    href="/#security"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Terms
                  </a>
                  <a
                    href="/#security"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Security
                  </a>
                  <a
                    href="/#security"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cookies
                  </a>
                </nav>
              </div>
            </div>
          </div>

          {/* Sub-Footer Divider & Metadata Bar */}
          <div className="border-t border-border/40 pt-8 pb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-muted-foreground">
            {/* Copyright & System Status */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <span>© {currentYear} SoloDesk, Inc.</span>
              <div className="inline-flex items-center gap-2">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-xs sm:text-sm">
                  All systems operational
                </span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-5 text-muted-foreground">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground transition-colors p-1 -m-1"
                aria-label="GitHub"
              >
                <svg
                  className="size-4.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground transition-colors p-1 -m-1"
                aria-label="X (Twitter)"
              >
                <svg
                  className="size-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground transition-colors p-1 -m-1"
                aria-label="LinkedIn"
              >
                <svg
                  className="size-4.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground transition-colors p-1 -m-1"
                aria-label="YouTube"
              >
                <svg
                  className="size-4.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Giant Backdrop Watermark Typography */}
          <div className="w-full flex justify-center items-center overflow-hidden pointer-events-none select-none pt-4 sm:pt-8 -mb-4 sm:-mb-8 md:-mb-12">
            <span className="text-[17vw] sm:text-[18vw] lg:text-[230px] font-black tracking-tighter text-foreground/[0.04] dark:text-foreground/[0.04] leading-none select-none">
              SoloDesk
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
