import "server-only";
import nodemailer from "nodemailer";
import { render, toPlainText } from "react-email";
import type { ReactElement } from "react";
import ContactMessage from "../emails/contact-message";
import ContactReceipt from "../emails/contact-receipt";
import type { ValidatedContactInput } from "./contact";

let transporter: ReturnType<typeof nodemailer.createTransport> | undefined;

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

export async function sendEmail({
  to,
  subject,
  template,
  replyTo,
  messageId,
}: {
  to: string;
  subject: string;
  template: ReactElement;
  replyTo?: string;
  messageId?: string;
}) {
  const from = requiredEnv("SMTP_FROM");
  if (!transporter) {
    const port = Number(requiredEnv("SMTP_PORT"));
    const secure = requiredEnv("SMTP_SECURE");
    if (
      !Number.isInteger(port) ||
      port < 1 ||
      port > 65535 ||
      !["true", "false"].includes(secure)
    ) {
      throw new Error("Invalid SMTP configuration");
    }
    transporter = nodemailer.createTransport({
      host: requiredEnv("SMTP_HOST"),
      port,
      secure: secure === "true",
      requireTLS: secure !== "true",
      auth: {
        user: requiredEnv("SMTP_USER"),
        pass: requiredEnv("SMTP_PASSWORD").replace(/\s/g, ""),
      },
      connectionTimeout: 4000,
      greetingTimeout: 4000,
      socketTimeout: 5000,
      disableFileAccess: true,
      disableUrlAccess: true,
    });
  }
  const html = await render(template);
  const result = await transporter.sendMail({
    from: { name: "SoloDesk", address: from },
    to: { address: to, name: "" },
    replyTo: replyTo ? { address: replyTo, name: "" } : undefined,
    subject,
    html,
    text: toPlainText(html),
    messageId,
  });
  if (!result.accepted?.length || result.rejected?.length)
    throw new Error("Email was not accepted");
}

export async function sendContactEmail(data: ValidatedContactInput) {
  const inbox = requiredEnv("SOLODESK_CONTACT_RECIPIENT_EMAIL");
  await sendEmail({
    to: inbox,
    subject: `SoloDesk inquiry: ${data.topic}`,
    replyTo: data.email,
    template: <ContactMessage {...data} />,
  });
  await sendEmail({
    to: data.email,
    subject: "We received your message — SoloDesk",
    replyTo: inbox,
    template: <ContactReceipt {...data} replyEmail={inbox} />,
  });
}
