import { getTranslations } from "next-intl/server";
import { AuthEntryPage } from "@/components/auth-entry-page";

export async function generateMetadata() {
  return { title: `${(await getTranslations("Auth"))("signUpHeading")} · SoloDesk` };
}
export default function SignUpPage({searchParams}: {searchParams: Promise<Record<string, string | string[] | undefined>>}) {
  return <AuthEntryPage entry="sign-up" searchParams={searchParams} />;
}
