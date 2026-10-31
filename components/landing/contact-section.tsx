import { getMessages, getTranslations } from "next-intl/server";
import { ContactWithGlobe } from "@/components/ui/contact-with-globe";
import type { ContactForm } from "@/components/contact-form";

export async function ContactSection() {
  const t = await getTranslations("Landing");
  const n = await getTranslations("Navigation");

  const allMessages = (await getMessages()) as unknown as {
    Landing: {
      contact: {
        form: Parameters<typeof ContactForm>[0]["messages"];
      };
    };
  };

  const contactMessages = allMessages.Landing.contact.form;

  return (
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
  );
}
