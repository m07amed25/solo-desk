import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export async function ClosingSection() {
  const t = await getTranslations("Landing");
  const c = await getTranslations("Common");

  return (
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
  );
}
