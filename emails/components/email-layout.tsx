import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "react-email";
import type { ReactNode } from "react";

export default function EmailLayout({
  preview,
  children,
}: {
  preview: string;
  children: ReactNode;
}) {
  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <style>{`@media (prefers-color-scheme: dark) {
          .email-body { background: #000000 !important; }
          .email-card { background: #141414 !important; border-color: #303030 !important; color: #ffffff !important; }
          .email-muted { color: #b3b3b3 !important; }
          .email-panel { background: #242424 !important; color: #ffffff !important; }
          .email-button { background: #ffffff !important; color: #000000 !important; }
        }`}</style>
      </Head>
      <Preview>{preview}</Preview>
      <Body
        className="email-body"
        style={{
          backgroundColor: "#f7f7f7",
          margin: 0,
          padding: "40px 12px",
          fontFamily: "Geist, sans-serif",
          color: "#000000",
        }}
      >
        <Container
          className="email-card"
          style={{
            maxWidth: "560px",
            backgroundColor: "#ffffff",
            border: "1px solid #e3e3e3",
            borderRadius: "12px",
          }}
        >
          <Section style={{ padding: "28px 28px 0" }}>
            <Text
              style={{
                margin: 0,
                fontSize: "24px",
                fontWeight: 700,
                letterSpacing: "-1px",
              }}
            >
              SoloDesk
            </Text>
            <Text
              className="email-muted"
              style={{
                color: "#666666",
                fontSize: "13px",
                margin: "4px 0 24px",
              }}
            >
              Your work. Your space.
            </Text>
            <Hr style={{ borderColor: "#e3e3e3", margin: 0 }} />
          </Section>
          <Section style={{ padding: "28px" }}>{children}</Section>
          <Section style={{ padding: "0 28px 24px" }}>
            <Hr style={{ borderColor: "#e3e3e3", margin: "0 0 16px" }} />
            <Text
              className="email-muted"
              style={{
                color: "#666666",
                fontSize: "12px",
                lineHeight: "20px",
                margin: 0,
              }}
            >
              Sent by SoloDesk. Keep your work moving.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
