import { getTranslations } from "next-intl/server";
import { LandingPage } from "@/components/landing-page";

export async function generateMetadata() {
  const t = await getTranslations("Landing");
  return { title: t("meta"), description: t("description") };
}
export default function Home() { return <LandingPage />; }
