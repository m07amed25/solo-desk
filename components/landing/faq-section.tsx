import { getTranslations } from "next-intl/server";
import { Faq5 } from "@/components/ui/faq-5";
import { faqItems } from "@/lib/site-content";

export async function FaqSection() {
  const t = await getTranslations("Landing");
  const n = await getTranslations("Navigation");

  return (
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
  );
}
