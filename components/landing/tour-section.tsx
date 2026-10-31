import { getMessages, getTranslations } from "next-intl/server";
import { ProductTour } from "@/components/product-tour";

export async function TourSection() {
  const t = await getTranslations("Landing");

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

  return (
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
  );
}
