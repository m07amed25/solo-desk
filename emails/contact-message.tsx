import { Button, Heading, Section, Text } from "react-email";
import type { ValidatedContactInput } from "../lib/contact";
import EmailLayout from "./components/email-layout";

export type ContactMessageProps = Pick<
  ValidatedContactInput,
  "name" | "email" | "topic" | "message"
> & { audience?: "team" | "client"; replyEmail?: string };

export default function ContactMessage({
  name = ContactMessage.PreviewProps.name,
  email = ContactMessage.PreviewProps.email,
  topic = ContactMessage.PreviewProps.topic,
  message = ContactMessage.PreviewProps.message,
  audience = "team",
  replyEmail = email,
}: ContactMessageProps) {
  return (
    <EmailLayout preview={audience === "client" ? "We received your message. Here is your copy." : `A new ${topic} inquiry from ${name}`}>
      <Text
        className="email-muted"
        style={{ margin: "0 0 8px", color: "#666666", fontSize: "13px" }}
      >
        {audience === "client" ? "Your message / " : "Website inquiry / "}{topic}
      </Text>
      <Heading
        as="h1"
        style={{
          margin: "0 0 20px",
          fontSize: "30px",
          lineHeight: "36px",
          letterSpacing: "-1px",
        }}
      >
        {audience === "client" ? "Your message is with us." : "A new conversation."}
      </Heading>
      {audience === "client" && <Text style={{ fontSize: "16px", lineHeight: "26px", margin: "0 0 24px" }}>Thanks for getting in touch, <bdi>{name}</bdi>. Here’s a copy of your inquiry. We’ll review it and get back to you.</Text>}
      <Text style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 700 }}>
        <bdi>{name}</bdi>
      </Text>
      <Text
        className="email-muted"
        style={{ margin: "0 0 24px", color: "#666666", fontSize: "14px" }}
      >
        <bdi>{email}</bdi>
      </Text>
      <Section
        className="email-panel"
        style={{
          padding: "20px",
          backgroundColor: "#f7f7f7",
          borderRadius: "8px",
        }}
      >
        <Text
          dir="auto"
          style={{
            margin: 0,
            fontSize: "16px",
            lineHeight: "26px",
            whiteSpace: "pre-wrap",
            overflowWrap: "anywhere",
          }}
        >
          {message}
        </Text>
      </Section>
      <Button
        className="email-button"
        href={`mailto:${encodeURIComponent(replyEmail)}`}
        style={{
          marginTop: "24px",
          padding: "14px 22px",
          backgroundColor: "#000000",
          color: "#ffffff",
          borderRadius: "6px",
          fontSize: "14px",
          fontWeight: 700,
        }}
      >
        {audience === "client" ? "Reply to SoloDesk" : `Reply to ${name}`}
      </Button>
      <Text
        className="email-muted"
        style={{
          color: "#666666",
          fontSize: "12px",
          lineHeight: "20px",
          margin: "16px 0 0",
        }}
      >
        {audience === "client" ? "You received this copy because your email was entered in the SoloDesk contact form. If this wasn’t you, you can ignore it." : "Reply goes directly to the person who contacted you."}
      </Text>
    </EmailLayout>
  );
}

ContactMessage.PreviewProps = {
  name: "Alex Morgan",
  email: "alex@example.com",
  topic: "team",
  message:
    "Hi SoloDesk,\n\nWe’re a small design studio looking for a calmer way to manage projects, time, and invoices. Could you tell us more about team workspaces?\n\nThanks,\nAlex",
} satisfies ContactMessageProps;
