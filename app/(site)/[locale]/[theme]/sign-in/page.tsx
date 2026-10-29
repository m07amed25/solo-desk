import { getTranslations } from "next-intl/server";
import { AuthEntryPage } from "@/components/auth-entry-page";

export async function generateMetadata() {
  return { title: `${(await getTranslations("Auth"))("signInHeading")} · SoloDesk` };
}
export default function SignInPage({searchParams}: {searchParams: Promise<Record<string, string | string[] | undefined>>}) {
  return <AuthEntryPage entry="sign-in" searchParams={searchParams} />;
}
